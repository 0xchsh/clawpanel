"use client";

import type { Task, TaskStatus } from "@/types";
import { TaskCard } from "./task-card";

const columnLabels: Record<TaskStatus, string> = {
  backlog: "Backlog",
  in_progress: "In Progress",
  review: "Review",
  done: "Done",
};

interface TaskColumnProps {
  status: TaskStatus;
  tasks: Task[];
  onMove: (taskId: string, newStatus: TaskStatus) => void;
}

export function TaskColumn({ status, tasks, onMove }: TaskColumnProps) {
  return (
    <div className={`flex flex-col min-w-[180px] kanban-col-${status} rounded-lg bg-background-deep`}>
      <div className="flex items-center gap-2 px-3 py-2.5">
        <h2 className="text-[12px] font-semibold text-foreground">
          {columnLabels[status]}
        </h2>
        <span className="resource-pill text-[10px] py-0 px-1.5">
          {tasks.length}
        </span>
      </div>
      <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-2">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} onMove={onMove} />
        ))}
      </div>
    </div>
  );
}
