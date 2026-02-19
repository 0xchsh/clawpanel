"use client";

import type { CronJob } from "@/types";
import { ToggleSwitch } from "@/components/toggle-switch";
import { ScheduleBadge } from "./schedule-badge";
import { formatRelativeTime } from "@/lib/format";

interface CronJobCardProps {
  job: CronJob;
  selected: boolean;
  onSelect: () => void;
  onToggle: () => void;
}

export function CronJobCard({
  job,
  selected,
  onSelect,
  onToggle,
}: CronJobCardProps) {
  return (
    <div
      onClick={onSelect}
      className={`flex items-start gap-3 rounded-xl p-4 transition-colors duration-150 cursor-pointer ${
        selected
          ? "bg-foreground/[0.03]"
          : "hover:bg-card-hover/50"
      }`}
      style={{ boxShadow: selected ? "0 0 0 1px rgba(0, 0, 0, 0.08)" : "0 0 0 1px rgba(0, 0, 0, 0.04)" }}
    >
      <span
        className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
          job.enabled ? "bg-accent-green" : "bg-muted/30"
        }`}
      />

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-[13px] font-medium text-foreground">{job.name}</span>
        </div>
        <div className="mt-1">
          <ScheduleBadge
            type={job.schedule.type}
            readable={job.schedule.readable}
          />
        </div>
        <div className="mt-1.5 flex items-center gap-3 text-[10px] text-muted/40">
          {job.nextRun && (
            <span suppressHydrationWarning>
              Next: {formatRelativeTime(job.nextRun)}
            </span>
          )}
          {job.lastRun && (
            <span suppressHydrationWarning>
              Last: {formatRelativeTime(job.lastRun)}
            </span>
          )}
        </div>
      </div>

      <div onClick={(e) => e.stopPropagation()}>
        <ToggleSwitch enabled={job.enabled} onToggle={onToggle} size="sm" />
      </div>
    </div>
  );
}
