import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { Check, CheckCheck, FileText } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { ChatMessage } from "@shared/schema";

interface MessageProps {
  message: ChatMessage;
  isOwn: boolean;
  senderName?: string;
  senderAvatar?: string;
}

export function Message({ message, isOwn, senderName, senderAvatar }: MessageProps) {
  const getInitials = (name?: string) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div
      className={cn(
        "flex gap-3 mb-4",
        isOwn ? "flex-row-reverse" : "flex-row"
      )}
      data-testid={`message-${message.id}`}
    >
      {!isOwn && (
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarImage src={senderAvatar} alt={senderName} />
          <AvatarFallback>{getInitials(senderName)}</AvatarFallback>
        </Avatar>
      )}

      <div
        className={cn(
          "flex flex-col gap-1 max-w-[70%]",
          isOwn ? "items-end" : "items-start"
        )}
      >
        {!isOwn && senderName && (
          <span className="text-sm text-muted-foreground px-3" data-testid="text-sender-name">
            {senderName}
          </span>
        )}

        <div
          className={cn(
            "rounded-md px-4 py-2",
            isOwn
              ? "bg-primary text-primary-foreground"
              : "bg-muted"
          )}
        >
          {message.fileUrl && (
            <a
              href={message.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "flex items-center gap-2 mb-2 hover-elevate rounded-md p-2",
                isOwn ? "bg-primary-foreground/10" : "bg-background/50"
              )}
              data-testid={`link-file-${message.id}`}
            >
              <FileText className="h-4 w-4" />
              <span className="text-sm truncate">
                {message.fileName || "Fichier joint"}
              </span>
            </a>
          )}

          <p className="text-sm whitespace-pre-wrap break-words" data-testid="text-message-content">
            {message.content}
          </p>
        </div>

        <div
          className={cn(
            "flex items-center gap-2 px-3",
            isOwn ? "flex-row-reverse" : "flex-row"
          )}
        >
          <span className="text-xs text-muted-foreground" data-testid="text-timestamp">
            {formatDistanceToNow(new Date(message.createdAt), {
              addSuffix: true,
              locale: fr,
            })}
          </span>

          {isOwn && (
            <div data-testid="icon-read-status">
              {message.isRead ? (
                <CheckCheck className="h-3 w-3 text-primary" />
              ) : (
                <Check className="h-3 w-3 text-muted-foreground" />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
