import { useEffect, useRef, useState } from "react";
import { format, isToday, isYesterday, isSameDay } from "date-fns";
import { enUS } from "date-fns/locale";
import { ArrowDown } from "lucide-react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Button } from "@/components/ui/button";
import { Message } from "./Message";
import type { ChatMessage } from "@shared/schema";

interface MessageListProps {
  messages: ChatMessage[];
  currentUserId: string;
  isLoading?: boolean;
  getUserName?: (userId: string) => string;
  getUserAvatar?: (userId: string) => string;
}

export function MessageList({
  messages,
  currentUserId,
  isLoading = false,
  getUserName,
  getUserAvatar,
}: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);

  const groupedMessages = messages.reduce((groups, message) => {
    const messageDate = new Date(message.createdAt);
    const dateKey = format(messageDate, "yyyy-MM-dd");

    if (!groups[dateKey]) {
      groups[dateKey] = {
        date: messageDate,
        messages: [],
      };
    }

    groups[dateKey].messages.push(message);
    return groups;
  }, {} as Record<string, { date: Date; messages: ChatMessage[] }>);

  const flattenedItems: Array<
    | { type: "date"; date: Date; key: string }
    | { type: "message"; message: ChatMessage; key: string }
  > = [];

  Object.entries(groupedMessages).forEach(([dateKey, { date, messages: dayMessages }]) => {
    flattenedItems.push({ type: "date", date, key: `date-${dateKey}` });
    dayMessages.forEach((message) => {
      flattenedItems.push({ type: "message", message, key: message.id });
    });
  });

  const virtualizer = useVirtualizer({
    count: flattenedItems.length,
    getScrollElement: () => containerRef.current,
    estimateSize: (index) => {
      const item = flattenedItems[index];
      if (item.type === "date") return 60;
      // Estimate larger size to account for images/PDFs
      // Images can be up to 384px (max-h-96) + padding/margins
      const message = item.message;
      if (message?.fileUrl && message?.fileName) {
        const fileName = message.fileName.toLowerCase();
        const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
        const isPdf = fileName.endsWith('.pdf');
        if (imageExtensions.some(ext => fileName.endsWith(ext))) {
          return 450; // Image (up to 384px) + text + spacing
        }
        if (isPdf) {
          return 450; // PDF preview (up to 384px) + spacing
        }
      }
      return 100; // Text-only message
    },
    overscan: 10,
  });

  const scrollToBottom = (smooth = true) => {
    messagesEndRef.current?.scrollIntoView({ behavior: smooth ? "smooth" : "auto" });
  };

  useEffect(() => {
    scrollToBottom(false);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const isScrolledToBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight < 100;

    if (isScrolledToBottom) {
      scrollToBottom();
    }
  }, [messages]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const isScrolledToBottom =
        container.scrollHeight - container.scrollTop - container.clientHeight < 100;
      setShowScrollButton(!isScrolledToBottom);
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  const getDateLabel = (date: Date) => {
    if (isToday(date)) {
      return "Today";
    }
    if (isYesterday(date)) {
      return "Yesterday";
    }
    return format(date, "EEEE d MMMM yyyy", { locale: enUS });
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="space-y-4 w-full max-w-2xl">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex gap-3 animate-pulse"
              data-testid={`skeleton-message-${i}`}
            >
              <div className="h-8 w-8 rounded-full bg-muted" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-24 bg-muted rounded" />
                <div className="h-16 bg-muted rounded-md" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-6" data-testid="empty-messages">
        <div className="text-center text-muted-foreground">
          <p className="text-lg mb-2">No messages</p>
          <p className="text-sm">Start a conversation by sending a message</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 relative">
      <div
        ref={containerRef}
        className="absolute inset-0 overflow-y-auto px-6 py-8"
        data-testid="message-list-container"
      >
        <div className="max-w-2xl mx-auto">
          <div
            style={{
              height: `${virtualizer.getTotalSize()}px`,
              width: "100%",
              position: "relative",
            }}
          >
            {virtualizer.getVirtualItems().map((virtualItem) => {
              const item = flattenedItems[virtualItem.index];

              return (
                <div
                  key={virtualItem.key}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    transform: `translateY(${virtualItem.start}px)`,
                  }}
                >
                  {item.type === "date" ? (
                    <div className="flex items-center justify-center my-6">
                      <div
                        className="bg-muted px-3 py-1 rounded-full text-xs text-muted-foreground"
                        data-testid="text-date-separator"
                      >
                        {getDateLabel(item.date)}
                      </div>
                    </div>
                  ) : (
                    <Message
                      message={item.message}
                      isOwn={item.message.senderId === currentUserId}
                      senderName={getUserName?.(item.message.senderId)}
                      senderAvatar={getUserAvatar?.(item.message.senderId)}
                      nextMessage={
                        virtualItem.index + 1 < flattenedItems.length
                          ? (() => {
                              const nextItem = flattenedItems[virtualItem.index + 1];
                              return nextItem.type === "message" ? nextItem.message : null;
                            })()
                          : null
                      }
                    />
                  )}
                </div>
              );
            })}
          </div>

          <div ref={messagesEndRef} />
        </div>
      </div>

      {showScrollButton && (
        <div className="absolute bottom-6 right-6">
          <Button
            size="icon"
            variant="secondary"
            onClick={() => scrollToBottom()}
            className="rounded-full shadow-lg"
            data-testid="button-scroll-to-bottom"
          >
            <ArrowDown className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
