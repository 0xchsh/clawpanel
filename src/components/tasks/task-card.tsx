"use client";

import type { Task, TaskStatus } from "@/types";
import { ChevronLeft, ChevronRight } from "lucide-react";

const priorityColors: Record<string, string> = {
  urgent: "var(--accent-red)",
  high: "var(--accent-yellow)",
  medium: "var(--accent)",
  low: "var(--muted)",
};

const statusOrder: TaskStatus[] = ["backlog", "in_progress", "review", "done"];

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

interface TaskCardProps {
  task: Task;
  onMove: (taskId: string, newStatus: TaskStatus) => void;
}

export function TaskCard({ task, onMove }: TaskCardProps) {
  const currentIndex = statusOrder.indexOf(task.status);
  const canMoveLeft = currentIndex > 0;
  const canMoveRight = currentIndex < statusOrder.length - 1;

  return (
    <div className="panel-frame p-3 space-y-2">
      <div className="flex items-start gap-2">
        <span
          className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
          style={{ background: priorityColors[task.priority] }}
          title={task.priority}
        />
        <h3 className="text-[13px] font-medium text-foreground leading-snug">
          {task.title}
        </h3>
      </div>

      <div className="flex items-center gap-1.5">
        <span className="text-sm" title={task.assignee.name}>
          {task.assignee.emoji}
        </span>
        <span className="text-[11px] text-muted truncate">
          {task.assignee.name}
        </span>
        <span className="text-[11px] text-muted/50 ml-auto">
          {timeAgo(task.updatedAt)}
        </span>
      </div>

      {task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {task.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full px-1.5 py-0.5 text-[10px] font-medium text-muted"
              style={{ background: "var(--pill-bg)", boxShadow: "0 0 0 1px var(--shadow-border)" }}
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between pt-1 border-t border-card-border">
        <button
          onClick={() => canMoveLeft && onMove(task.id, statusOrder[currentIndex - 1])}
          disabled={!canMoveLeft}
          className="p-1 rounded-md text-muted hover:text-foreground hover:bg-card-hover transition-colors disabled:opacity-20 disabled:cursor-default"
        >
          <ChevronLeft size={14} />
        </button>
        <button
          onClick={() => canMoveRight && onMove(task.id, statusOrder[currentIndex + 1])}
          disabled={!canMoveRight}
          className="p-1 rounded-md text-muted hover:text-foreground hover:bg-card-hover transition-colors disabled:opacity-20 disabled:cursor-default"
        >
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}
