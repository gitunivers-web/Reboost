import { useEffect, useState, useCallback, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useSocket } from "./useSocket";
import { useUser } from "./use-user";
import type { ChatMessage } from "@shared/schema";

interface UseChatMessagesOptions {
  conversationId: string;
  onNewMessage?: (message: ChatMessage) => void;
  onTyping?: (data: { userId: string; username: string }) => void;
  onStoppedTyping?: (data: { userId: string }) => void;
}

interface UseChatMessagesReturn {
  sendMessage: (content: string, fileUrl?: string, fileName?: string) => void;
  startTyping: () => void;
  stopTyping: () => void;
  isTyping: boolean;
  typingUsers: Array<{ userId: string; username: string }>;
}

export function useChatMessages({
  conversationId,
  onNewMessage,
  onTyping,
  onStoppedTyping,
}: UseChatMessagesOptions): UseChatMessagesReturn {
  const { socket, connected } = useSocket();
  const queryClient = useQueryClient();
  const { data: currentUser } = useUser();
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Array<{ userId: string; username: string }>>([]);
  const typingTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  useEffect(() => {
    if (!socket || !connected || !conversationId) return;

    socket.emit("chat:join-conversation", conversationId);

    const handleNewMessage = (message: ChatMessage) => {
      queryClient.invalidateQueries({
        queryKey: ['chat', 'messages', conversationId],
      });
      if (currentUser?.id) {
        queryClient.invalidateQueries({
          queryKey: ['chat', 'conversations', 'user', currentUser.id],
        });
        queryClient.invalidateQueries({
          queryKey: ['chat', 'unread', 'user', currentUser.id],
        });
      }
      queryClient.invalidateQueries({
        queryKey: ['chat', 'unread', 'conversation', conversationId],
      });

      if (onNewMessage) {
        onNewMessage(message);
      }
    };

    const handleUserTyping = (data: { userId: string; isTyping: boolean }) => {
      if (data.isTyping) {
        setTypingUsers((prev) => {
          const exists = prev.some((u) => u.userId === data.userId);
          if (!exists) {
            return [...prev, { userId: data.userId, username: '' }];
          }
          return prev;
        });

        if (onTyping) {
          onTyping({ userId: data.userId, username: '' });
        }
      } else {
        setTypingUsers((prev) => prev.filter((u) => u.userId !== data.userId));

        if (onStoppedTyping) {
          onStoppedTyping({ userId: data.userId });
        }
      }
    };

    const handleMessageRead = (data: { conversationId: string }) => {
      if (data.conversationId === conversationId) {
        queryClient.invalidateQueries({
          queryKey: ['chat', 'messages', conversationId],
        });
        queryClient.invalidateQueries({
          queryKey: ['chat', 'unread', 'conversation', conversationId],
        });
        if (currentUser?.id) {
          queryClient.invalidateQueries({
            queryKey: ['chat', 'conversations', 'user', currentUser.id],
          });
          queryClient.invalidateQueries({
            queryKey: ['chat', 'unread', 'user', currentUser.id],
          });
        }
      }
    };

    socket.on("chat:new-message", handleNewMessage);
    socket.on("chat:user-typing", handleUserTyping);
    socket.on("chat:messages-read", handleMessageRead);

    return () => {
      socket.emit("chat:leave-conversation", conversationId);
      socket.off("chat:new-message", handleNewMessage);
      socket.off("chat:user-typing", handleUserTyping);
      socket.off("chat:messages-read", handleMessageRead);

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [socket, connected, conversationId, queryClient, currentUser, onNewMessage, onTyping, onStoppedTyping]);

  const sendMessage = useCallback(
    (content: string, fileUrl?: string, fileName?: string) => {
      if (!socket || !connected) {
        console.error("Socket not connected");
        return;
      }

      // Optimistic update: ajouter le message immédiatement au cache
      const optimisticMessage: ChatMessage = {
        id: `temp-${Date.now()}`,
        conversationId,
        senderId: currentUser?.id || '',
        senderType: currentUser?.role === 'admin' ? 'admin' : 'user',
        content,
        messageType: 'text',
        isRead: true, // Le message de l'expéditeur est toujours "lu" pour lui
        readAt: new Date(), // Marqué comme lu maintenant
        createdAt: new Date(),
        fileUrl: fileUrl || null,
        fileName: fileName || null,
      };

      // Mettre à jour le cache React Query avec le message optimiste
      queryClient.setQueryData(
        ['chat', 'messages', conversationId],
        (oldData: ChatMessage[] | undefined) => {
          if (!oldData) return [optimisticMessage];
          return [...oldData, optimisticMessage];
        }
      );

      // Envoyer le message via socket
      socket.emit("chat:send-message", {
        conversationId,
        content,
        fileUrl,
      });
    },
    [socket, connected, conversationId, queryClient, currentUser]
  );

  const startTyping = useCallback(() => {
    if (!socket || !connected) return;

    setIsTyping(true);
    socket.emit("chat:typing", { conversationId, isTyping: true });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      stopTyping();
    }, 3000);
  }, [socket, connected, conversationId]);

  const stopTyping = useCallback(() => {
    if (!socket || !connected) return;

    setIsTyping(false);
    socket.emit("chat:typing", { conversationId, isTyping: false });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  }, [socket, connected, conversationId]);

  return {
    sendMessage,
    startTyping,
    stopTyping,
    isTyping,
    typingUsers,
  };
}
