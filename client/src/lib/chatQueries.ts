import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest, getApiUrl } from "./queryClient";
import type { ChatConversation, ChatMessage, InsertChatConversation, InsertChatMessage, ChatPresence, InsertChatPresence } from "@shared/schema";

/**
 * Chat Query Keys Structure (for cache management)
 * 
 * Structured keys decouple cache identity from HTTP routes.
 * This allows precise invalidation and works with session-based auth routes.
 * 
 * Key Patterns:
 * - ['chat', 'conversations', 'user', userId] → User's conversations
 * - ['chat', 'conversations', 'detail', conversationId] → Single conversation
 * - ['chat', 'messages', conversationId] → Conversation messages
 * - ['chat', 'unread', 'user', userId] → User's total unread
 * - ['chat', 'unread', 'conversation', conversationId] → Conversation unread
 * - ['chat', 'presence', 'user', userId] → User presence
 * - ['chat', 'presence', 'online'] → Online users
 */

export const useConversations = (userId: string) => {
  return useQuery<ChatConversation[]>({
    queryKey: ['chat', 'conversations', 'user', userId],
    queryFn: async () => {
      const res = await fetch(getApiUrl("/api/chat/conversations"), {
        credentials: "include"
      });
      if (!res.ok) throw new Error("Failed to fetch conversations");
      return res.json();
    },
    enabled: !!userId,
  });
};

export const useAdminConversations = (adminId?: string, status?: string) => {
  return useQuery<ChatConversation[]>({
    queryKey: ['chat', 'conversations', 'admin', adminId, status],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (adminId) params.append('adminId', adminId);
      if (status) params.append('status', status);
      
      const url = `/api/chat/conversations/admin${params.toString() ? `?${params.toString()}` : ''}`;
      const res = await fetch(getApiUrl(url), {
        credentials: "include"
      });
      if (!res.ok) throw new Error("Failed to fetch admin conversations");
      return res.json();
    },
    refetchInterval: 2000,
    refetchIntervalInBackground: true,
  });
};

export const useConversation = (conversationId: string) => {
  return useQuery<ChatConversation>({
    queryKey: ['chat', 'conversations', 'detail', conversationId],
    queryFn: async () => {
      const res = await fetch(getApiUrl(`/api/chat/conversations/${conversationId}`), {
        credentials: "include"
      });
      if (!res.ok) throw new Error("Failed to fetch conversation");
      return res.json();
    },
    enabled: !!conversationId,
  });
};

export const useMessages = (conversationId: string) => {
  return useQuery<ChatMessage[]>({
    queryKey: ['chat', 'messages', conversationId],
    queryFn: async () => {
      const res = await fetch(getApiUrl(`/api/chat/conversations/${conversationId}/messages`), {
        credentials: "include"
      });
      if (!res.ok) throw new Error("Failed to fetch messages");
      return res.json();
    },
    enabled: !!conversationId,
    refetchInterval: 2000,
    refetchIntervalInBackground: true,
  });
};

export const useUnreadCount = (conversationId: string) => {
  return useQuery<{ unreadCount: number }>({
    queryKey: ['chat', 'unread', 'conversation', conversationId],
    queryFn: async () => {
      const res = await fetch(getApiUrl(`/api/chat/conversations/${conversationId}/unread`), {
        credentials: "include"
      });
      if (!res.ok) throw new Error("Failed to fetch unread count");
      const data = await res.json();
      // Backend returns { count } but UI expects { unreadCount }
      return { unreadCount: data.unreadCount || data.count || 0 };
    },
    enabled: !!conversationId,
  });
};

export const usePresence = (userId: string) => {
  return useQuery<ChatPresence>({
    queryKey: ['chat', 'presence', 'user', userId],
    queryFn: async () => {
      const res = await fetch(getApiUrl(`/api/chat/presence/${userId}`), {
        credentials: "include"
      });
      if (!res.ok) throw new Error("Failed to fetch presence");
      return res.json();
    },
    enabled: !!userId,
  });
};

export const useOnlineUsers = () => {
  return useQuery<ChatPresence[]>({
    queryKey: ['chat', 'presence', 'online'],
    queryFn: async () => {
      const res = await fetch(getApiUrl("/api/chat/presence/online"), {
        credentials: "include"
      });
      if (!res.ok) throw new Error("Failed to fetch online users");
      return res.json();
    },
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
      // Invalidate user's conversations
      queryClient.invalidateQueries({ 
        queryKey: ['chat', 'conversations', 'user', newConversation.userId] 
      });
      // Invalidate admin conversations list (for admin panel refresh)
      queryClient.invalidateQueries({
        queryKey: ['chat', 'conversations', 'admin'],
        exact: false,
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
        queryKey: ['chat', 'messages', newMessage.conversationId] 
      });

      const previousMessages = queryClient.getQueryData<ChatMessage[]>([
        'chat', 'messages', newMessage.conversationId
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
        ['chat', 'messages', newMessage.conversationId],
        (old) => (old ? [...old, optimisticMessage] : [optimisticMessage])
      );

      return { previousMessages };
    },
    onError: (_err, newMessage, context) => {
      if (context?.previousMessages) {
        queryClient.setQueryData(
          ['chat', 'messages', newMessage.conversationId],
          context.previousMessages
        );
      }
    },
    onSuccess: (data, variables) => {
      // Invalider les messages de la conversation
      queryClient.invalidateQueries({ 
        queryKey: ['chat', 'messages', data.conversationId]
      });
      // Invalider la liste de conversations pour tous les participants
      queryClient.invalidateQueries({
        queryKey: ['chat', 'conversations', 'user']
      });
      // CRITICAL: Do NOT invalidate unread counts here!
      // The server will emit chat:unread-count socket event for real-time updates
      // Invalidating here causes cache to be thrown away, then API refetch recalculates from DB
      // Instead, trust socket event 'chat:unread-count' as single source of truth
      // Socket event arrives immediately with server-calculated count
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
        queryKey: ['chat', 'messages', variables.conversationId] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['chat', 'unread', 'conversation', variables.conversationId] 
      });
      queryClient.invalidateQueries({
        queryKey: ['chat', 'unread', 'user']
      });
      // CRITICAL: Invalidate admin conversations to update unreadCount badge
      queryClient.invalidateQueries({
        queryKey: ['chat', 'conversations', 'admin'],
        exact: false,
      });
      // Also invalidate user conversations
      queryClient.invalidateQueries({
        queryKey: ['chat', 'conversations', 'user'],
        exact: false,
      });
      // Invalidate detail view
      queryClient.invalidateQueries({
        queryKey: ['chat', 'conversations', 'detail', variables.conversationId],
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
        queryKey: ['chat', 'presence', 'user', data.userId] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['chat', 'presence', 'online'] 
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
      // Invalider toutes les listes de conversations (users et admins)
      queryClient.invalidateQueries({ 
        queryKey: ['chat', 'conversations'] 
      });
      // Invalider aussi la conversation spécifique
      queryClient.invalidateQueries({ 
        queryKey: ['chat', 'conversations', 'detail', data.id] 
      });
    },
  });
};

export const useCloseConversation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (conversationId: string) => {
      const res = await apiRequest("PATCH", `/api/chat/conversations/${conversationId}`, { status: "closed" });
      return await res.json() as ChatConversation;
    },
    onSuccess: (data) => {
      // Invalider toutes les listes de conversations (users et admins)
      queryClient.invalidateQueries({ 
        queryKey: ['chat', 'conversations'] 
      });
      // Invalider aussi la conversation spécifique
      queryClient.invalidateQueries({ 
        queryKey: ['chat', 'conversations', 'detail', data.id] 
      });
    },
  });
};

export const useDeleteConversation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (conversationId: string) => {
      const res = await apiRequest("DELETE", `/api/chat/conversations/${conversationId}`);
      return await res.json();
    },
    onSuccess: () => {
      // Invalider toutes les listes de conversations
      queryClient.invalidateQueries({ 
        queryKey: ['chat', 'conversations'] 
      });
    },
  });
};
