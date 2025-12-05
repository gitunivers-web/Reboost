import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { IStorage } from './storage';
import { setSocketInstance } from './data-socket';

interface SocketUser {
  userId: string;
  role: string;
}

declare module 'socket.io' {
  interface Socket {
    user?: SocketUser;
  }
}

export function initializeChatSocket(httpServer: HTTPServer, storage: IStorage, sessionMiddleware: any) {
  // Get allowed origins based on environment
  const getAllowedOrigins = () => {
    if (process.env.NODE_ENV === 'production') {
      return [
        'https://solventisgroup.org',
        'https://www.solventisgroup.org',
      ];
    }
    // In development, allow localhost and Replit domains
    return [
      'http://localhost:3000',
      'http://localhost:5173',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:5000',
      /\.replit\.dev$/,
      /\.replit\.app$/,
      /\.riker\.replit\.dev$/,
    ];
  };

  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: getAllowedOrigins(),
      credentials: true,
      methods: ['GET', 'POST'],
    },
    path: '/socket.io',
    transports: ['websocket', 'polling'],
  });

  const userSocketCounts = new Map<string, number>();

  const wrap = (middleware: any) => (socket: Socket, next: any) => {
    middleware(socket.request, {}, next);
  };

  io.use(wrap(sessionMiddleware));

  io.use((socket, next) => {
    const session = (socket.request as any).session;
    if (!session || !session.userId) {
      return next(new Error('Non authentifié'));
    }
    
    socket.user = {
      userId: session.userId,
      role: session.userRole || 'user',
    };
    
    next();
  });

  const checkConversationAccess = async (
    conversationId: string,
    userId: string,
    userRole: string
  ): Promise<{ authorized: boolean; conversation?: any }> => {
    const conversation = await storage.getConversation(conversationId);
    if (!conversation) {
      return { authorized: false };
    }

    // Admins have access to all conversations
    // Regular users only have access to their own conversations
    const isAuthorized =
      conversation.userId === userId ||
      userRole === 'admin';

    return { authorized: isAuthorized, conversation };
  };

  io.on('connection', async (socket: Socket) => {
    if (!socket.user) {
      socket.disconnect();
      return;
    }

    const userId = socket.user.userId;
    const userRole = socket.user.role;

    console.log(`[CHAT WS] Utilisateur connecté: ${userId} (${userRole})`);

    socket.join(`user:${userId}`);

    const currentCount = userSocketCounts.get(userId) || 0;
    userSocketCounts.set(userId, currentCount + 1);

    if (currentCount === 0) {
      await storage.updateUserPresence(userId, 'online');
      io.emit('user:presence', { userId, status: 'online' });
    }

    // CRITICAL: Send existing unread counts to client on reconnection after page refresh
    // This ensures the badge persists after refresh by hydrating from persistent unread counts in DB
    try {
      const conversations = await storage.getUserConversations(userId);
      for (const conversation of conversations) {
        // Get unread count for this user in each conversation
        const unreadCount = await storage.getUnreadMessageCount(conversation.id, userId);
        if (unreadCount > 0) {
          socket.emit('chat:unread-count', {
            conversationId: conversation.id,
            count: unreadCount,
          });
          console.log(`[CHAT WS] Hydrated unread count for ${userId} on reconnection: conversation ${conversation.id} = ${unreadCount}`);
        }
      }
    } catch (error) {
      console.error('[CHAT WS] Error hydrating unread counts on reconnection:', error);
    }

    socket.on('chat:join-conversation', async (conversationId: string) => {
      try {
        const { authorized } = await checkConversationAccess(conversationId, userId, userRole);
        if (!authorized) {
          return socket.emit('error', { message: 'Accès non autorisé' });
        }

        socket.join(`conversation:${conversationId}`);
        socket.emit('chat:joined-conversation', { conversationId });
      } catch (error) {
        console.error('[CHAT WS] Erreur join conversation:', error);
        socket.emit('error', { message: 'Erreur lors de la jonction' });
      }
    });

    socket.on('chat:leave-conversation', (conversationId: string) => {
      socket.leave(`conversation:${conversationId}`);
    });

    socket.on('chat:send-message', async (data: {
      conversationId: string;
      content: string;
      fileUrl?: string;
      fileName?: string;
    }) => {
      try {
        let { conversationId, content, fileUrl, fileName } = data;

        let { authorized, conversation } = await checkConversationAccess(conversationId, userId, userRole);
        
        // Si la conversation n'existe pas et que l'utilisateur n'est pas admin, créer une nouvelle conversation
        if (!authorized && userRole !== 'admin') {
          conversation = await storage.createConversation({
            userId,
            subject: 'Support Chat',
          });
          conversationId = conversation.id;
          authorized = true;
          console.log(`[CHAT WS] Nouvelle conversation créée automatiquement: ${conversationId} pour l'utilisateur ${userId}`);
        }

        if (!authorized || !conversation) {
          return socket.emit('error', { message: 'Accès non autorisé' });
        }

        const message = await storage.createChatMessage({
          conversationId,
          senderId: userId,
          senderType: userRole === 'admin' ? 'admin' : 'user',
          content,
          fileUrl,
          fileName,
        });

        // Émettre le message à TOUS les clients (incluant l'expéditeur)
        io.to(`conversation:${conversationId}`).emit('chat:new-message', {
          ...message,
          isRead: false, // Les nouveaux messages sont toujours non-lus pour le destinataire
        });

        // Notifier le destinataire (utilisateur ou admin) des messages non lus
        const recipientUserId = userRole === 'admin' ? conversation.userId : conversation.assignedAdminId;
        if (recipientUserId) {
          // Obtenir le nouveau count de messages non lus
          const unreadCount = await storage.getUnreadMessageCount(conversationId, recipientUserId);
          
          // Envoyer DIRECTEMENT le nouveau count (pas de refetch, update immédiat)
          io.to(`user:${recipientUserId}`).emit('chat:unread-count', {
            conversationId,
            count: unreadCount,
          });
          
          console.log(`[CHAT WS] Unread count mis à jour pour ${recipientUserId}: ${unreadCount} pour conversation ${conversationId}`);
        }
        
        console.log(`[CHAT WS] Message créé: ${message.id} pour conversation ${conversationId}`);
      } catch (error) {
        console.error('[CHAT WS] Erreur envoi message:', error);
        socket.emit('error', { message: 'Erreur lors de l\'envoi du message' });
      }
    });

    socket.on('chat:typing', async (data: { conversationId: string; isTyping: boolean }) => {
      try {
        const { authorized } = await checkConversationAccess(data.conversationId, userId, userRole);
        if (!authorized) {
          return;
        }

        socket.to(`conversation:${data.conversationId}`).emit('chat:user-typing', {
          userId,
          isTyping: data.isTyping,
        });
      } catch (error) {
        console.error('[CHAT WS] Erreur typing:', error);
      }
    });

    socket.on('chat:mark-read', async (data: { conversationId: string }) => {
      try {
        const { authorized, conversation } = await checkConversationAccess(data.conversationId, userId, userRole);
        if (!authorized || !conversation) {
          return socket.emit('error', { message: 'Accès non autorisé' });
        }

        await storage.markMessagesAsRead(data.conversationId, userId);
        
        socket.emit('chat:messages-read', { conversationId: data.conversationId });
        
        // Notifier l'autre personne de la lecture
        const otherUserId = userRole === 'admin' ? conversation.userId : conversation.assignedAdminId;
        if (otherUserId) {
          io.to(`user:${otherUserId}`).emit('chat:read-receipt', {
            conversationId: data.conversationId,
            readBy: userId,
          });
        }

        // CRITICAL: Also send unreadCount to self to update badge to 0
        // This ensures the badge disappears for the person who marked as read
        const unreadCount = await storage.getUnreadMessageCount(data.conversationId, userId);
        io.to(`user:${userId}`).emit('chat:unread-count', {
          conversationId: data.conversationId,
          count: unreadCount,
        });
        
        console.log(`[CHAT WS] Messages marqués comme lus pour ${userId} dans conversation ${data.conversationId}`);
      } catch (error) {
        console.error('[CHAT WS] Erreur mark read:', error);
      }
    });

    socket.on('disconnect', async () => {
      console.log(`[CHAT WS] Utilisateur déconnecté: ${userId}`);
      
      const currentCount = userSocketCounts.get(userId) || 1;
      const newCount = currentCount - 1;

      if (newCount <= 0) {
        userSocketCounts.delete(userId);
        await storage.updateUserPresence(userId, 'offline');
        io.emit('user:presence', { userId, status: 'offline' });
      } else {
        userSocketCounts.set(userId, newCount);
      }
    });

    socket.on('error', (error) => {
      console.error('[CHAT WS] Socket error:', error);
    });
  });

  setSocketInstance(io);

  return io;
}
