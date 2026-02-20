"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import type { Agent, ConnectionStatus } from "@/types";

interface AgentHeaderProps {
  activeAgent: Agent;
  agents: Agent[];
  onSelectAgent: (agentId: string) => void;
  connectionStatus: ConnectionStatus;
}

const statusLabel: Record<ConnectionStatus, string> = {
  connected: "Online",
  degraded: "Degraded",
  disconnected: "Offline",
};

const statusDot: Record<ConnectionStatus, string> = {
  connected: "bg-accent-green",
  degraded: "bg-accent-yellow",
  disconnected: "bg-accent-red",
};

export function AgentHeader({
  activeAgent,
  agents,
  onSelectAgent,
  connectionStatus,
}: AgentHeaderProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const hasMultiple = agents.length > 1;

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative flex items-center gap-5 px-6 py-6">
      {/* Agent portrait */}
      <button
        type="button"
        aria-label={hasMultiple ? "Switch agent" : `Agent: ${activeAgent.name}`}
        aria-expanded={hasMultiple ? open : undefined}
        onClick={() => hasMultiple && setOpen(!open)}
        className={`relative flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-card border border-card-border text-3xl transition-shadow duration-150 ${
          hasMultiple
            ? "cursor-pointer hover:shadow-md active:scale-[0.97]"
            : "cursor-default"
        }`}
      >
        {activeAgent.emoji}
        {hasMultiple && (
          <ChevronDown
            size={12}
            className={`absolute -bottom-0.5 -right-0.5 rounded-full bg-card border border-card-border p-0.5 text-muted transition-transform duration-200`}
            style={{
              transitionTimingFunction: "var(--ease-out)",
              transform: open ? "rotate(180deg)" : undefined,
            }}
          />
        )}
      </button>

      {/* Agent info */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-3">
          <span className="text-lg font-semibold text-foreground">
            {activeAgent.name}
          </span>
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              {connectionStatus === "connected" && (
                <span
                  className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${statusDot[connectionStatus]}`}
                />
              )}
              <span
                className={`relative inline-flex h-2 w-2 rounded-full ${statusDot[connectionStatus]}`}
              />
            </span>
            <span className="text-xs text-muted">
              {activeAgent.autoBuild ? "Building\u2026" : statusLabel[connectionStatus]}
            </span>
          </div>
        </div>
        <span className="text-[13px] text-muted">
          {activeAgent.model.split("-").slice(0, 3).join(" ")}
        </span>
      </div>

      {/* Agent selector dropdown */}
      {open && hasMultiple && (
        <div
          className="absolute left-6 top-full mt-1 min-w-52 rounded-xl bg-card py-1.5 border border-card-border"
          style={{
            zIndex: "var(--z-dropdown)",
            boxShadow: "0 8px 24px var(--shadow-medium)",
          }}
        >
          {agents
            .filter((a) => a.id !== activeAgent.id)
            .map((agent) => (
              <button
                key={agent.id}
                type="button"
                onClick={() => {
                  onSelectAgent(agent.id);
                  setOpen(false);
                }}
                className="flex w-full items-center gap-3 px-4 py-3 text-[13px] transition-colors duration-150 hover:bg-card-hover"
              >
                <span className="text-lg">{agent.emoji}</span>
                <span className="font-medium">{agent.name}</span>
                <span className={`ml-auto h-2 w-2 rounded-full ${statusDot[agent.status]}`} />
              </button>
            ))}
        </div>
      )}
    </div>
  );
}
