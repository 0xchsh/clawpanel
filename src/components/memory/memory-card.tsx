"use client";

import type { Memory, MemorySource } from "@/types";

const sourceBadgeColors: Record<MemorySource, string> = {
  conversation: "var(--accent)",
  research: "var(--teal)",
  observation: "var(--accent-green)",
  reflection: "var(--accent-yellow)",
  user_note: "var(--muted)",
};

const sourceLabels: Record<MemorySource, string> = {
  conversation: "Conversation",
  research: "Research",
  observation: "Observation",
  reflection: "Reflection",
  user_note: "Note",
};

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

interface MemoryCardProps {
  memory: Memory;
  selected: boolean;
  onSelect: (id: string) => void;
}

export function MemoryCard({ memory, selected, onSelect }: MemoryCardProps) {
  return (
    <button
      onClick={() => onSelect(memory.id)}
      className={`w-full text-left px-4 py-3 transition-colors duration-100 border-l-2 ${
        selected
          ? "border-l-accent bg-accent/5"
          : "border-l-transparent hover:bg-card-hover"
      }`}
    >
      <div className="flex items-center gap-2 mb-1">
        <span className="text-sm">{memory.agentEmoji}</span>
        <h3 className="text-[13px] font-medium text-foreground truncate flex-1">
          {memory.title}
        </h3>
      </div>
      <p className="text-[12px] text-muted line-clamp-2 mb-2">
        {memory.summary}
      </p>
      <div className="flex items-center gap-2">
        <span
          className="rounded-full px-1.5 py-0.5 text-[10px] font-medium text-white/90"
          style={{ background: sourceBadgeColors[memory.source] }}
        >
          {sourceLabels[memory.source]}
        </span>
        {memory.tags.slice(0, 2).map((tag) => (
          <span
            key={tag}
            className="rounded-full px-1.5 py-0.5 text-[10px] font-medium text-muted"
            style={{ background: "var(--pill-bg)", boxShadow: "0 0 0 1px var(--shadow-border)" }}
          >
            {tag}
          </span>
        ))}
        <span className="text-[10px] text-muted/50 ml-auto tabular-nums">
          {timeAgo(memory.updatedAt)}
        </span>
      </div>
    </button>
  );
}
