"use client";

import { useEffect, useRef } from "react";
import { ChatMessage, AgentFile } from "@/types";
import { Message } from "./message";
import { ChatInput } from "./chat-input";
import { ArrowLeft, FileText } from "lucide-react";

interface ChatAreaProps {
  messages: ChatMessage[];
  onSendMessage: (content: string) => void;
  selectedFile: AgentFile | null;
  onCloseFile: () => void;
}

function FilePreview({
  file,
  onClose,
}: {
  file: AgentFile;
  onClose: () => void;
}) {
  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex items-center gap-3 border-b border-card-border px-4 py-3">
        <button
          onClick={onClose}
          className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-card transition-colors cursor-pointer text-muted hover:text-foreground"
        >
          <ArrowLeft size={16} />
        </button>
        <FileText size={16} className="text-gold-dim" />
        <span className="text-sm font-medium">{file.name}</span>
        <span className="text-xs text-muted">.{file.extension}</span>
      </div>
      <div className="flex-1 overflow-auto p-4">
        <pre className="rounded-lg border border-card-border bg-background-deep p-4 font-mono text-sm leading-relaxed overflow-x-auto">
          <code>{file.content ?? "No content available"}</code>
        </pre>
      </div>
    </div>
  );
}

export function ChatArea({
  messages,
  onSendMessage,
  selectedFile,
  onCloseFile,
}: ChatAreaProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  if (selectedFile) {
    return <FilePreview file={selectedFile} onClose={onCloseFile} />;
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4">
        <div className="mx-auto max-w-2xl space-y-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <p className="text-sm text-muted">No messages yet</p>
              <p className="mt-1 text-xs text-muted/60">
                Send a message to start the conversation
              </p>
            </div>
          )}
          {messages.map((msg) => (
            <Message key={msg.id} message={msg} />
          ))}
        </div>
      </div>
      <div className="mx-auto w-full max-w-2xl">
        <ChatInput onSend={onSendMessage} />
      </div>
    </div>
  );
}
