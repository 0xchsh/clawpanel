"use client";

import { useGatewayContext } from "@/contexts/gateway-context";
import { PageHeader } from "@/components/page-header";
import { TaskColumn } from "@/components/tasks/task-column";
import type { TaskStatus } from "@/types";

const columns: TaskStatus[] = ["backlog", "in_progress", "review", "done"];

export default function TasksPage() {
  const { tasks, moveTask } = useGatewayContext();

  const byStatus = (status: TaskStatus) =>
    tasks.filter((t) => t.status === status);

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <PageHeader
        title="Tasks"
        description={`${tasks.filter((t) => t.status !== "done").length} open, ${tasks.filter((t) => t.status === "done").length} done`}
      />
      <div className="flex-1 overflow-x-auto overflow-y-hidden p-4">
        <div className="grid grid-cols-4 gap-3 h-full min-w-[720px]">
          {columns.map((status) => (
            <TaskColumn
              key={status}
              status={status}
              tasks={byStatus(status)}
              onMove={moveTask}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
