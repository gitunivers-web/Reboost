import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useChat } from "@/hooks/useChat";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, User, Circle } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import type { Message } from "@shared/schema";

interface ChatBoxProps {
  userId: string;
  partnerId: string;
  partnerName: string;
}

export function ChatBox({ userId, partnerId, partnerName }: ChatBoxProps) {
  const [input, setInput] = useState("");
  const [isComposing, setIsComposing] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  const room = [userId, partnerId].sort().join("_");
  const { messages: realtimeMessages, isSelfConnected, isPartnerOnline, isTyping, sendMessage, sendTypingStatus } = useChat({ room, userId, partnerId });

  const { data: historyMessages = [] } = useQuery<Message[]>({
    queryKey: ["/api/chat/conversation", partnerId],
  });

  const allMessages = [...historyMessages, ...realtimeMessages].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  const uniqueMessages = allMessages.filter(
    (msg, index, self) => index === self.findIndex((m) => m.id === msg.id)
  );

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [uniqueMessages]);

  const handleSend = () => {
    if (!input.trim()) return;
    sendMessage(input, partnerId);
    setInput("");
    sendTypingStatus(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);

    if (!isComposing) {
      sendTypingStatus(true);

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      typingTimeoutRef.current = setTimeout(() => {
        sendTypingStatus(false);
      }, 2000);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="flex items-center gap-3 p-4 border-b bg-card">
        <Avatar>
          <AvatarFallback className="bg-primary/10 text-primary">
            <User className="w-4 h-4" />
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h3 className="font-semibold text-foreground" data-testid="text-partner-name">{partnerName}</h3>
          <div className="flex items-center gap-1.5 text-xs">
            <Circle
              className={`w-2 h-2 ${
                isPartnerOnline ? "fill-green-500 text-green-500" : "fill-muted text-muted"
              }`}
            />
            <span className="text-muted-foreground">
              {isPartnerOnline ? "En ligne" : "Hors ligne"}
            </span>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {uniqueMessages.map((msg) => {
            const isMine = msg.senderId === userId;
            const messageTime = new Date(msg.createdAt);

            return (
              <div
                key={msg.id}
                className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                data-testid={`message-${msg.id}`}
              >
                <div
                  className={`max-w-[70%] rounded-md px-4 py-2.5 ${
                    isMine
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                  <p
                    className={`text-xs mt-1 ${
                      isMine ? "text-primary-foreground/70" : "text-muted-foreground"
                    }`}
                  >
                    {format(messageTime, "HH:mm", { locale: fr })}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={scrollRef} />
        </div>

        {isTyping && (
          <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
            <span className="flex gap-1">
              <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
            </span>
            <span>{partnerName} est en train d'écrire...</span>
          </div>
        )}
      </ScrollArea>

      <div className="p-4 border-t bg-card">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <Input
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onCompositionStart={() => setIsComposing(true)}
            onCompositionEnd={() => setIsComposing(false)}
            placeholder="Écrire un message..."
            className="flex-1"
            data-testid="input-chat-message"
            disabled={!isSelfConnected}
          />
          <Button
            type="submit"
            size="icon"
            disabled={!input.trim() || !isSelfConnected}
            data-testid="button-send-message"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
