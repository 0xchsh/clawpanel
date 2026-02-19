"use client";

import type { CronJob } from "@/types";
import { CronJobCard } from "./cron-job-card";

interface CronJobListProps {
  jobs: CronJob[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onToggle: (id: string) => void;
}

export function CronJobList({
  jobs,
  selectedId,
  onSelect,
  onToggle,
}: CronJobListProps) {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-2">
      {jobs.map((job) => (
        <CronJobCard
          key={job.id}
          job={job}
          selected={selectedId === job.id}
          onSelect={() => onSelect(job.id)}
          onToggle={() => onToggle(job.id)}
        />
      ))}
    </div>
  );
}
