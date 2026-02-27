"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import type { Agent, ConnectionStatus, ChannelHealth, AgentState, ModelOption } from "@/types";

interface AgentProfileCardProps {
  activeAgent: Agent;
  agents: Agent[];
  onSelectAgent: (agentId: string) => void;
  connectionStatus: ConnectionStatus;
  agentState: AgentState;
  modelName: string;
  channels: ChannelHealth[];
  availableModels: ModelOption[];
  onSelectModel: (modelId: string) => void;
}

const statusDot: Record<ConnectionStatus, string> = {
  connected: "bg-accent-green",
  degraded: "bg-accent-yellow",
  disconnected: "bg-accent-red",
};

const statusLabel: Record<ConnectionStatus, string> = {
  connected: "Connected",
  degraded: "Degraded",
  disconnected: "Disconnected",
};

const stateConfig: Record<AgentState, { label: string; icon: string }> = {
  idle: { label: "Idle", icon: "\u{1F4A4}" },
  running: { label: "Running", icon: "\u{2728}" },
  error: { label: "Error", icon: "\u{26A0}\u{FE0F}" },
};

const channelColors: Record<string, string> = {
  discord: "#5865F2",
  whatsapp: "#25D366",
  telegram: "#0088cc",
  slack: "#4A154B",
  signal: "#3A76F0",
  webchat: "#0071e3",
};

const channelLabels: Record<string, string> = {
  discord: "D",
  whatsapp: "W",
  telegram: "T",
  slack: "S",
  signal: "Si",
  webchat: "W",
};

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[11px] font-medium tracking-wide text-muted uppercase">{label}</span>
      <div className="text-[13px] text-foreground">{children}</div>
    </div>
  );
}

export function AgentProfileCard({
  activeAgent,
  agents,
  onSelectAgent,
  connectionStatus,
  agentState,
  modelName,
  channels,
  availableModels,
  onSelectModel,
}: AgentProfileCardProps) {
  const [agentOpen, setAgentOpen] = useState(false);
  const [modelOpen, setModelOpen] = useState(false);
  const agentRef = useRef<HTMLDivElement>(null);
  const modelRef = useRef<HTMLDivElement>(null);
  const hasMultiple = agents.length > 1;
  const state = stateConfig[agentState];

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (agentRef.current && !agentRef.current.contains(e.target as Node)) {
        setAgentOpen(false);
      }
      if (modelRef.current && !modelRef.current.contains(e.target as Node)) {
        setModelOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const connectedChannels = channels.filter((c) => c.status === "connected");

  return (
    <div className="panel-frame p-6 flex flex-col items-center" ref={agentRef}>
      {/* Avatar */}
      <div className="relative mb-4">
        <div
          className="h-36 w-36 rounded-full flex items-center justify-center text-7xl border-[3px] border-card-border overflow-hidden"
          style={{ background: "linear-gradient(145deg, #d4d0c8, #a8a498)" }}
        >
          <span style={{ filter: "saturate(0.6)", fontSize: "80px" }}>{activeAgent.emoji}</span>
        </div>
        {hasMultiple && (
          <button
            type="button"
            aria-label="Switch agent"
            aria-expanded={agentOpen}
            onClick={() => setAgentOpen(!agentOpen)}
            className="absolute bottom-1 right-1 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-card border border-card-border shadow-sm transition-colors hover:bg-card-hover"
          >
            <ChevronDown
              size={13}
              className={`text-muted transition-transform duration-200 ${agentOpen ? "rotate-180" : ""}`}
              style={{ transitionTimingFunction: "var(--ease-out)" }}
            />
          </button>
        )}
      </div>

      {/* Agent name */}
      <h2 className="text-lg font-semibold text-foreground mb-6">{activeAgent.name}</h2>

      {/* Agent selector dropdown */}
      {agentOpen && hasMultiple && (
        <div
          className="absolute left-4 right-4 top-52 rounded-xl bg-card py-1.5 border border-card-border animate-dropdown"
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
                  setAgentOpen(false);
                }}
                className="flex w-full items-center gap-3 px-4 py-3 text-[13px] transition-colors duration-150 hover:bg-card-hover cursor-pointer"
              >
                <span className="text-lg">{agent.emoji}</span>
                <span className="font-medium">{agent.name}</span>
                <span className={`ml-auto h-2 w-2 rounded-full ${statusDot[agent.status]}`} />
              </button>
            ))}
        </div>
      )}

      {/* Status rows */}
      <div className="w-full flex flex-col gap-4">
        <InfoRow label="Gateway">
          <span className="flex items-center gap-2">
            <span className={`h-2.5 w-2.5 rounded-full ${statusDot[connectionStatus]}`} />
            <span className="font-medium">{statusLabel[connectionStatus]}</span>
          </span>
        </InfoRow>

        <InfoRow label="Status">
          <span className="flex items-center gap-2">
            <span className="text-[13px]">{state.icon}</span>
            <span className="font-medium">{state.label}</span>
          </span>
        </InfoRow>

        <div ref={modelRef} className="relative">
          <InfoRow label="Model">
            <button
              type="button"
              onClick={() => setModelOpen(!modelOpen)}
              className="flex items-center gap-1 font-medium cursor-pointer hover:text-accent transition-colors duration-150"
            >
              {modelName}
              <ChevronDown
                size={12}
                className={`text-muted transition-transform duration-200 ${modelOpen ? "rotate-180" : ""}`}
                style={{ transitionTimingFunction: "var(--ease-out)" }}
              />
            </button>
          </InfoRow>

          {modelOpen && (
            <div
              className="absolute right-0 top-full mt-2 min-w-48 rounded-xl bg-card py-1.5 border border-card-border animate-dropdown"
              style={{
                zIndex: "var(--z-dropdown)",
                boxShadow: "0 8px 24px var(--shadow-medium)",
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
                  className={`flex w-full items-center justify-between px-4 py-2.5 text-[13px] transition-colors duration-150 hover:bg-card-hover cursor-pointer ${
                    model.id === activeAgent.model
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

        <InfoRow label="Channels">
          <div className="flex items-center gap-1.5">
            {connectedChannels.length > 0 ? (
              connectedChannels.map((ch) => {
                const bg = channelColors[ch.provider] || "#86868b";
                const label = channelLabels[ch.provider] || ch.provider.charAt(0).toUpperCase();
                return (
                  <span
                    key={ch.name}
                    className="flex h-6 w-6 items-center justify-center rounded-full text-[9px] font-bold text-white"
                    style={{ backgroundColor: bg }}
                    title={ch.name}
                  >
                    {label}
                  </span>
                );
              })
            ) : (
              <span className="text-[12px] text-muted">None</span>
            )}
          </div>
        </InfoRow>
      </div>
    </div>
  );
}
