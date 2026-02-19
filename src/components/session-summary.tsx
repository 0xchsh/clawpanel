"use client";

import type { Session } from "@/types";
import Link from "next/link";

interface SessionSummaryProps {
  sessions: Session[];
}

const kindBadgeColor: Record<string, string> = {
  chat: "bg-foreground/5 text-foreground",
  cron: "bg-foreground/5 text-foreground",
  api: "bg-accent-green/10 text-accent-green",
  system: "bg-foreground/5 text-muted",
};

function formatRelativeTime(timestamp: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - new Date(timestamp).getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  if (diffMinutes < 1) return "just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${Math.floor(diffHours / 24)}d ago`;
}

function formatTokens(count: number): string {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K`;
  return `${count}`;
}

export function SessionSummary({ sessions }: SessionSummaryProps) {
  const recent = sessions
    .slice()
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 8);

  return (
    <div className="panel-frame overflow-hidden">
      <div className="flex items-center justify-between px-6 py-3">
        <h3 className="text-[12px] font-medium text-muted">
          Recent Sessions
        </h3>
        <Link
          href="/sessions"
          className="text-[12px] text-muted transition-colors duration-150 hover:text-foreground"
        >
          View all &rarr;
        </Link>
      </div>
      <div className="divide-y divide-card-border/40">
        {recent.map((session) => (
          <div
            key={session.id}
            className="flex items-center gap-3 px-6 py-3 transition-colors duration-150 hover:bg-card-hover/30"
          >
            <span
              className={`shrink-0 rounded-md px-2 py-0.5 text-[11px] font-medium ${
                kindBadgeColor[session.kind] || kindBadgeColor.system
              }`}
            >
              {session.kind}
            </span>
            <span className="text-[13px] truncate flex-1">{session.label}</span>
            <span className="text-[12px] font-mono text-muted shrink-0" style={{ fontVariantNumeric: "tabular-nums" }}>
              {formatTokens(session.tokens)}
            </span>
            <span
              className="text-[11px] text-muted/40 shrink-0"
              suppressHydrationWarning
            >
              {formatRelativeTime(session.updatedAt)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
