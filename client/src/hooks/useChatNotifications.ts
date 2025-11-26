import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSocket } from "./useSocket";
import { useConversations } from "@/lib/chatQueries";
import { getApiUrl } from "@/lib/queryClient";
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
      const res = await fetch(getApiUrl(`/api/chat/unread/${userId}`), {
        credentials: "include"
      });
      if (!res.ok) throw new Error("Failed to fetch unread counts");
      return res.json();
    },
    enabled: !!userId,
    // CRITICAL: staleTime: Infinity prevents automatic refetches that overwrite socket-based updates
    // Socket events (chat:unread-count) are the source of truth for real-time updates
    // This avoids race conditions where server refetch overwrites the badge before socket event arrives
    staleTime: Infinity,
    // FIXED: refetchOnMount: true ensures API call on mount for fallback
    // When page is refreshed, React Query cache is empty. This guarantees badge appears immediately
    // Socket still takes priority for real-time updates, but API ensures initial hydration
    refetchOnMount: true,
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
      
      const total = Object.values(counts).reduce((sum, count) => sum + count, 0);
      console.warn('[CHAT NOTIFICATIONS] ⚠️ API REFETCH happened! This OVERWRITES socket updates. Total:', total, 'Counts:', counts);
      setUnreadCounts(counts);
    }
  }, [serverUnreadCounts]);

  useEffect(() => {
    if (!socket || !connected || !userId) return;

    const handleNewMessage = (message: ChatMessage) => {
      // CRITICAL: Do NOT invalidate conversations here - the backend will send chat:unread-count separately
      // Invalidating here causes refetch that overwrites the unread count before chat:unread-count arrives
      
      // Only update messages cache
      queryClient.setQueryData(
        ['chat', 'messages', message.conversationId],
        (oldMessages: ChatMessage[] | undefined) => {
          if (!oldMessages) return [message];
          return [...oldMessages, message];
        }
      );
    };

    const handleMessageRead = (data: { conversationId: string; messageIds: string[] }) => {
      console.log('[CHAT NOTIFICATIONS] Socket chat:read-receipt received:', data);
      
      // CRITICAL: Do NOT set unread count to 0 here!
      // chat:read-receipt is notification that ANOTHER user marked THEIR messages as read
      // It should NOT affect OUR unread badge count
      // The source of truth for OUR unread count is chat:unread-count event only!
      // Manually setting count to 0 here causes premature badge dismissal before server sends chat:unread-count

      queryClient.invalidateQueries({
        queryKey: ['chat', 'messages', data.conversationId],
      });
      queryClient.invalidateQueries({
        queryKey: ['chat', 'conversations', 'user', userId],
      });
      console.log('[CHAT NOTIFICATIONS] Invalidated messages and conversations cache (NOT unread counts)');
    };

    const handleUnreadCountUpdate = (data: { conversationId: string; count: number }) => {
      console.log('[CHAT NOTIFICATIONS] Socket chat:unread-count received:', data);
      
      // Update local unread counts state for regular users
      setUnreadCounts((prev) => {
        const updated = {
          ...prev,
          [data.conversationId]: data.count,
        };
        const total = Object.values(updated).reduce((sum, count) => sum + count, 0);
        console.log('[CHAT NOTIFICATIONS] Unread counts updated. New total:', total, 'All counts:', updated);
        return updated;
      });
      
      // For admins: invalidate conversations query to refetch with updated unreadCount
      // setQueriesData doesn't work if conversations aren't already cached
      // Invalidating ensures badge appears even if admin hasn't opened chat yet
      queryClient.invalidateQueries({
        queryKey: ['chat', 'conversations', 'admin'],
        exact: false,
      });
    };

    const handleUnreadSync = async (data: { userId: string }) => {
      console.log('[CHAT NOTIFICATIONS] Socket unread_sync_required received for user:', data.userId);
      
      // Force immediate refetch of unread counts when assignment changes
      if (data.userId === userId) {
        console.log('[CHAT NOTIFICATIONS] Refetching unread counts due to sync event');
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
