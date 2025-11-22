import { Server as HTTPServer } from "http";
import { Server as SocketIOServer, Socket } from "socket.io";
import { storage } from "./storage";
import DOMPurify from "isomorphic-dompurify";
import { z } from "zod";
import type { RequestHandler } from "express";

// Validation schemas for Socket.IO events
const sendMessageSchema = z.object({
  room: z.string().min(1).max(100),
  senderId: z.string().uuid(),
  receiverId: z.string().uuid(),
  content: z.string().min(1).max(5000),
  timestamp: z.coerce.date()
});

const markAsReadSchema = z.object({
  messageId: z.string().uuid()
});

const typingSchema = z.object({
  room: z.string().min(1).max(100),
  userId: z.string().uuid(),
  isTyping: z.boolean()
});

// Extend Socket to include session data
interface AuthenticatedSocket extends Socket {
  userId?: string;
  userRole?: string;
}

// Presence Manager to track online users
class PresenceManager {
  private userSockets: Map<string, Set<string>>; // userId -> Set of socketIds

  constructor() {
    this.userSockets = new Map();
  }

  addSocket(userId: string, socketId: string): void {
    if (!this.userSockets.has(userId)) {
      this.userSockets.set(userId, new Set());
    }
    this.userSockets.get(userId)!.add(socketId);
    console.log(`[PRESENCE] User ${userId} added socket ${socketId}. Total sockets: ${this.userSockets.get(userId)!.size}`);
  }

  removeSocket(userId: string, socketId: string): void {
    const sockets = this.userSockets.get(userId);
    if (sockets) {
      sockets.delete(socketId);
      console.log(`[PRESENCE] User ${userId} removed socket ${socketId}. Remaining sockets: ${sockets.size}`);
      if (sockets.size === 0) {
        this.userSockets.delete(userId);
        console.log(`[PRESENCE] User ${userId} has no more active connections`);
      }
    }
  }

  isUserOnline(userId: string): boolean {
    const sockets = this.userSockets.get(userId);
    return sockets !== undefined && sockets.size > 0;
  }

  getAllOnlineUsers(): string[] {
    return Array.from(this.userSockets.keys());
  }

  getOnlineStatus(userIds: string[]): Record<string, boolean> {
    const status: Record<string, boolean> = {};
    for (const userId of userIds) {
      status[userId] = this.isUserOnline(userId);
    }
    return status;
  }
}

// Session middleware for Socket.IO
export function createSocketIOSessionMiddleware(
  sessionMiddleware: RequestHandler
) {
  return (socket: Socket, next: (err?: Error) => void) => {
    const cookieHeader = socket.request.headers.cookie;
    
    if (!cookieHeader) {
      console.log('[SESSION] Cookie missing in socket handshake');
      return next(); // socket connecté mais pas authentifié
    }

    const req = socket.request as any;
    const res = {} as any;
    
    // Récupérer la session Express
    sessionMiddleware(req, res, (err?: any) => {
      if (err) {
        console.error('[SOCKET.IO] Session middleware error:', err);
        return next();
      }
      
      if (!req.session || !req.session.userId) {
        console.log('[SESSION] Socket not authenticated');
        return next();
      }
      
      // Attach user data to socket
      (socket as AuthenticatedSocket).userId = req.session.userId;
      (socket as AuthenticatedSocket).userRole = req.session.userRole;
      
      console.log(`[SOCKET.IO] Authenticated socket for user: ${req.session.userId}`);
      next();
    });
  };
}

export function setupSocketIO(
  httpServer: HTTPServer,
  sessionMiddleware: RequestHandler
): SocketIOServer {
  // Parse allowed Vercel domains from environment variable (comma-separated)
  const vercelDomains = process.env.VERCEL_DOMAINS 
    ? process.env.VERCEL_DOMAINS.split(',').map(d => d.trim())
    : [];

  const allowedOrigins = process.env.NODE_ENV === 'production'
    ? [
        'https://altusfinancesgroup.com',
        'https://www.altusfinancesgroup.com',
        process.env.FRONTEND_URL,
        ...vercelDomains
      ].filter((origin): origin is string => typeof origin === 'string')
    : ['http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:3000', 'http://localhost:5000'];

  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: (origin, callback) => {
        if (process.env.NODE_ENV !== 'production') {
          callback(null, true);
        } else if (!origin) {
          callback(null, true);
        } else if (allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  // Apply session authentication middleware
  io.use(createSocketIOSessionMiddleware(sessionMiddleware));

  // Initialize presence manager
  const presenceManager = new PresenceManager();

  io.on("connection", (socket: Socket) => {
    const authSocket = socket as AuthenticatedSocket;
    const userId = authSocket.userId!;
    
    console.log(`[SOCKET.IO] Client connecté: ${socket.id} (User: ${userId})`);

    // Track user presence
    const wasOnline = presenceManager.isUserOnline(userId);
    presenceManager.addSocket(userId, socket.id);
    const isNowOnline = presenceManager.isUserOnline(userId);

    // Auto-join user's personal room for notifications
    socket.join(`user_${userId}`);

    // Broadcast presence change if user just came online
    if (!wasOnline && isNowOnline) {
      io.emit("user_presence", { userId, isOnline: true });
      console.log(`[PRESENCE] User ${userId} is now online`);
    }

    // Handle explicit user_online event from frontend
    socket.on("user_online", ({ userId: frontendUserId }: { userId: string }) => {
      try {
        // Verify the userId matches the authenticated session
        if (frontendUserId === userId) {
          // Re-confirm presence (already done above, but this ensures sync)
          const wasAlreadyOnline = presenceManager.isUserOnline(userId);
          if (!wasAlreadyOnline) {
            presenceManager.addSocket(userId, socket.id);
            io.emit("user_presence", { userId, isOnline: true });
          }
          console.log(`[PRESENCE] User ${userId} explicitly confirmed online status`);
        } else {
          console.warn(`[SOCKET.IO] User ID mismatch: session=${userId}, frontend=${frontendUserId}`);
        }
      } catch (error) {
        console.error('[SOCKET.IO] Error handling user_online:', error);
      }
    });

    // Handle request for presence state
    socket.on("get_presence_state", (userIds: string[]) => {
      try {
        if (!Array.isArray(userIds)) {
          socket.emit("error", { message: "Invalid user IDs format" });
          return;
        }
        const presenceState = presenceManager.getOnlineStatus(userIds);
        socket.emit("presence_state", presenceState);
        console.log(`[PRESENCE] Sent presence state for ${userIds.length} users to ${userId}`);
      } catch (error) {
        console.error('[PRESENCE] Error getting presence state:', error);
        socket.emit("error", { message: "Failed to get presence state" });
      }
    });

    socket.on("join_room", (roomId: string) => {
      try {
        // Validate room format: should be "userId1_userId2" sorted
        const roomParts = roomId.split('_');
        if (roomParts.length !== 2) {
          socket.emit("error", { message: "Invalid room format" });
          return;
        }

        // Verify user is authorized to join this room
        if (!roomParts.includes(userId)) {
          console.warn(`[SOCKET.IO] Unauthorized room join attempt by ${userId} to ${roomId}`);
          socket.emit("error", { message: "Unauthorized room access" });
          return;
        }

        socket.join(roomId);
        console.log(`[SOCKET.IO] User ${userId} joined room: ${roomId}`);
      } catch (error) {
        console.error('[SOCKET.IO] Error joining room:', error);
        socket.emit("error", { message: "Failed to join room" });
      }
    });

    socket.on("send_message", async (data: unknown) => {
      try {
        // Validate input with Zod
        const validatedData = sendMessageSchema.parse(data);

        // Authorization: Verify the sender is the authenticated user
        if (validatedData.senderId !== userId) {
          console.warn(`[SOCKET.IO] User ${userId} attempted to send message as ${validatedData.senderId}`);
          socket.emit("error", { message: "Unauthorized: Cannot send message as another user" });
          return;
        }

        // Sanitize content to prevent XSS
        const sanitizedContent = DOMPurify.sanitize(validatedData.content, {
          ALLOWED_TAGS: [], // Strip all HTML tags
          ALLOWED_ATTR: []
        });

        if (!sanitizedContent.trim()) {
          socket.emit("error", { message: "Message content is required" });
          return;
        }

        // Create message with authorization check
        const message = await storage.createChatMessage(
          {
            senderId: validatedData.senderId,
            receiverId: validatedData.receiverId,
            content: sanitizedContent,
            isRead: false,
            readAt: null
          },
          userId // Pass authenticated user ID for authorization
        );

        // Emit to conversation room
        io.to(validatedData.room).emit("receive_message", {
          ...validatedData,
          content: sanitizedContent,
          id: message.id,
          createdAt: message.createdAt
        });

        // Send notification to receiver
        const receiverRoom = `user_${validatedData.receiverId}`;
        io.to(receiverRoom).emit("new_message_notification", {
          from: validatedData.senderId,
          messageId: message.id
        });

        console.log(`[SOCKET.IO] Message sent in room ${validatedData.room} by ${userId}`);
      } catch (error) {
        if (error instanceof z.ZodError) {
          console.error('[SOCKET.IO] Validation error:', error.errors);
          socket.emit("error", { message: "Invalid message data" });
        } else {
          console.error('[SOCKET.IO] Error sending message:', error);
          socket.emit("error", { message: "Failed to send message" });
        }
      }
    });

    socket.on("mark_as_read", async (data: unknown) => {
      try {
        // Validate input
        const { messageId } = markAsReadSchema.parse({ messageId: data });

        // Mark as read with authorization check
        const message = await storage.markChatMessageAsRead(messageId, userId);
        
        if (!message) {
          socket.emit("error", { message: "Message not found or unauthorized" });
          return;
        }

        console.log(`[SOCKET.IO] Message ${messageId} marked as read by ${userId}`);
      } catch (error) {
        if (error instanceof z.ZodError) {
          console.error('[SOCKET.IO] Validation error:', error.errors);
        } else {
          console.error('[SOCKET.IO] Error marking message as read:', error);
        }
      }
    });

    socket.on("typing", (data: unknown) => {
      try {
        // Validate input
        const validatedData = typingSchema.parse(data);

        // Authorization: Verify the user is the authenticated user
        if (validatedData.userId !== userId) {
          console.warn(`[SOCKET.IO] User ${userId} attempted typing indicator as ${validatedData.userId}`);
          return;
        }

        // Verify user is in the room
        const roomParts = validatedData.room.split('_');
        if (!roomParts.includes(userId)) {
          console.warn(`[SOCKET.IO] Unauthorized typing indicator by ${userId} in ${validatedData.room}`);
          return;
        }

        socket.to(validatedData.room).emit("user_typing", {
          userId: validatedData.userId,
          isTyping: validatedData.isTyping
        });
      } catch (error) {
        if (error instanceof z.ZodError) {
          console.error('[SOCKET.IO] Validation error:', error.errors);
        }
        // Silent fail for typing indicators
      }
    });

    socket.on("disconnect", () => {
      console.log(`[SOCKET.IO] Client disconnected: ${socket.id} (User: ${userId})`);
      
      // Update presence
      presenceManager.removeSocket(userId, socket.id);
      const isStillOnline = presenceManager.isUserOnline(userId);
      
      // Broadcast presence change if user went offline
      if (!isStillOnline) {
        io.emit("user_presence", { userId, isOnline: false });
        console.log(`[PRESENCE] User ${userId} is now offline`);
      }
    });
  });

  console.log('[SOCKET.IO] ✅ Socket.IO configured with session authentication');
  return io;
}
