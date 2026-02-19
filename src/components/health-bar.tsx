"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import type { Agent, ChannelHealth, AgentState, ConnectionStatus, ModelOption } from "@/types";
import { NavLinks } from "@/components/icon-rail";

interface HealthBarProps {
  tokenCount: number;
  agents: Agent[];
  gatewayStatus: ConnectionStatus;
  activeModel: string;
  availableModels: ModelOption[];
  onSelectModel: (modelId: string) => void;
  channels: ChannelHealth[];
  agentState: AgentState;
}

const statusDotColor: Record<ConnectionStatus, string> = {
  connected: "bg-accent-green",
  degraded: "bg-accent-yellow",
  disconnected: "bg-accent-red",
};

const agentStateLabel: Record<AgentState, { text: string; color: string }> = {
  idle: { text: "Idle", color: "text-muted" },
  running: { text: "Running", color: "text-accent-green" },
  error: { text: "Error", color: "text-accent-red" },
};

function formatTokenCount(count: number): string {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K`;
  return `${count}`;
}

function formatModelName(modelId: string): string {
  return modelId
    .split("-")
    .slice(0, 3)
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(" ");
}

export function HealthBar({
  tokenCount,
  agents,
  gatewayStatus,
  activeModel,
  availableModels,
  onSelectModel,
  channels,
  agentState,
}: HealthBarProps) {
  const agentInfo = agentStateLabel[agentState];
  const connectedAgents = agents.filter((a) => a.status === "connected").length;

  const [modelOpen, setModelOpen] = useState(false);
  const modelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (modelRef.current && !modelRef.current.contains(e.target as Node)) {
        setModelOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <header
      className="flex h-14 items-center justify-between bg-card px-6"
      style={{ boxShadow: "0 1px 0 rgba(0, 0, 0, 0.06)" }}
    >
      {/* Left: status indicators */}
      <div className="flex items-center gap-3">
        <div className="resource-pill">
          <span className={`h-2 w-2 rounded-full ${statusDotColor[gatewayStatus]}`} />
          <span>{formatTokenCount(tokenCount)} tokens</span>
        </div>

        <div className="resource-pill">
          <span className="h-2 w-2 rounded-full bg-teal" />
          <span>{connectedAgents}/{agents.length} agents</span>
        </div>

        {/* Model selector */}
        <div ref={modelRef} className="relative hidden sm:block">
          <button
            type="button"
            aria-label="Select model"
            aria-expanded={modelOpen}
            onClick={() => setModelOpen(!modelOpen)}
            className="flex cursor-pointer items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[13px] text-muted transition-colors duration-150 hover:text-foreground"
          >
            {formatModelName(activeModel)}
            <ChevronDown
              size={13}
              className={`transition-transform duration-200 ${modelOpen ? "rotate-180" : ""}`}
              style={{ transitionTimingFunction: "var(--ease-out)" }}
            />
          </button>

          {modelOpen && (
            <div
              className="absolute left-0 top-full mt-2 min-w-52 rounded-xl bg-card py-1.5"
              style={{
                zIndex: "var(--z-dropdown)",
                boxShadow: "0 0 0 1px rgba(0, 0, 0, 0.06), 0 8px 24px rgba(0, 0, 0, 0.08)",
              }}
            >
              {availableModels.map((model) => (
                <button
                  key={model.id}
                  type="button"
                  onClick={() => {
                    onSelectModel(model.id);
                    setModelOpen(false);
                  }}
                  className={`flex w-full items-center justify-between px-4 py-2.5 text-[13px] transition-colors duration-150 hover:bg-card-hover ${
                    model.id === activeModel
                      ? "font-medium text-foreground"
                      : "text-muted"
                  }`}
                >
                  <span>{model.name}</span>
                  <span className="text-[11px] text-muted/60">{model.provider}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Agent state */}
        <span className={`text-[12px] font-medium ${agentInfo.color}`}>
          {agentInfo.text}
        </span>
      </div>

      {/* Right: navigation */}
      <NavLinks />
    </header>
  );
}
