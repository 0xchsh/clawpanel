"use client";

import type { CronRun } from "@/types";
import { StatusBadge } from "@/components/status-badge";
import { formatRelativeTime, formatDuration } from "@/lib/format";

interface CronHistoryProps {
  runs: CronRun[];
}

export function CronHistory({ runs }: CronHistoryProps) {
  if (runs.length === 0) {
    return (
      <p className="py-4 text-center text-[13px] text-muted">No run history</p>
    );
  }

  return (
    <div className="space-y-2">
      {runs.map((run) => (
        <div
          key={run.id}
          className="rounded-xl bg-foreground/[0.02] p-4"
          style={{ boxShadow: "0 0 0 1px rgba(0, 0, 0, 0.04)" }}
        >
          <div className="flex items-center justify-between">
            <StatusBadge status={run.status} />
            <span className="text-[11px] text-muted/40" suppressHydrationWarning>
              {formatRelativeTime(run.startedAt)}
            </span>
          </div>
          {run.durationMs !== undefined && (
            <p className="mt-1 text-[11px] text-muted">
              Duration: {formatDuration(run.durationMs)}
            </p>
          )}
          {run.output && (
            <p className="mt-2 rounded-lg bg-foreground/[0.02] p-2.5 font-mono text-[12px] text-foreground">
              {run.output}
            </p>
          )}
          {run.error && (
            <p className="mt-2 rounded-lg bg-accent-red/5 p-2.5 font-mono text-[12px] text-accent-red" style={{ boxShadow: "0 0 0 1px rgba(239, 68, 68, 0.1)" }}>
              {run.error}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
