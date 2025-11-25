import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { Check, CheckCheck, FileText, Download } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn, getFileUrl } from "@/lib/utils";
import type { ChatMessage } from "@shared/schema";
import { PdfViewer } from "./PdfViewer";

interface MessageProps {
  message: ChatMessage;
  isOwn: boolean;
  senderName?: string;
  senderAvatar?: string;
}

export function Message({ message, isOwn, senderName, senderAvatar }: MessageProps) {
  const [showPdfPreview, setShowPdfPreview] = useState(false);

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

  const isPdfFile = (fileName?: string | null, fileUrl?: string | null) => {
    if (!fileName && !fileUrl) return false;
    if (fileName && fileName.toLowerCase().endsWith('.pdf')) return true;
    // Fallback: check URL if fileName is missing (for old messages)
    if (fileUrl && fileUrl.toLowerCase().includes('.pdf')) return true;
    return false;
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
        "flex gap-4 mb-4",
        isOwn ? "flex-row-reverse justify-end" : "flex-row justify-start"
      )}
      data-testid={`message-${message.id}`}
    >
      {!isOwn && (
        <Avatar className="h-9 w-9 flex-shrink-0 mt-1">
          <AvatarImage src={senderAvatar} alt={senderName} />
          <AvatarFallback>{getInitials(senderName)}</AvatarFallback>
        </Avatar>
      )}

      <div
        className={cn(
          "flex flex-col gap-2",
          isOwn ? "items-end max-w-xs" : "items-start max-w-sm"
        )}
      >
        {!isOwn && senderName && (
          <span className="text-sm text-muted-foreground px-3" data-testid="text-sender-name">
            {senderName}
          </span>
        )}

        <div
          className={cn(
            "rounded-md px-4 py-3 space-y-3",
            isOwn
              ? "text-primary-foreground"
              : ""
          )}
        >
          {message.fileUrl && message.fileName && isImageFile(message.fileName) && (
            <div className="mb-2">
              <img
                src={getFileUrl(message.fileUrl)}
                alt={message.fileName}
                className="max-w-xs rounded-md max-h-72 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => window.open(getFileUrl(message.fileUrl)!, '_blank')}
                data-testid={`img-attachment-${message.id}`}
              />
            </div>
          )}

          {message.fileUrl && isPdfFile(message.fileName, message.fileUrl) && (
            <div className="mb-2">
              <PdfViewer
                storagePath={getFileUrl(message.fileUrl) || ''}
                fileName={message.fileName || 'Document.pdf'}
              />
            </div>
          )}

          {message.fileUrl && message.fileName && !isImageFile(message.fileName) && !isPdfFile(message.fileName, message.fileUrl) && (
            <div className="mb-2 rounded-md p-3">
              <a
                href={getFileUrl(message.fileUrl)}
                download
                className={cn(
                  "flex items-center gap-2 p-2 rounded-md",
                  isOwn ? "hover:bg-primary-foreground/10" : "hover:bg-background/50"
                )}
                data-testid={`link-file-${message.id}`}
              >
                {getFileIcon(message.fileName)}
                <span className="text-sm truncate flex-1">
                  {message.fileName}
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
