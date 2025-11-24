import { useState, useRef, useEffect } from "react";
import { Paperclip, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface MessageInputProps {
  onSend: (content: string, file?: File) => void;
  onTyping?: () => void;
  disabled?: boolean;
  maxLength?: number;
  placeholder?: string;
  allowFileUpload?: boolean;
}

export function MessageInput({
  onSend,
  onTyping,
  disabled = false,
  maxLength = 2000,
  placeholder = "Écrivez votre message...",
  allowFileUpload = false,
}: MessageInputProps) {
  const [content, setContent] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    if (newContent.length <= maxLength) {
      setContent(newContent);
      adjustTextareaHeight();

      if (onTyping) {
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
        onTyping();
        typingTimeoutRef.current = setTimeout(() => {
          // Stop typing indicator after 3 seconds of inactivity
        }, 3000);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    const trimmedContent = content.trim();
    if (trimmedContent || selectedFile) {
      onSend(trimmedContent, selectedFile || undefined);
      setContent("");
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.style.height = "auto";
          textareaRef.current.focus();
        }
      }, 0);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const charactersRemaining = maxLength - content.length;
  const showCharacterCount = charactersRemaining < 100;

  return (
    <div className="border-t bg-background p-4">
      <div className="max-w-3xl mx-auto">
        {selectedFile && (
          <div className="mb-3 flex items-center gap-2 bg-muted rounded-md p-3">
            <Paperclip className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm flex-1 truncate" data-testid="text-selected-file">
              {selectedFile.name}
            </span>
            <Button
              size="sm"
              variant="ghost"
              onClick={removeFile}
              data-testid="button-remove-file"
            >
              Retirer
            </Button>
          </div>
        )}

        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Textarea
              ref={textareaRef}
              value={content}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={disabled}
              className="min-h-[60px] max-h-[200px] resize-none"
              data-testid="input-message"
            />

            {showCharacterCount && (
              <div
                className={cn(
                  "absolute bottom-2 right-2 text-xs",
                  charactersRemaining < 50
                    ? "text-destructive"
                    : "text-muted-foreground"
                )}
                data-testid="text-character-count"
              >
                {charactersRemaining}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2">
            {allowFileUpload && (
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileSelect}
                  className="hidden"
                  data-testid="input-file"
                />
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={disabled}
                  data-testid="button-attach-file"
                >
                  <Paperclip className="h-4 w-4" />
                </Button>
              </>
            )}

            <Button
              size="icon"
              onClick={handleSubmit}
              disabled={disabled || (!content.trim() && !selectedFile)}
              data-testid="button-send-message"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="mt-2 text-xs text-muted-foreground">
          Appuyez sur Ctrl+Entrée pour envoyer
        </div>
      </div>
    </div>
  );
}
