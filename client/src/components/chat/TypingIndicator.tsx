import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface TypingIndicatorProps {
  isTyping: boolean;
  username?: string;
  className?: string;
  typingText?: string;
  typingGeneralText?: string;
}

export function TypingIndicator({
  isTyping,
  username,
  className,
  typingText = "is typing...",
  typingGeneralText = "Someone is typing...",
}: TypingIndicatorProps) {
  if (!isTyping) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className={cn("flex items-center gap-2 px-6 py-2", className)}
      data-testid="typing-indicator"
    >
      <div className="flex items-center gap-1">
        <motion.div
          className="h-2 w-2 rounded-full bg-primary"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            delay: 0,
          }}
        />
        <motion.div
          className="h-2 w-2 rounded-full bg-primary"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            delay: 0.2,
          }}
        />
        <motion.div
          className="h-2 w-2 rounded-full bg-primary"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            delay: 0.4,
          }}
        />
      </div>
      <span className="text-sm text-muted-foreground" data-testid="text-typing-username">
        {username ? `${username} ${typingText}` : typingGeneralText}
      </span>
    </motion.div>
  );
}
