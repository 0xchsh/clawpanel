"use client";

import { useState } from "react";
import { useGatewayContext } from "@/contexts/gateway-context";
import {
  Repeat,
  Play,
  CaretDown,
  CheckCircle,
  XCircle,
  CircleNotch,
  Clock,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

function Toggle({
  enabled,
  onToggle,
}: {
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      onClick={onToggle}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors duration-150",
        enabled ? "bg-foreground" : "bg-card-border"
      )}
    >
      <span
        className={cn(
          "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform duration-150 mt-[2px]",
          enabled ? "translate-x-5" : "translate-x-0.5"
        )}
      />
    </button>
  );
}

function formatDate(date: Date | undefined): string {
  if (!date) return "—";
  const d = new Date(date);
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDuration(ms: number | undefined): string {
  if (!ms) return "—";
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

const runStatusIcon: Record<string, typeof CheckCircle> = {
  success: CheckCircle,
  failure: XCircle,
  running: CircleNotch,
};

const runStatusColor: Record<string, string> = {
  success: "text-accent-green",
  failure: "text-accent-red",
  running: "text-accent-yellow",
};

export default function CronPage() {
  const { cronJobs, toggleCronJob, runCronJob } = useGatewayContext();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const activeCount = cronJobs.filter((j) => j.enabled).length;
  const pausedCount = cronJobs.filter((j) => !j.enabled).length;

  return (
    <div className="flex flex-col px-4 py-8 lg:px-0 lg:py-0">
      {/* Page title */}
      <div className="flex items-center justify-between h-9">
        <h1 className="text-xl font-semibold text-foreground">Jobs (CRON)</h1>
        <span className="text-base font-semibold text-muted">
          {activeCount} active, {pausedCount} paused
        </span>
      </div>

      <div className="flex flex-col gap-2 mt-8">
        {cronJobs.length === 0 && (
          <div className="bg-card border border-card-border rounded-lg p-8 text-center">
            <Repeat
              size={32}
              weight="regular"
              className="text-muted mx-auto mb-3"
            />
            <p className="text-sm font-semibold text-foreground">
              No cron jobs configured
            </p>
            <p className="text-xs text-muted mt-1">
              Schedule recurring tasks for your agents.
            </p>
          </div>
        )}

        {cronJobs.map((job) => {
          const expanded = expandedId === job.id;
          const lastRun = job.runs[0];

          return (
            <div key={job.id} className="bg-card border border-card-border rounded-lg">
              {/* Job row */}
              <div className="flex items-center gap-3 px-4 py-3">
                <button
                  type="button"
                  onClick={() => setExpandedId(expanded ? null : job.id)}
                  className="flex items-start gap-3 flex-1 min-w-0 cursor-pointer text-left"
                >
                  <Repeat
                    size={18}
                    weight="regular"
                    className={cn(
                      "shrink-0 mt-[3px]",
                      job.enabled ? "text-foreground" : "text-muted"
                    )}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "text-base font-semibold truncate",
                          job.enabled ? "text-foreground" : "text-muted"
                        )}
                      >
                        {job.name}
                      </span>
                      {lastRun && (
                        <span
                          className={cn(
                            "text-sm font-semibold shrink-0",
                            runStatusColor[lastRun.status]
                          )}
                        >
                          {lastRun.status}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Clock
                        size={14}
                        weight="regular"
                        className="text-muted shrink-0"
                      />
                      <span className="text-sm text-muted truncate">
                        {job.schedule.readable}
                      </span>
                    </div>
                  </div>
                </button>

                {/* Run now */}
                <button
                  type="button"
                  aria-label={`Run ${job.name} now`}
                  onClick={() => runCronJob(job.id)}
                  className="p-1.5 rounded-md text-muted hover:text-foreground hover:bg-card transition-colors duration-150 cursor-pointer shrink-0 active:scale-[0.97]"
                >
                  <Play size={14} weight="fill" />
                </button>

                <button
                  type="button"
                  aria-label={expanded ? "Collapse details" : "Expand details"}
                  onClick={() => setExpandedId(expanded ? null : job.id)}
                  className="p-1 rounded-md text-muted hover:text-foreground transition-colors duration-150 cursor-pointer shrink-0"
                >
                  <CaretDown
                    size={14}
                    weight="bold"
                    className={cn(
                      "transition-transform duration-200",
                      expanded && "rotate-180"
                    )}
                    style={{ transitionTimingFunction: "var(--ease-out)" }}
                  />
                </button>

                <Toggle
                  enabled={job.enabled}
                  onToggle={() => toggleCronJob(job.id)}
                />
              </div>

              {/* Expanded detail */}
              {expanded && (
                <div className="px-4 pb-4 pt-1 border-t border-card-border/50">
                  <div className="flex flex-col gap-2 mt-3">
                    <Row label="Description">
                      <span className="text-base text-foreground text-right max-w-[320px]">
                        {job.description}
                      </span>
                    </Row>
                    <Row label="Next Run">
                      <span className="text-base text-foreground">
                        {formatDate(job.nextRun)}
                      </span>
                    </Row>
                    <Row label="Last Run">
                      <span className="text-base text-foreground">
                        {formatDate(job.lastRun)}
                      </span>
                    </Row>
                    {job.deliveryChannel && (
                      <Row label="Channel">
                        <span className="text-base text-foreground">
                          {job.deliveryChannel}
                        </span>
                      </Row>
                    )}

                    {/* Run history */}
                    {job.runs.length > 0 && (
                      <div className="mt-3">
                        <p className="text-sm font-semibold text-muted mb-2">
                          Recent Runs
                        </p>
                        <div className="flex flex-col gap-1">
                          {job.runs.slice(0, 5).map((run) => {
                            const StatusIcon =
                              runStatusIcon[run.status] || CheckCircle;
                            return (
                              <div
                                key={run.id}
                                className="flex items-center justify-between py-1.5"
                              >
                                <div className="flex items-center gap-2">
                                  <StatusIcon
                                    size={16}
                                    weight={
                                      run.status === "running"
                                        ? "regular"
                                        : "fill"
                                    }
                                    className={cn(
                                      "shrink-0",
                                      runStatusColor[run.status]
                                    )}
                                  />
                                  <span className="text-sm text-muted">
                                    {formatDate(run.startedAt)}
                                  </span>
                                </div>
                                <span className="text-sm font-mono text-muted">
                                  {formatDuration(run.durationMs)}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted">{label}</span>
      {children}
    </div>
  );
}
