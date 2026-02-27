"use client";

import { useState, useRef, useEffect } from "react";
import { CaretDown, Sparkle } from "@phosphor-icons/react";
import type { Agent, ChannelHealth, AgentState, ConnectionStatus, ModelOption } from "@/types";
import { NavLinks } from "@/components/icon-rail";
import { cn } from "@/lib/utils";

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

function formatTokenCount(count: number): string {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K`;
  return `${count}`;
}

function formatModelName(modelId: string): string {
  return modelId
    .split("-")
    .slice(0, 2)
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(" ");
}

function Pill({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex items-center gap-1.5 bg-background rounded-md px-3 py-1.5 text-base font-semibold shrink-0", className)}>
      {children}
    </div>
  );
}

function TokenBars({ filled, total }: { filled: number; total: number }) {
  return (
    <div className="flex gap-0.5 items-center">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "h-3.5 w-2 rounded-[3px]",
            i < filled ? "bg-accent-yellow" : "bg-card-border"
          )}
        />
      ))}
    </div>
  );
}

export function HealthBar({
  tokenCount,
  agents,
  gatewayStatus,
  activeModel,
  availableModels,
  onSelectModel,
  channels,
}: HealthBarProps) {
  const connectedAgents = agents.filter((a) => a.status === "connected").length;
  const tokenMax = 1_000_000;
  const tokenFilled = Math.min(3, Math.round((tokenCount / tokenMax) * 3));

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
    <header className="flex h-14 items-center justify-between px-6">
      {/* Left: logo */}
      <div className="flex items-center shrink-0">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-background text-muted">
          <Sparkle size={18} weight="fill" />
        </div>
      </div>

      {/* Right: status pills (desktop) + NavLinks (mobile fallback) */}
      <div className="flex items-center gap-2">
        <Pill className="hidden lg:flex">
          <span className={cn("h-2 w-2 rounded-full", statusDotColor[gatewayStatus])} />
          <span className="capitalize">{gatewayStatus}</span>
        </Pill>

        <Pill className="hidden lg:flex">
          <span>{formatTokenCount(tokenCount)}/1M</span>
          <TokenBars filled={tokenFilled} total={3} />
        </Pill>

        {/* Model selector */}
        <div ref={modelRef} className="relative hidden lg:block">
          <button
            type="button"
            aria-label="Select model"
            aria-expanded={modelOpen}
            onClick={() => setModelOpen(!modelOpen)}
            className="flex cursor-pointer items-center gap-1.5 bg-background rounded-md px-3 py-1.5 text-base font-semibold transition-colors duration-150 hover:bg-card-hover active:scale-[0.97]"
          >
            {formatModelName(activeModel)}
            <CaretDown
              size={16}
              weight="bold"
              className={cn("text-muted transition-transform duration-200", modelOpen && "rotate-180")}
              style={{ transitionTimingFunction: "var(--ease-out)" }}
            />
          </button>

          {modelOpen && (
            <div
              className="absolute right-0 top-full mt-2 min-w-52 rounded-lg bg-card py-1.5 animate-dropdown border border-card-border"
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
                  className={cn(
                    "flex w-full items-center justify-between px-4 py-2.5 text-sm transition-colors duration-150 hover:bg-card-hover",
                    model.id === activeModel
                      ? "font-semibold text-foreground"
                      : "text-muted"
                  )}
                >
                  <span>{model.name}</span>
                  <span className="text-[11px] text-muted/60">{model.provider}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <Pill className="hidden lg:flex">
          <span>Agents:</span>
          <div className="flex -space-x-1">
            {agents.slice(0, 3).map((agent) => (
              <span
                key={agent.id}
                className="flex h-6 w-6 items-center justify-center rounded-full bg-card-border text-xs"
                title={agent.name}
              >
                {agent.emoji}
              </span>
            ))}
          </div>
        </Pill>

        {channels.length > 0 && (
          <Pill className="hidden xl:flex">
            <span>Channels:</span>
            <div className="flex gap-1">
              {channels.slice(0, 3).map((ch) => (
                <span
                  key={ch.name}
                  className={cn(
                    "h-2 w-2 rounded-full",
                    ch.status === "connected"
                      ? "bg-accent-green"
                      : ch.status === "degraded"
                      ? "bg-accent-yellow"
                      : "bg-accent-red"
                  )}
                  title={`${ch.name}: ${ch.status}`}
                />
              ))}
            </div>
          </Pill>
        )}

        <NavLinks />
      </div>
    </header>
  );
}
