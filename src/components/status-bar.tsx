"use client";

import { FileText, HelpCircle } from "lucide-react";
import type { SessionInfo } from "@/types";

interface StatusBarProps {
  tokenCount: number;
  sessions: SessionInfo;
}

function formatTokenCount(count: number): string {
  if (count >= 1_000_000) {
    return `${(count / 1_000_000).toFixed(1)}M tokens`;
  }
  if (count >= 1_000) {
    return `${(count / 1_000).toFixed(1)}K tokens`;
  }
  return `${count} tokens`;
}

export function StatusBar({ tokenCount, sessions }: StatusBarProps) {
  return (
    <header className="flex h-10 items-center justify-between border-b border-card-border bg-card px-4">
      <div className="flex items-center gap-4">
        <span className="text-sm text-muted">
          <span className="font-mono text-foreground">
            {formatTokenCount(tokenCount)}
          </span>
        </span>
        <span className="text-sm text-muted">
          <span className="font-mono text-foreground">
            {sessions.active}/{sessions.total}
          </span>{" "}
          sessions
        </span>
      </div>

      <div className="flex items-center gap-1">
        <button
          type="button"
          className="flex h-7 items-center gap-1.5 rounded-md px-2 text-sm text-muted transition-colors hover:bg-card-border hover:text-foreground"
        >
          <FileText size={14} />
          View Reports
        </button>
        <button
          type="button"
          className="flex h-7 w-7 items-center justify-center rounded-md text-muted transition-colors hover:bg-card-border hover:text-foreground"
          aria-label="Help"
        >
          <HelpCircle size={14} />
        </button>
      </div>
    </header>
  );
}
