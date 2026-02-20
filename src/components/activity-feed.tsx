"use client";

import {
  GitBranch,
  FileText,
  Zap,
  MessageSquare,
  Clock,
  Radio,
  Laptop,
  KeyRound,
  Hammer,
} from "lucide-react";
import type { ActivityEvent, ActivityEventType } from "@/types";

const eventConfig: Record<
  ActivityEventType,
  { icon: typeof GitBranch; color: string }
> = {
  git: { icon: GitBranch, color: "text-foreground" },
  file: { icon: FileText, color: "text-teal-light" },
  skill: { icon: Zap, color: "text-accent-yellow" },
  message: { icon: MessageSquare, color: "text-foreground" },
  cron: { icon: Clock, color: "text-muted" },
  channel: { icon: Radio, color: "text-teal-light" },
  node: { icon: Laptop, color: "text-accent-green" },
  session: { icon: KeyRound, color: "text-muted" },
  build: { icon: Hammer, color: "text-foreground" },
};

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

function ActivityItem({ event }: { event: ActivityEvent }) {
  const config = eventConfig[event.type];
  const Icon = config.icon;

  return (
    <div
      className="flex items-start gap-3 rounded-xl px-4 py-3 transition-colors duration-150 hover:bg-card-hover/50 border border-transparent hover:border-card-border"
    >
      <div
        className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-background-deep ${config.color}`}
      >
        <Icon size={15} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[13px] text-foreground">
          <span className="font-medium">{event.agentName}</span>{" "}
          <span className="text-muted">{event.description}</span>
        </p>
        {event.detail && (
          <p className="mt-0.5 text-[12px] text-muted/60">{event.detail}</p>
        )}
      </div>
      <span
        className="shrink-0 text-[11px] text-muted/50"
        suppressHydrationWarning
      >
        {formatRelativeTime(event.timestamp)}
      </span>
    </div>
  );
}

interface ActivityFeedProps {
  events: ActivityEvent[];
}

export function ActivityFeed({ events }: ActivityFeedProps) {
  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-[12px] font-medium text-muted">
        Activity Feed
      </h2>
      <div className="flex flex-col gap-1">
        {events.map((event) => (
          <ActivityItem key={event.id} event={event} />
        ))}
      </div>
    </div>
  );
}
