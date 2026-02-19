"use client";

import type { ConnectionStatus, NodeStatus, CronRunStatus } from "@/types";

type BadgeStatus = ConnectionStatus | NodeStatus | CronRunStatus;

const statusConfig: Record<
  BadgeStatus,
  { color: string; label: string }
> = {
  connected: { color: "bg-accent-green", label: "Connected" },
  degraded: { color: "bg-accent-yellow", label: "Degraded" },
  disconnected: { color: "bg-accent-red", label: "Disconnected" },
  online: { color: "bg-accent-green", label: "Online" },
  offline: { color: "bg-accent-red", label: "Offline" },
  pending: { color: "bg-accent-yellow", label: "Pending" },
  success: { color: "bg-accent-green", label: "Success" },
  failure: { color: "bg-accent-red", label: "Failed" },
  running: { color: "bg-accent-yellow", label: "Running" },
};

interface StatusBadgeProps {
  status: BadgeStatus;
  label?: string;
}

export function StatusBadge({ status, label }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-muted">
      <span
        className={`h-2 w-2 shrink-0 rounded-full ${config.color}`}
      />
      {label ?? config.label}
    </span>
  );
}
