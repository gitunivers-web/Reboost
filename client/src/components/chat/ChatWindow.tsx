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
  const t = translations[language || 'fr'] || translations['fr'];
  const { data: messages = [], isLoading } = useMessages(conversationId);
  const markAsReadMutation = useMarkAsRead();
  const [typingUsername, setTypingUsername] = useState<string | null>(null);

  const defaultTitle = title || t?.chat?.window?.title || 'Conversation';
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

  const handleSendMessage = (content: string, file?: File) => {
    if (file) {
      console.log("File upload not yet implemented:", file.name);
      return;
    }

    sendMessage(content);
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
                  {connected ? (t?.chat?.window?.online || 'En ligne') : (t?.chat?.window?.offline || 'Hors ligne')}
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
            typingText={t?.chat?.window?.typing || 'écrit...'}
            typingGeneralText={t?.chat?.window?.typingGeneral || 'Quelqu\'un écrit...'}
          />
        )}

        <MessageInput
          onSend={handleSendMessage}
          onTyping={startTyping}
          disabled={!connected}
          allowFileUpload={false}
          placeholder={t?.chat?.input?.placeholder || 'Écrivez votre message...'}
          sendHint={t?.chat?.input?.sendHint || 'Appuyez sur Entrée pour envoyer'}
        />
      </CardContent>
    </Card>
  );
}
