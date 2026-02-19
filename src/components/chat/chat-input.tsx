"use client";

import { useState, useRef, useCallback, KeyboardEvent } from "react";
import { ArrowUp } from "lucide-react";

interface ChatInputProps {
  onSend: (message: string) => void;
}

export function ChatInput({ onSend }: ChatInputProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    const maxHeight = 4 * 24;
    textarea.style.height = `${Math.min(textarea.scrollHeight, maxHeight)}px`;
  }, []);

  const handleSend = useCallback(() => {
    const trimmed = value.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setValue("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }, [value, onSend]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const isEmpty = value.trim().length === 0;

  return (
    <div className="border-t border-card-border bg-background-deep/50 px-4 py-3">
      <div className="flex items-end gap-2 rounded-xl border border-card-border bg-input-bg px-4 py-2">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            adjustHeight();
          }}
          onKeyDown={handleKeyDown}
          placeholder="Send a message..."
          rows={1}
          className="flex-1 resize-none bg-transparent text-sm leading-6 text-foreground placeholder:text-muted/50 outline-none"
        />
        <button
          onClick={handleSend}
          disabled={isEmpty}
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors ${
            isEmpty
              ? "bg-card-border text-muted/40 cursor-not-allowed"
              : "bg-gold text-background-deep hover:bg-gold-light cursor-pointer"
          }`}
        >
          <ArrowUp size={16} />
        </button>
      </div>
    </div>
  );
}
