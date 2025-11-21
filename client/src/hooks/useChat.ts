import { useEffect, useState, useCallback, useRef } from "react";
import { io, Socket } from "socket.io-client";
import type { Message } from "@shared/schema";

interface ChatMessage extends Omit<Message, 'createdAt'> {
  createdAt: Date | string;
}

interface UseChatOptions {
  room: string;
  userId: string;
  partnerId?: string;
}

export function useChat({ room, userId, partnerId }: UseChatOptions) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isSelfConnected, setIsSelfConnected] = useState(false);
  const [isPartnerOnline, setIsPartnerOnline] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  // Track message IDs to prevent duplicates
  const seenMessageIds = useRef<Set<string>>(new Set());
  // Track typing timeout to prevent memory leaks
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const socketUrl = import.meta.env.PROD
      ? `${window.location.protocol}//${window.location.hostname}`
      : "http://localhost:5000";

    const socket = io(socketUrl, {
      transports: ["websocket", "polling"],
      withCredentials: true
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("[CHAT] Connected to Socket.IO");
      setIsSelfConnected(true);
      socket.emit("join_room", room);
      socket.emit("join_room", `user_${userId}`);
      
      // Request presence state for partner
      if (partnerId) {
        socket.emit("get_presence_state", [partnerId]);
      }
    });

    socket.on("disconnect", () => {
      console.log("[CHAT] Disconnected from Socket.IO");
      setIsSelfConnected(false);
    });

    // Listen for partner's presence updates
    socket.on("user_presence", ({ userId: presenceUserId, isOnline }: { userId: string; isOnline: boolean }) => {
      if (partnerId && presenceUserId === partnerId) {
        setIsPartnerOnline(isOnline);
        console.log(`[PRESENCE] Partner ${partnerId} is now ${isOnline ? 'online' : 'offline'}`);
      }
    });

    // Listen for initial presence state
    socket.on("presence_state", (presenceState: Record<string, boolean>) => {
      if (partnerId && partnerId in presenceState) {
        setIsPartnerOnline(presenceState[partnerId]);
        console.log(`[PRESENCE] Partner ${partnerId} initial state: ${presenceState[partnerId] ? 'online' : 'offline'}`);
      }
    });

    socket.on("receive_message", (data: ChatMessage) => {
      // Deduplication: Check if we've already seen this message
      const messageId = data.id || `${data.senderId}-${data.createdAt}`;
      
      if (!seenMessageIds.current.has(messageId)) {
        seenMessageIds.current.add(messageId);
        setMessages((prev: ChatMessage[]) => {
          // Double-check for duplicates in case of race condition
          const exists = prev.some(msg => 
            (msg.id && msg.id === data.id) || 
            (msg.senderId === data.senderId && msg.createdAt === data.createdAt && msg.content === data.content)
          );
          
          if (exists) {
            return prev;
          }
          
          return [...prev, data];
        });
      }
    });

    socket.on("user_typing", ({ userId: typingUserId, isTyping: typing }: { userId: string; isTyping: boolean }) => {
      if (typingUserId !== userId) {
        setIsTyping(typing);
        
        // Clear existing timeout to prevent memory leak
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
        
        // Auto-clear typing indicator after 3 seconds to prevent stuck state
        if (typing) {
          typingTimeoutRef.current = setTimeout(() => {
            setIsTyping(false);
          }, 3000);
        }
      }
    });

    socket.on("error", (error: { message: string }) => {
      console.error("[CHAT] Socket error:", error);
    });

    // Cleanup function to prevent memory leaks
    return () => {
      // Clear typing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Clean up socket listeners
      socket.off("connect");
      socket.off("disconnect");
      socket.off("receive_message");
      socket.off("user_typing");
      socket.off("user_presence");
      socket.off("presence_state");
      socket.off("error");
      
      // Disconnect socket
      socket.disconnect();
      socketRef.current = null;
      
      // Clear seen messages for this room
      seenMessageIds.current.clear();
    };
  }, [room, userId, partnerId]);

  const sendMessage = useCallback((content: string, receiverId: string) => {
    if (!socketRef.current || !content.trim()) return;

    const messageData = {
      room,
      senderId: userId,
      receiverId,
      content: content.trim(),
      timestamp: new Date()
    };

    socketRef.current.emit("send_message", messageData);
  }, [room, userId]);

  const sendTypingStatus = useCallback((typing: boolean) => {
    if (!socketRef.current) return;

    socketRef.current.emit("typing", {
      room,
      userId,
      isTyping: typing
    });
  }, [room, userId]);

  const markAsRead = useCallback((messageId: string) => {
    if (!socketRef.current) return;
    
    // Debounce mark-as-read to prevent race conditions
    socketRef.current.emit("mark_as_read", messageId);
    
    // Optimistically update local state
    setMessages((prev: ChatMessage[]) => 
      prev.map((msg: ChatMessage) => 
        msg.id === messageId 
          ? { ...msg, isRead: true, readAt: new Date() }
          : msg
      )
    );
  }, []);

  return {
    messages,
    isSelfConnected,
    isPartnerOnline,
    isTyping,
    sendMessage,
    sendTypingStatus,
    markAsRead
  };
}
