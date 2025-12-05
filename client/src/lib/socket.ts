import { io, Socket } from "socket.io-client";

// Detect if we're in development (localhost OR Replit dev environment)
const isDevelopment = typeof window !== 'undefined' && 
  (window.location.hostname === 'localhost' || 
   window.location.hostname === '127.0.0.1' ||
   window.location.hostname.includes('.replit.dev') ||
   window.location.hostname.includes('.replit.app') ||
   window.location.hostname.includes('.riker.replit.dev'));

// In development: always use same origin (Vite proxy handles it)
// In production: use the API subdomain URL
const SOCKET_URL = typeof window !== 'undefined'
  ? (isDevelopment 
      ? window.location.origin
      : (import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL || 'https://api.solventisgroup.org'))
  : '/';

export interface ChatEvents {
  join_conversation: (conversationId: string) => void;
  leave_conversation: (conversationId: string) => void;
  send_message: (data: { conversationId: string; content: string; fileUrl?: string; fileName?: string }) => void;
  typing_start: (data: { conversationId: string }) => void;
  typing_stop: (data: { conversationId: string }) => void;
  update_presence: (status: "online" | "away" | "offline") => void;
}

export interface ServerEvents {
  new_message: (message: any) => void;
  user_typing: (data: { userId: string; username: string; conversationId: string }) => void;
  user_stopped_typing: (data: { userId: string; conversationId: string }) => void;
  presence_update: (data: { userId: string; status: "online" | "away" | "offline" }) => void;
  message_read: (data: { conversationId: string; messageIds: string[] }) => void;
  conversation_assigned: (data: { conversationId: string; adminId: string }) => void;
  error: (error: { message: string; code?: string }) => void;
}

let socketInstance: Socket | null = null;

export function getSocket(): Socket {
  if (!socketInstance) {
    socketInstance = io(SOCKET_URL, {
      path: "/socket.io",
      transports: ["websocket", "polling"],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      withCredentials: true,
    });

    socketInstance.on("connect", () => {
      console.log("✅ Socket connected:", socketInstance?.id);
    });

    socketInstance.on("disconnect", (reason) => {
      console.log("❌ Socket disconnected:", reason);
    });

    socketInstance.on("connect_error", (error) => {
      console.error("🔴 Socket connection error:", error.message);
    });

    socketInstance.on("error", (error) => {
      console.error("🔴 Socket error:", error);
    });
  }

  return socketInstance;
}

export function disconnectSocket(): void {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
}

export function isSocketConnected(): boolean {
  return socketInstance?.connected ?? false;
}
