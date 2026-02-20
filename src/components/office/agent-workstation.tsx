"use client";

import type { AgentDesk, AgentWorkStatus } from "@/types";

const statusDotColors: Record<AgentWorkStatus, string> = {
  working: "var(--accent-green)",
  thinking: "var(--accent-yellow)",
  idle: "var(--muted)",
  away: "var(--accent-red)",
};

const statusLabels: Record<AgentWorkStatus, string> = {
  working: "Working",
  thinking: "Thinking",
  idle: "Idle",
  away: "Away",
};

const avatarClasses: Record<AgentWorkStatus, string> = {
  working: "agent-working",
  thinking: "agent-thinking",
  idle: "agent-idle",
  away: "agent-away",
};

function formatUptime(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${m}m`;
}

interface AgentWorkstationProps {
  desk: AgentDesk;
}

export function AgentWorkstation({ desk }: AgentWorkstationProps) {
  const isActive = desk.status === "working" || desk.status === "thinking";

  return (
    <div className={`panel-frame p-4 space-y-3 ${isActive ? "workstation-glow" : ""}`}>
      <div className="flex items-start gap-3">
        <div className={`text-3xl ${avatarClasses[desk.status]}`}>
          {desk.agentEmoji}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-[13px] font-semibold text-foreground">
              {desk.agentName}
            </h3>
            <span
              className="h-2 w-2 rounded-full shrink-0"
              style={{ background: statusDotColors[desk.status] }}
            />
            <span className="text-[11px] text-muted">
              {statusLabels[desk.status]}
            </span>
          </div>
          {desk.currentTask && (
            <p className="text-[12px] text-muted mt-0.5 truncate">
              {desk.currentTask}
            </p>
          )}
        </div>
      </div>

      <div className="flex gap-1.5 text-lg" title="Desk items">
        {desk.itemsOnDesk.map((item, i) => (
          <span key={i}>{item}</span>
        ))}
      </div>

      <div className="flex items-center gap-2 pt-2 border-t border-card-border">
        <span className="resource-pill text-[10px]">{desk.model}</span>
        <span className="text-[11px] text-muted tabular-nums ml-auto">
          {desk.sessionCount} session{desk.sessionCount !== 1 ? "s" : ""}
        </span>
        <span className="text-[11px] text-muted/50 tabular-nums">
          {formatUptime(desk.uptimeMinutes)} up
        </span>
      </div>
    </div>
  );
}
