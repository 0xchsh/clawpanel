"use client";

import { useState, useRef, useEffect } from "react";
import {
  PlugsConnected,
  PokerChip,
  CirclesThree,
  Robot,
  ChatsCircle,
  CaretDown,
} from "@phosphor-icons/react";
import { useGatewayContext } from "@/contexts/gateway-context";
import { cn } from "@/lib/utils";

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

const statusDotColor: Record<string, string> = {
  connected: "bg-accent-green",
  degraded: "bg-accent-yellow",
  disconnected: "bg-accent-red",
};

export function StatusSidebar() {
  const {
    connectionStatus,
    health,
    costSnapshot,
    activeAgent,
    agents,
    channelHealth,
    settings,
    updateSettings,
  } = useGatewayContext();

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
    <aside className="hidden lg:flex flex-col w-[200px] shrink-0 pt-[68px]">
      <div className="flex flex-col gap-[5px]">
        {/* Connection status */}
        <div className="flex items-center justify-between px-2 py-1.5 rounded-md">
          <PlugsConnected size={20} weight="regular" className="text-muted" />
          <div className="flex items-center gap-1.5">
            <span
              className={cn(
                "h-2 w-2 rounded-full",
                statusDotColor[connectionStatus]
              )}
            />
            <span className="text-base font-semibold text-foreground capitalize">
              {connectionStatus}
            </span>
          </div>
        </div>

        <div className="h-px bg-card-border" />

        {/* Tokens + cost */}
        <div className="flex items-center justify-between px-2 py-1.5 rounded-md">
          <PokerChip size={20} weight="regular" className="text-muted" />
          <div className="flex items-center gap-1.5 text-base font-semibold">
            <span className="text-muted">
              {formatTokenCount(health.tokenCount)}/1M
            </span>
            <span className="text-foreground">
              ${costSnapshot.todaySpend.toFixed(2)}
            </span>
          </div>
        </div>

        <div className="h-px bg-card-border" />

        {/* Model selector */}
        <div ref={modelRef} className="relative">
          <button
            type="button"
            aria-label="Select model"
            aria-expanded={modelOpen}
            onClick={() => setModelOpen(!modelOpen)}
            className="flex w-full items-center justify-between px-2 py-1.5 rounded-md cursor-pointer transition-colors duration-150 hover:bg-background active:scale-[0.97]"
          >
            <CirclesThree size={20} weight="regular" className="text-muted" />
            <div className="flex items-center gap-1.5">
              <span className="text-base font-semibold text-foreground">
                {formatModelName(activeAgent.model)}
              </span>
              <CaretDown
                size={16}
                weight="bold"
                className={cn(
                  "text-muted transition-transform duration-200",
                  modelOpen && "rotate-180"
                )}
                style={{ transitionTimingFunction: "var(--ease-out)" }}
              />
            </div>
          </button>

          {modelOpen && (
            <div
              className="absolute right-0 top-full mt-2 min-w-52 rounded-lg bg-card py-1.5 animate-dropdown border border-card-border"
              style={{
                zIndex: "var(--z-dropdown)",
                boxShadow: "0 8px 24px var(--shadow-medium)",
              }}
            >
              {settings.availableModels.map((model) => (
                <button
                  key={model.id}
                  type="button"
                  onClick={() => {
                    updateSettings({ selectedModel: model.id });
                    setModelOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center justify-between px-4 py-2.5 text-sm transition-colors duration-150 hover:bg-card-hover",
                    model.id === activeAgent.model
                      ? "font-semibold text-foreground"
                      : "text-muted"
                  )}
                >
                  <span>{model.name}</span>
                  <span className="text-[11px] text-muted/60">
                    {model.provider}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="h-px bg-card-border" />

        {/* Agents */}
        <div className="flex items-center justify-between px-2 py-1.5 rounded-md">
          <Robot size={20} weight="regular" className="text-muted" />
          <div className="flex items-center gap-1.5">
            {agents.slice(0, 3).map((agent) => (
              <div key={agent.id} className="relative">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-card-border text-xs">
                  {agent.emoji}
                </span>
                <span
                  className={cn(
                    "absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full border border-card",
                    statusDotColor[agent.status]
                  )}
                />
              </div>
            ))}
          </div>
        </div>

        {channelHealth.length > 0 && (
          <>
            <div className="h-px bg-card-border" />

            {/* Channels */}
            <div className="flex items-center justify-between px-2 py-1.5 rounded-md">
              <ChatsCircle
                size={20}
                weight="regular"
                className="text-muted"
              />
              <div className="flex items-center gap-1.5">
                {channelHealth.slice(0, 3).map((ch) => (
                  <span
                    key={ch.name}
                    className={cn(
                      "h-4 w-4 rounded-full flex items-center justify-center text-[10px] font-semibold",
                      ch.status === "connected"
                        ? "text-foreground"
                        : "text-muted"
                    )}
                    title={`${ch.name}: ${ch.status}`}
                  >
                    {ch.provider.charAt(0).toUpperCase()}
                  </span>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </aside>
  );
}
