"use client";

import { useState, useRef, useEffect } from "react";
import {
  PlugsConnected,
  Plugs,
  PokerChip,
  CirclesThree,
  Robot,
  ChatsCircle,
  CaretDown,
} from "@phosphor-icons/react";
import {
  SiWhatsapp,
  SiTelegram,
  SiDiscord,
} from "@icons-pack/react-simple-icons";
import { useRouter } from "next/navigation";
import { useGatewayContext } from "@/contexts/gateway-context";
import { cn } from "@/lib/utils";

function formatTokenCount(count: number): string {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K`;
  return `${count}`;
}

function tokenUsageColor(count: number, max: number): string {
  const ratio = count / max;
  if (ratio >= 0.8) return "text-accent-red";
  if (ratio >= 0.5) return "text-accent-yellow";
  return "text-accent-green";
}

function formatModelShort(modelId: string, availableModels: { id: string; name: string }[]): string {
  // Check exact match first, then partial match
  const match = availableModels.find((m) => m.id === modelId)
    ?? availableModels.find((m) => modelId.includes(m.id) || m.id.includes(modelId.replace(/^.*\//, "")));
  if (match) return match.name.replace(/^Claude\s+/i, "");
  // Fallback: parse from ID like "anthropic/claude-sonnet-4-6"
  const stripped = modelId.replace(/^.*\//, "");
  const m = stripped.match(/(sonnet|opus|haiku)[- ](\d+)[- ]?(\d+)?/i);
  if (m) {
    const family = m[1].charAt(0).toUpperCase() + m[1].slice(1).toLowerCase();
    return `${family} ${m[2]}${m[3] ? `.${m[3]}` : ""}`;
  }
  return stripped;
}

const channelSimpleIcon: Record<string, { icon: typeof SiWhatsapp; color: string }> = {
  whatsapp: { icon: SiWhatsapp, color: "#25D366" },
  telegram: { icon: SiTelegram, color: "#26A5E4" },
  discord: { icon: SiDiscord, color: "#5865F2" },
};

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
    agentWorkspaces,
    channelHealth,
    settings,
    updateSettings,
  } = useGatewayContext();

  const router = useRouter();
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
    <aside className="hidden lg:flex flex-col w-[200px] shrink-0 pt-[68px] lg:sticky lg:top-0 lg:self-start">
      <div className="flex flex-col gap-[5px]">
        {/* Connection status */}
        <div className="flex items-center justify-between px-2 py-1.5 rounded-md">
          {connectionStatus === "connected" ? (
            <PlugsConnected size={20} weight="fill" className="text-muted" aria-label="Gateway status" />
          ) : (
            <Plugs size={20} weight="fill" className="text-muted" aria-label="Gateway status" />
          )}
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

        <div className="h-px border-b border-dashed border-card-border" />

        {/* Tokens + cost */}
        <div className="flex items-center justify-between px-2 py-1.5 rounded-md">
          <PokerChip size={20} weight="fill" className="text-muted" aria-label="Tokens and cost" />
          <div className="flex items-center gap-1.5 text-base font-semibold">
            <span><span className={cn("font-bold", tokenUsageColor(health.tokenCount, 1_000_000))}>{formatTokenCount(health.tokenCount)}</span><span className="text-muted">/1M</span></span>
            <span className="text-foreground">
              ${costSnapshot.todaySpend.toFixed(2)}
            </span>
          </div>
        </div>

        <div className="h-px border-b border-dashed border-card-border" />

        {/* Model selector */}
        <div ref={modelRef} className="relative">
          <button
            type="button"
            aria-label="Select model"
            aria-expanded={modelOpen}
            onClick={() => setModelOpen(!modelOpen)}
            className="flex w-full items-center justify-between px-2 py-1.5 rounded-md cursor-pointer transition-colors duration-150 hover:bg-background active:scale-[0.97]"
          >
            <CirclesThree size={20} weight="fill" className="text-muted" aria-label="Active model" />
            <div className="flex items-center gap-1.5">
              <span className="text-base font-semibold text-foreground truncate max-w-[120px]">
                {formatModelShort(activeAgent.model, settings.availableModels)}
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

        <div className="h-px border-b border-dashed border-card-border" />

        {/* Agents */}
        <div className="flex items-center justify-between px-2 py-1.5 rounded-md">
          <Robot size={20} weight="fill" className="text-muted" />
          <div className="flex items-center gap-1.5">
            {agentWorkspaces.slice(0, 4).map((ws) => (
              <button
                key={ws.id}
                type="button"
                onClick={() => router.push(`/agents?id=${ws.id}`)}
                className="relative cursor-pointer"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-card-border text-sm">
                  {ws.emoji}
                </span>
                <span
                  className={cn(
                    "absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full border border-card",
                    statusDotColor[ws.status]
                  )}
                />
              </button>
            ))}
          </div>
        </div>

        {channelHealth.length > 0 && (
          <>
            <div className="h-px border-b border-dashed border-card-border" />

            {/* Channels — click to go to channel settings */}
            <button
              type="button"
              onClick={() => router.push("/settings?section=channels")}
              className="flex items-center justify-between px-2 py-1.5 rounded-md cursor-pointer transition-colors duration-150 hover:bg-background w-full"
            >
              <ChatsCircle
                size={20}
                weight="fill"
                className="text-muted"
              />
              <div className="flex items-center gap-1.5">
                {channelHealth.map((ch) => {
                  const entry = channelSimpleIcon[ch.provider];
                  if (entry) {
                    const BrandIcon = entry.icon;
                    return (
                      <BrandIcon
                        key={ch.name}
                        size={16}
                        color={ch.status === "connected" ? entry.color : "var(--muted)"}
                      />
                    );
                  }
                  return (
                    <ChatsCircle
                      key={ch.name}
                      size={18}
                      weight="fill"
                      className="text-muted"
                    />
                  );
                })}
              </div>
            </button>
          </>
        )}
      </div>
    </aside>
  );
}
