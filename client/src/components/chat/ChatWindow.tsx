import { useEffect, useState } from "react";
import { X, Users, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { MessageList } from "./MessageList";
import { MessageInput } from "./MessageInput";
import { TypingIndicator } from "./TypingIndicator";
import { PresenceIndicator } from "./PresenceIndicator";
import { useMessages, useMarkAsRead } from "@/lib/chatQueries";
import { useChatMessages } from "@/hooks/useChatMessages";
import { useSocket } from "@/hooks/useSocket";
import { useLanguage, translations } from "@/lib/i18n";
import { getApiUrl } from "@/lib/queryClient";
import { cn } from "@/lib/utils";

interface ChatWindowProps {
  conversationId: string;
  currentUserId: string;
  title?: string;
  subtitle?: string;
  onClose?: () => void;
  className?: string;
  getUserName?: (userId: string) => string;
  getUserAvatar?: (userId: string) => string;
}

export function ChatWindow({
  conversationId,
  currentUserId,
  title,
  subtitle,
  onClose,
  className,
  getUserName,
  getUserAvatar,
}: ChatWindowProps) {
  const { connected } = useSocket();
  const { language } = useLanguage();
  const t = translations[language || 'fr'] || translations['fr'] || {};
  const { data: messages = [], isLoading } = useMessages(conversationId);
  const markAsReadMutation = useMarkAsRead();
  const [typingUsername, setTypingUsername] = useState<string | null>(null);

  const defaultTitle = title || 'Support';
  const defaultSubtitle = subtitle;

  const { sendMessage, startTyping, typingUsers } = useChatMessages({
    conversationId,
    onTyping: (data) => {
      setTypingUsername(data.username);
    },
    onStoppedTyping: () => {
      setTypingUsername(null);
    },
  });

  useEffect(() => {
    const unreadMessages = messages.filter(
      (msg) => !msg.isRead && msg.senderId !== currentUserId
    );

    if (unreadMessages.length > 0) {
      const timeoutId = setTimeout(() => {
        markAsReadMutation.mutate({
          conversationId,
          messageIds: unreadMessages.map((m) => m.id),
        });
      }, 1000);

      return () => clearTimeout(timeoutId);
    }
  }, [messages, conversationId, currentUserId, markAsReadMutation]);

  const handleSendMessage = async (content: string, file?: File) => {
    if (file) {
      try {
        // Get CSRF token
        const csrfResponse = await fetch(getApiUrl('/api/csrf-token'), {
          credentials: 'include',
        });
        const { csrfToken } = await csrfResponse.json();

        // Upload file using FormData
        const formData = new FormData();
        formData.append('file', file);
        
        const uploadResponse = await fetch(getApiUrl('/api/chat/upload'), {
          method: 'POST',
          body: formData,
          credentials: 'include',
          headers: {
            'X-CSRF-Token': csrfToken,
          },
        });

        if (!uploadResponse.ok) {
          throw new Error('File upload failed');
        }

        const { fileUrl, fileName } = await uploadResponse.json();

        // Send message with file reference
        sendMessage(content, fileUrl, fileName);
      } catch (error) {
        console.error('Failed to upload file:', error);
        // Still send message without file if upload fails
        sendMessage(content);
      }
    } else {
      sendMessage(content);
    }
    playNotificationSound();
  };

  const playNotificationSound = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
    } catch (e) {
      // Audio context not available, silent fail
    }
  };

  const isTyping = typingUsers.length > 0;
  const displayTypingUsername = typingUsers[0]?.username || typingUsername || undefined;

  return (
    <Card className={cn("flex flex-col h-full", className)} data-testid="chat-window">
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-4 border-b">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="relative">
            <Users className="h-5 w-5 text-primary" />
            {connected && (
              <div className="absolute -top-1 -right-1">
                <PresenceIndicator status="online" size="sm" showTooltip={false} />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base truncate" data-testid="text-chat-title">
              {defaultTitle}
            </h3>
            {defaultSubtitle && (
              <p className="text-xs text-muted-foreground truncate" data-testid="text-chat-subtitle">
                {defaultSubtitle}
              </p>
            )}
            {!defaultSubtitle && (
              <div className="flex items-center gap-1.5">
                <Circle
                  className={cn(
                    "h-2 w-2",
                    connected ? "fill-green-500 text-green-500" : "fill-muted-foreground text-muted-foreground"
                  )}
                />
                <span className="text-xs text-muted-foreground" data-testid="text-connection-status">
                  {connected ? 'Online' : 'Offline'}
                </span>
              </div>
            )}
          </div>
        </div>

        {onClose && (
          <Button
            size="icon"
            variant="ghost"
            onClick={onClose}
            data-testid="button-close-chat"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
        <MessageList
          messages={messages}
          currentUserId={currentUserId}
          isLoading={isLoading}
          getUserName={getUserName}
          getUserAvatar={getUserAvatar}
        />

        {isTyping && (
          <TypingIndicator 
            isTyping={isTyping} 
            username={displayTypingUsername}
            typingText="is typing..."
            typingGeneralText="Someone is typing..."
          />
        )}

        <MessageInput
          onSend={handleSendMessage}
          onTyping={startTyping}
          disabled={!connected}
          allowFileUpload={true}
          placeholder="Type your message..."
          sendHint="Press Enter to send"
        />
      </CardContent>
    </Card>
  );
}
