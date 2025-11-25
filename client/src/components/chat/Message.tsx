import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { Check, CheckCheck, FileText, Download } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
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

  const isImageFile = (fileName?: string) => {
    if (!fileName) return false;
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    return imageExtensions.some(ext => fileName.toLowerCase().endsWith(ext));
  };

  const isPdfFile = (fileName?: string) => {
    if (!fileName) return false;
    return fileName.toLowerCase().endsWith('.pdf');
  };

  const getFileIcon = (fileName?: string) => {
    if (!fileName) return <FileText className="h-4 w-4" />;
    
    const ext = fileName.toLowerCase().split('.').pop() || '';
    switch (ext) {
      case 'pdf':
        return <FileText className="h-4 w-4" />;
      case 'doc':
      case 'docx':
        return <FileText className="h-4 w-4" />;
      case 'xls':
      case 'xlsx':
        return <FileText className="h-4 w-4" />;
      default:
        return <Download className="h-4 w-4" />;
    }
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
            "rounded-md px-4 py-2 space-y-2",
            isOwn
              ? "bg-primary text-primary-foreground"
              : "bg-muted"
          )}
        >
          {message.fileUrl && isImageFile(message.fileName) && (
            <div className="mt-2">
              <img
                src={message.fileUrl}
                alt={message.fileName || "Image jointe"}
                className="max-w-xs rounded-md max-h-64 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => window.open(message.fileUrl, '_blank')}
                data-testid={`img-attachment-${message.id}`}
              />
            </div>
          )}

          {message.fileUrl && isPdfFile(message.fileName) && (
            <div className="mt-2 border border-current border-opacity-20 rounded-md p-3 space-y-2">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                <span className="text-sm font-medium truncate">{message.fileName}</span>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  asChild
                  className="flex-1 text-xs h-8"
                  data-testid={`btn-view-pdf-${message.id}`}
                >
                  <a href={message.fileUrl} target="_blank" rel="noopener noreferrer">
                    Voir PDF
                  </a>
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  asChild
                  className="flex-1 text-xs h-8"
                  data-testid={`btn-download-pdf-${message.id}`}
                >
                  <a href={message.fileUrl} download>
                    Télécharger
                  </a>
                </Button>
              </div>
            </div>
          )}

          {message.fileUrl && !isImageFile(message.fileName) && !isPdfFile(message.fileName) && (
            <div className="mt-2 border border-current border-opacity-20 rounded-md p-3">
              <a
                href={message.fileUrl}
                download
                className={cn(
                  "flex items-center gap-2 p-2 rounded-md",
                  isOwn ? "hover:bg-primary-foreground/10" : "hover:bg-background/50"
                )}
                data-testid={`link-file-${message.id}`}
              >
                {getFileIcon(message.fileName)}
                <span className="text-sm truncate flex-1">
                  {message.fileName || "Fichier joint"}
                </span>
                <Download className="h-4 w-4 flex-shrink-0" />
              </a>
            </div>
          )}

          {message.content && (
            <p className="text-sm whitespace-pre-wrap break-words" data-testid="text-message-content">
              {message.content}
            </p>
          )}
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
