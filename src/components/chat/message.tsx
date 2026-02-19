"use client";

import { ChatMessage, ToolCall } from "@/types";
import { Check, Loader2, X } from "lucide-react";

interface MessageProps {
  message: ChatMessage;
}

function formatRelativeTime(timestamp: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - new Date(timestamp).getTime();
  const diffSeconds = Math.floor(diffMs / 1000);

  if (diffSeconds < 10) return "just now";
  if (diffSeconds < 60) return `${diffSeconds}s ago`;

  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) return `${diffMinutes}m ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

function ToolCallCard({ toolCall }: { toolCall: ToolCall }) {
  const statusIcon = {
    running: <Loader2 size={14} className="animate-spin text-accent-yellow" />,
    completed: <Check size={14} className="text-accent-green" />,
    failed: <X size={14} className="text-accent-red" />,
  };

  return (
    <div className="flex items-center gap-2 rounded border border-card-border bg-background-deep px-3 py-1.5 text-xs">
      {statusIcon[toolCall.status]}
      <span className="font-mono text-muted">{toolCall.name}</span>
    </div>
  );
}

function renderContent(content: string) {
  const parts: React.ReactNode[] = [];
  const lines = content.split("\n");
  let i = 0;

  while (i < lines.length) {
    if (lines[i].startsWith("```")) {
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      i++;
      parts.push(
        <pre
          key={parts.length}
          className="my-2 overflow-x-auto rounded-lg border border-card-border bg-background-deep p-3 font-mono text-sm"
        >
          <code>{codeLines.join("\n")}</code>
        </pre>
      );
      continue;
    }

    const line = lines[i];
    const formatted = formatInline(line, parts.length);
    parts.push(
      <span key={parts.length}>
        {formatted}
        {i < lines.length - 1 && <br />}
      </span>
    );
    i++;
  }

  return parts;
}

function formatInline(text: string, keyBase: number): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  const regex = /(\*\*(.+?)\*\*|`([^`]+)`)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }

    if (match[2]) {
      nodes.push(
        <strong key={`${keyBase}-b-${match.index}`} className="font-semibold text-gold-light">
          {match[2]}
        </strong>
      );
    } else if (match[3]) {
      nodes.push(
        <code
          key={`${keyBase}-c-${match.index}`}
          className="rounded bg-background-deep border border-card-border px-1.5 py-0.5 font-mono text-sm text-teal-light"
        >
          {match[3]}
        </code>
      );
    }

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes;
}

export function Message({ message }: MessageProps) {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[80%] space-y-2 ${
          isUser
            ? "rounded-xl border border-gold-dim/30 bg-gold/8 px-4 py-3"
            : "px-1 py-1"
        }`}
      >
        <div className="text-sm leading-relaxed">
          {renderContent(message.content)}
        </div>

        {message.toolCalls && message.toolCalls.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {message.toolCalls.map((tc) => (
              <ToolCallCard key={tc.id} toolCall={tc} />
            ))}
          </div>
        )}

        <div
          className={`text-[11px] text-muted/50 ${isUser ? "text-right" : "text-left"}`}
          suppressHydrationWarning
        >
          {formatRelativeTime(message.timestamp)}
        </div>
      </div>
    </div>
  );
}
