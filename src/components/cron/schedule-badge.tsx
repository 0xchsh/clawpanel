"use client";

import type { CronScheduleType } from "@/types";
import { Clock, RefreshCw, Terminal } from "lucide-react";

const scheduleConfig: Record<
  CronScheduleType,
  { icon: typeof Clock; bg: string }
> = {
  at: { icon: Clock, bg: "bg-accent-green/10 text-accent-green" },
  every: { icon: RefreshCw, bg: "bg-foreground/5 text-foreground" },
  cron: { icon: Terminal, bg: "bg-foreground/5 text-muted" },
};

interface ScheduleBadgeProps {
  type: CronScheduleType;
  readable: string;
}

export function ScheduleBadge({ type, readable }: ScheduleBadgeProps) {
  const config = scheduleConfig[type];
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-medium ${config.bg}`}
    >
      <Icon size={10} />
      {readable}
    </span>
  );
}
