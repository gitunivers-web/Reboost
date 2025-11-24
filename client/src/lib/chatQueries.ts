import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "./queryClient";
import type { ChatConversation, ChatMessage, InsertChatConversation, InsertChatMessage, ChatPresence, InsertChatPresence } from "@shared/schema";

export const useConversations = (userId: string) => {
  return useQuery<ChatConversation[]>({
    queryKey: ["/api/chat/conversations", userId],
    enabled: !!userId,
  });
};

export const useConversation = (conversationId: string) => {
  return useQuery<ChatConversation>({
    queryKey: ["/api/chat/conversations", conversationId],
    enabled: !!conversationId,
  });
};

export const useMessages = (conversationId: string) => {
  return useQuery<ChatMessage[]>({
    queryKey: ["/api/chat/messages", conversationId],
    enabled: !!conversationId,
  });
};

export const useUnreadCount = (conversationId: string) => {
  return useQuery<{ count: number }>({
    queryKey: ["/api/chat/unread", conversationId],
    enabled: !!conversationId,
  });
};

export const usePresence = (userId: string) => {
  return useQuery<ChatPresence>({
    queryKey: ["/api/chat/presence", userId],
    enabled: !!userId,
  });
};

export const useOnlineUsers = () => {
  return useQuery<ChatPresence[]>({
    queryKey: ["/api/chat/presence/online"],
  });
};

export const useCreateConversation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: InsertChatConversation) => {
      const res = await apiRequest("POST", "/api/chat/conversations", data);
      return await res.json() as ChatConversation;
    },
    onSuccess: (newConversation) => {
      queryClient.invalidateQueries({ 
        queryKey: ["/api/chat/conversations", newConversation.userId] 
      });
    },
  });
};

export const useSendMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: InsertChatMessage) => {
      const res = await apiRequest("POST", "/api/chat/messages", data);
      return await res.json() as ChatMessage;
    },
    onMutate: async (newMessage) => {
      await queryClient.cancelQueries({ 
        queryKey: ["/api/chat/messages", newMessage.conversationId] 
      });

      const previousMessages = queryClient.getQueryData<ChatMessage[]>([
        "/api/chat/messages",
        newMessage.conversationId,
      ]);

      const optimisticMessage: ChatMessage = {
        id: `temp-${Date.now()}`,
        conversationId: newMessage.conversationId,
        senderId: newMessage.senderId,
        senderType: newMessage.senderType,
        content: newMessage.content,
        messageType: newMessage.messageType || "text",
        fileUrl: newMessage.fileUrl || null,
        fileName: newMessage.fileName || null,
        isRead: false,
        readAt: null,
        createdAt: new Date(),
      };

      queryClient.setQueryData<ChatMessage[]>(
        ["/api/chat/messages", newMessage.conversationId],
        (old) => (old ? [...old, optimisticMessage] : [optimisticMessage])
      );

      return { previousMessages };
    },
    onError: (_err, newMessage, context) => {
      if (context?.previousMessages) {
        queryClient.setQueryData(
          ["/api/chat/messages", newMessage.conversationId],
          context.previousMessages
        );
      }
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ["/api/chat/messages", data.conversationId] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ["/api/chat/conversations"] 
      });
    },
  });
};

export const useMarkAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ conversationId, messageIds }: { conversationId: string; messageIds: string[] }) => {
      const res = await apiRequest("PATCH", "/api/chat/messages/read", { conversationId, messageIds });
      return await res.json();
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ["/api/chat/messages", variables.conversationId] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ["/api/chat/unread", variables.conversationId] 
      });
    },
  });
};

export const useUpdatePresence = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: InsertChatPresence) => {
      const res = await apiRequest("PATCH", "/api/chat/presence", data);
      return await res.json() as ChatPresence;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ 
        queryKey: ["/api/chat/presence", data.userId] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ["/api/chat/presence/online"] 
      });
    },
  });
};

export const useAssignConversation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      conversationId, 
      adminId 
    }: { 
      conversationId: string; 
      adminId: string 
    }) => {
      const res = await apiRequest("PATCH", `/api/chat/conversations/${conversationId}/assign`, { adminId });
      return await res.json() as ChatConversation;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ 
        queryKey: ["/api/chat/conversations", data.userId] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ["/api/chat/conversations", data.id] 
      });
    },
  });
};
