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

// Session middleware for Socket.IO
export function createSocketIOSessionMiddleware(
  sessionMiddleware: RequestHandler
) {
  return (socket: Socket, next: (err?: Error) => void) => {
    const req = socket.request as any;
    const res = {} as any;
    
    sessionMiddleware(req, res, (err?: any) => {
      if (err) {
        console.error('[SOCKET.IO] Session middleware error:', err);
        return next(new Error('Session authentication failed'));
      }
      
      // Verify session and user authentication
      if (!req.session || !req.session.userId) {
        console.warn('[SOCKET.IO] Unauthenticated connection attempt');
        return next(new Error('Authentication required'));
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
  const allowedOrigins = process.env.NODE_ENV === 'production'
    ? [
        'https://altusfinancesgroup.com',
        'https://www.altusfinancesgroup.com',
        process.env.FRONTEND_URL
      ].filter((origin): origin is string => typeof origin === 'string')
    : ['http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:3000', 'http://localhost:5000'];

  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: allowedOrigins,
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  // Apply session authentication middleware
  io.use(createSocketIOSessionMiddleware(sessionMiddleware));

  io.on("connection", (socket: Socket) => {
    const authSocket = socket as AuthenticatedSocket;
    const userId = authSocket.userId!;
    
    console.log(`[SOCKET.IO] Client connecté: ${socket.id} (User: ${userId})`);

    // Auto-join user's personal room for notifications
    socket.join(`user_${userId}`);

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
    });
  });

  console.log('[SOCKET.IO] ✅ Socket.IO configured with session authentication');
  return io;
}
