"use client";

import { useState } from "react";
import { useGatewayContext } from "@/contexts/gateway-context";
import { PageHeader } from "@/components/page-header";
import { CronJobList } from "@/components/cron/cron-job-list";
import { CronJobDetail } from "@/components/cron/cron-job-detail";
import { Clock } from "lucide-react";
import { EmptyState } from "@/components/empty-state";

export default function CronPage() {
  const { cronJobs, toggleCronJob, runCronJob } = useGatewayContext();
  const [selectedId, setSelectedId] = useState<string | null>(
    cronJobs[0]?.id ?? null
  );

  const selectedJob = cronJobs.find((j) => j.id === selectedId);

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <PageHeader
        title="Cron Jobs"
        description={`${cronJobs.filter((j) => j.enabled).length} active, ${cronJobs.filter((j) => !j.enabled).length} paused`}
      />
      <div className="flex flex-1 overflow-hidden">
        <div className="w-[60%] border-r border-card-border overflow-hidden">
          <CronJobList
            jobs={cronJobs}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onToggle={toggleCronJob}
          />
        </div>
        <div className="w-[40%] overflow-hidden">
          {selectedJob ? (
            <CronJobDetail
              job={selectedJob}
              onRunNow={() => runCronJob(selectedJob.id)}
            />
          ) : (
            <EmptyState
              icon={Clock}
              title="No job selected"
              description="Select a cron job from the list to view its details and history."
            />
          )}
        </div>
      </div>
    </div>
  );
}
