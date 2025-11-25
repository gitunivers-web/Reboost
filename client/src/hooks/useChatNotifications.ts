import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSocket } from "./useSocket";
import { useConversations } from "@/lib/chatQueries";
import type { ChatMessage } from "@shared/schema";

interface UseChatNotificationsReturn {
  totalUnreadCount: number;
}

/**
 * Hook pour gérer les notifications de chat en temps réel
 * 
 * Backend Requirements:
 * - L'endpoint /api/chat/unread/:userId doit retourner: { conversationId: string, count: number }[]
 * - Les événements socket 'new_message' et 'message_read' doivent être émis par le serveur
 * 
 * Ce hook:
 * 1. Hydrate l'état initial depuis l'API backend (/api/chat/unread/:userId)
 * 2. Écoute les événements socket pour maintenir les comptes à jour en temps réel
 * 3. Invalide le cache React Query pour garder les données synchronisées
 */
export function useChatNotifications(userId: string): UseChatNotificationsReturn {
  const { socket, connected } = useSocket();
  const queryClient = useQueryClient();
  const { data: conversations = [] } = useConversations(userId);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});

  // Hydratation initiale depuis l'API backend
  const { data: serverUnreadCounts } = useQuery<Array<{ conversationId: string; count: number }>>({
    queryKey: ['chat', 'unread', 'user', userId],
    queryFn: async () => {
      const res = await fetch(`/api/chat/unread/${userId}`, {
        credentials: "include"
      });
      if (!res.ok) throw new Error("Failed to fetch unread counts");
      return res.json();
    },
    enabled: !!userId,
    staleTime: 30000, // 30 secondes
  });

  // Hydrater l'état local avec les données serveur
  useEffect(() => {
    if (serverUnreadCounts) {
      // Build new counts object from server data only
      // This automatically clears badges for reassigned/deleted conversations
      const counts: Record<string, number> = {};
      
      serverUnreadCounts.forEach(({ conversationId, count }) => {
        counts[conversationId] = count;
      });
      
      setUnreadCounts(counts);
    }
  }, [serverUnreadCounts]);

  useEffect(() => {
    if (!socket || !connected || !userId) return;

    const handleNewMessage = (message: ChatMessage) => {
      if (message.senderId !== userId && !message.isRead) {
        setUnreadCounts((prev) => ({
          ...prev,
          [message.conversationId]: (prev[message.conversationId] || 0) + 1,
        }));
      }

      queryClient.invalidateQueries({
        queryKey: ['chat', 'messages', message.conversationId],
      });
      queryClient.invalidateQueries({
        queryKey: ['chat', 'conversations', 'user', userId],
      });
      // IMPORTANT: Also invalidate admin conversations (important for admins receiving messages)
      queryClient.invalidateQueries({
        queryKey: ['chat', 'conversations', 'admin'],
      });
      queryClient.invalidateQueries({
        queryKey: ['chat', 'conversations', 'detail', message.conversationId],
      });
      queryClient.invalidateQueries({
        queryKey: ['chat', 'unread', 'user', userId],
      });
    };

    const handleMessageRead = (data: { conversationId: string; messageIds: string[] }) => {
      setUnreadCounts((prev) => ({
        ...prev,
        [data.conversationId]: 0,
      }));

      queryClient.invalidateQueries({
        queryKey: ['chat', 'messages', data.conversationId],
      });
      queryClient.invalidateQueries({
        queryKey: ['chat', 'conversations', 'user', userId],
      });
      queryClient.invalidateQueries({
        queryKey: ['chat', 'unread', 'user', userId],
      });
    };

    const handleUnreadCountUpdate = (data: { conversationId: string; count: number }) => {
      // Update local unread counts state for regular users
      setUnreadCounts((prev) => ({
        ...prev,
        [data.conversationId]: data.count,
      }));
      
      // Update admin conversation queries in cache (without refetch)
      // This ensures the unread badge persists for admins until they open the chat
      queryClient.setQueriesData(
        { queryKey: ['chat', 'conversations', 'admin'], exact: false },
        (oldData: any) => {
          if (Array.isArray(oldData)) {
            return oldData.map((conv: any) =>
              conv.id === data.conversationId
                ? { ...conv, unreadCount: data.count }
                : conv
            );
          }
          return oldData;
        }
      );
    };

    const handleUnreadSync = async (data: { userId: string }) => {
      // Force immediate refetch of unread counts when assignment changes
      if (data.userId === userId) {
        await queryClient.refetchQueries({
          queryKey: ['chat', 'unread', 'user', userId],
        });
        await queryClient.refetchQueries({
          queryKey: ['chat', 'conversations', 'user', userId],
        });
      }
    };

    const handleConversationAssigned = async (data: { 
      conversationId: string; 
      newAdminId: string; 
      previousAdminId?: string 
    }) => {
      // Force immediate refetch for both admins involved in reassignment
      // Let server be source of truth for unread counts after reassignment
      if (userId === data.newAdminId || userId === data.previousAdminId) {
        // Refetch from server for accurate state (no optimistic updates)
        await queryClient.refetchQueries({
          queryKey: ['chat', 'unread', 'user', userId],
        });
        await queryClient.refetchQueries({
          queryKey: ['chat', 'conversations', 'user', userId],
        });
        await queryClient.refetchQueries({
          queryKey: ['chat', 'conversations', 'detail', data.conversationId],
        });
        // Also invalidate messages for newly assigned admin
        await queryClient.refetchQueries({
          queryKey: ['chat', 'messages', data.conversationId],
        });
      }
    };

    socket.on("chat:new-message", handleNewMessage);
    socket.on("chat:read-receipt", handleMessageRead);
    socket.on("chat:unread-count", handleUnreadCountUpdate);
    socket.on("unread_sync_required", handleUnreadSync);
    socket.on("conversation_assigned", handleConversationAssigned);

    return () => {
      socket.off("chat:new-message", handleNewMessage);
      socket.off("chat:read-receipt", handleMessageRead);
      socket.off("chat:unread-count", handleUnreadCountUpdate);
      socket.off("unread_sync_required", handleUnreadSync);
      socket.off("conversation_assigned", handleConversationAssigned);
    };
  }, [socket, connected, userId, queryClient]);

  const totalUnreadCount = Object.values(unreadCounts).reduce((sum, count) => sum + count, 0);

  return {
    totalUnreadCount,
  };
}
