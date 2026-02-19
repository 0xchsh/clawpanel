"use client";

import type { CronJob } from "@/types";
import { ScheduleBadge } from "./schedule-badge";
import { CronHistory } from "./cron-history";
import { Play } from "lucide-react";
import { formatRelativeTime } from "@/lib/format";

interface CronJobDetailProps {
  job: CronJob;
  onRunNow: () => void;
}

export function CronJobDetail({ job, onRunNow }: CronJobDetailProps) {
  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              {job.name}
            </h2>
            <p className="mt-1 text-[13px] text-muted">{job.description}</p>
          </div>
          <button
            onClick={onRunNow}
            disabled={!job.enabled}
            aria-label={`Run ${job.name} now`}
            className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-medium transition-colors duration-150 ${
              job.enabled
                ? "bg-foreground text-background cursor-pointer hover:bg-foreground/90 active:scale-[0.97]"
                : "bg-card-border text-muted cursor-not-allowed"
            }`}
          >
            <Play size={13} />
            Run Now
          </button>
        </div>

        <Section title="Schedule">
          <div className="space-y-2">
            <ScheduleBadge
              type={job.schedule.type}
              readable={job.schedule.readable}
            />
            <p className="font-mono text-[13px] text-muted">
              {job.schedule.expression}
            </p>
            <div className="flex gap-4 text-[12px] text-muted">
              {job.nextRun && (
                <span suppressHydrationWarning>
                  Next run:{" "}
                  <span className="text-foreground">
                    {formatRelativeTime(job.nextRun)}
                  </span>
                </span>
              )}
              {job.lastRun && (
                <span suppressHydrationWarning>
                  Last run:{" "}
                  <span className="text-foreground">
                    {formatRelativeTime(job.lastRun)}
                  </span>
                </span>
              )}
            </div>
          </div>
        </Section>

        {job.payload && (
          <Section title="Payload">
            <pre className="whitespace-pre-wrap rounded-lg bg-foreground/[0.02] p-4 font-mono text-[13px] text-muted">
              {job.payload}
            </pre>
          </Section>
        )}

        {job.deliveryChannel && (
          <Section title="Delivery">
            <span className="text-[13px]">{job.deliveryChannel}</span>
          </Section>
        )}

        <Section title="Run History">
          <CronHistory runs={job.runs} />
        </Section>

        <div className="rounded-xl bg-foreground/[0.02] p-4" style={{ boxShadow: "0 0 0 1px rgba(0, 0, 0, 0.04)" }}>
          <p className="text-[13px] text-muted leading-relaxed">
            To add a cron job, run{" "}
            <code className="rounded bg-foreground/5 px-1.5 py-0.5 font-mono text-[12px] text-foreground">
              openclaw cron add --name &apos;...&apos; --cron &apos;...&apos;
            </code>{" "}
            or message your agent.
          </p>
        </div>
      </div>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="panel-frame p-5">
      <h3 className="mb-3 text-[12px] font-medium text-muted">
        {title}
      </h3>
      {children}
    </div>
  );
}
