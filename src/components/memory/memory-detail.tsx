"use client";

import type { Memory, MemorySource } from "@/types";
import { MessageSquare, Search, Eye, Lightbulb, StickyNote } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const sourceIcons: Record<MemorySource, LucideIcon> = {
  conversation: MessageSquare,
  research: Search,
  observation: Eye,
  reflection: Lightbulb,
  user_note: StickyNote,
};

const sourceLabels: Record<MemorySource, string> = {
  conversation: "Conversation",
  research: "Research",
  observation: "Observation",
  reflection: "Reflection",
  user_note: "User Note",
};

const sourceBadgeColors: Record<MemorySource, string> = {
  conversation: "var(--accent)",
  research: "var(--teal)",
  observation: "var(--accent-green)",
  reflection: "var(--accent-yellow)",
  user_note: "var(--muted)",
};

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

interface MemoryDetailProps {
  memory: Memory;
}

export function MemoryDetail({ memory }: MemoryDetailProps) {
  const SourceIcon = sourceIcons[memory.source];

  return (
    <div className="flex flex-1 flex-col overflow-y-auto">
      <div className="px-5 py-4 space-y-3 border-b border-card-border">
        <h2 className="text-sm font-semibold text-foreground">
          {memory.title}
        </h2>
        <div className="flex items-center gap-3 text-[12px] text-muted">
          <span className="flex items-center gap-1.5">
            <span>{memory.agentEmoji}</span>
            {memory.agentName}
          </span>
          <span className="flex items-center gap-1">
            <SourceIcon size={12} />
            <span
              className="rounded-full px-1.5 py-0.5 text-[10px] font-medium text-white/90"
              style={{ background: sourceBadgeColors[memory.source] }}
            >
              {sourceLabels[memory.source]}
            </span>
          </span>
          <span className="tabular-nums">{formatDate(memory.updatedAt)}</span>
        </div>
      </div>

      <div className="flex-1 px-5 py-4">
        <pre className="text-[13px] text-foreground leading-relaxed whitespace-pre-wrap font-sans">
          {memory.content}
        </pre>
      </div>

      <div className="px-5 py-3 flex items-center gap-3 border-t border-card-border">
        <div className="flex flex-wrap gap-1 flex-1">
          {memory.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full px-1.5 py-0.5 text-[10px] font-medium text-muted"
              style={{ background: "var(--pill-bg)", boxShadow: "0 0 0 1px var(--shadow-border)" }}
            >
              {tag}
            </span>
          ))}
        </div>
        <span className="resource-pill text-[10px]">
          {memory.tokenCount.toLocaleString()} tokens
        </span>
      </div>
    </div>
  );
}
