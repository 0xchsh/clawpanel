"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useGatewayContext } from "@/contexts/gateway-context";
import type { AgentDesk } from "@/types";
import {
  Hammer,
  ChatCircle,
  Lightning,
  FileText,
  Clock,
  Broadcast,
  Desktop,
  Terminal,
  GitBranch,
  CaretDown,
  ClockClockwise,
} from "@phosphor-icons/react";
import type { Icon as PhosphorIcon } from "@phosphor-icons/react";
import type { ActivityEventType } from "@/types";
import { cn } from "@/lib/utils";

const eventIcons: Record<ActivityEventType, PhosphorIcon> = {
  build: Hammer,
  message: ChatCircle,
  skill: Lightning,
  file: FileText,
  cron: Clock,
  channel: Broadcast,
  node: Desktop,
  session: Terminal,
  git: GitBranch,
};

function formatCurrency(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

function formatTokensShort(count: number): string {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)} M tokens`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K`;
  return `${count}`;
}

function formatTokensCompact(count: number): string {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K`;
  return `${count}`;
}

function timeAgoShort(date: Date): string {
  const now = Date.now();
  const diff = now - date.getTime();
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}


function DonutChart({
  segments,
  size = 120,
}: {
  segments: { percentage: number; color: string }[];
  size?: number;
}) {
  const radius = 15.5;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <svg viewBox="0 0 36 36" width={size} height={size}>
      <circle
        cx="18"
        cy="18"
        r={radius}
        fill="none"
        stroke="var(--card-border)"
        strokeWidth="5"
      />
      {segments.map((seg, i) => {
        const dashLength = (seg.percentage / 100) * circumference;
        const dashOffset = -offset;
        offset += dashLength;
        return (
          <circle
            key={i}
            cx="18"
            cy="18"
            r={radius}
            fill="none"
            stroke={seg.color}
            strokeWidth="5"
            strokeDasharray={`${dashLength} ${circumference - dashLength}`}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            transform="rotate(-90 18 18)"
          />
        );
      })}
    </svg>
  );
}

function useLatestVersion(currentVersion: string) {
  const [latest, setLatest] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/version")
      .then((r) => r.json())
      .then((data: { latest: string | null }) => {
        if (data.latest && data.latest !== currentVersion) {
          setLatest(data.latest);
        }
      })
      .catch(() => {});
  }, [currentVersion]);

  return latest;
}

/* ── Fishbowl ── */

interface Walker {
  x: number;
  y: number;
  vx: number;
  vy: number;
  targetVx: number;
  targetVy: number;
  facingRight: boolean;
}

const STATUS_SPEED: Record<string, number> = {
  working: 0.55,
  thinking: 0.35,
  idle: 0.18,
  away: 0.07,
};

function Fishbowl({ desks, onAgentClick }: { desks: AgentDesk[]; onAgentClick?: (agentId: string) => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const walkersRef = useRef<Walker[]>([]);
  const frameRef = useRef(0);
  const [positions, setPositions] = useState<Walker[]>([]);

  // Seed walkers when desks change
  const seedWalkers = useCallback(
    (w: number, h: number) => {
      const pad = 32;
      walkersRef.current = desks.map((desk, i) => {
        const existing = walkersRef.current[i];
        if (existing) return existing;
        const speed = STATUS_SPEED[desk.status] ?? 0.18;
        const angle = Math.random() * Math.PI * 2;
        return {
          x: pad + Math.random() * (w - pad * 2),
          y: pad + Math.random() * (h - pad * 2),
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          targetVx: Math.cos(angle) * speed,
          targetVy: Math.sin(angle) * speed,
          facingRight: Math.cos(angle) > 0,
        };
      });
    },
    [desks],
  );

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    seedWalkers(rect.width, rect.height);

    let tick = 0;

    function step() {
      const r = el!.getBoundingClientRect();
      const w = r.width;
      const h = r.height;
      const pad = 32;
      tick++;

      for (let i = 0; i < walkersRef.current.length; i++) {
        const walker = walkersRef.current[i];
        const speed = STATUS_SPEED[desks[i]?.status ?? "idle"] ?? 0.18;

        // Every ~120 frames (~2s at 60fps) pick a new random target direction
        if (tick % 120 === i * 17) {
          const angle = Math.random() * Math.PI * 2;
          walker.targetVx = Math.cos(angle) * speed;
          walker.targetVy = Math.sin(angle) * speed;
        }

        // Ease toward target velocity
        walker.vx += (walker.targetVx - walker.vx) * 0.02;
        walker.vy += (walker.targetVy - walker.vy) * 0.02;

        walker.x += walker.vx;
        walker.y += walker.vy;

        // Bounce off edges
        if (walker.x < pad) {
          walker.x = pad;
          walker.vx = Math.abs(walker.vx) * 0.8;
          walker.targetVx = Math.abs(walker.targetVx);
        } else if (walker.x > w - pad) {
          walker.x = w - pad;
          walker.vx = -Math.abs(walker.vx) * 0.8;
          walker.targetVx = -Math.abs(walker.targetVx);
        }
        if (walker.y < pad) {
          walker.y = pad;
          walker.vy = Math.abs(walker.vy) * 0.8;
          walker.targetVy = Math.abs(walker.targetVy);
        } else if (walker.y > h - pad) {
          walker.y = h - pad;
          walker.vy = -Math.abs(walker.vy) * 0.8;
          walker.targetVy = -Math.abs(walker.targetVy);
        }

        // Update facing direction (only flip when clearly moving)
        if (Math.abs(walker.vx) > 0.04) {
          walker.facingRight = walker.vx > 0;
        }
      }

      setPositions(walkersRef.current.map((w) => ({ ...w })));
      frameRef.current = requestAnimationFrame(step);
    }

    frameRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frameRef.current);
  }, [desks, seedWalkers]);

  if (desks.length === 0) return null;

  return (
    <div
      ref={containerRef}
      className="relative bg-card border border-card-border rounded-lg office-floor overflow-hidden"
      style={{ height: 200 }}
    >
      {/* Subtle inner vignette for the fishbowl feel */}
      <div
        className="absolute inset-0 rounded-lg pointer-events-none"
        style={{
          boxShadow: "inset 0 0 40px var(--shadow-soft), inset 0 0 80px var(--shadow-soft)",
        }}
      />

      {positions.map((walker, i) => {
        const desk = desks[i];
        if (!desk) return null;
        const isActive = desk.status === "working" || desk.status === "thinking";

        return (
          <button
            type="button"
            key={desk.id}
            onClick={() => onAgentClick?.(desk.agentId)}
            className="absolute flex flex-col items-center select-none cursor-pointer hover:scale-110 transition-transform duration-200"
            style={{
              left: walker.x,
              top: walker.y,
              transform: "translate(-50%, -50%)",
              willChange: "left, top",
            }}
          >
            {/* Shadow underneath */}
            <div
              className="absolute rounded-full"
              style={{
                width: 28,
                height: 8,
                bottom: -2,
                background: "var(--shadow-medium)",
                filter: "blur(3px)",
              }}
            />

            {/* Emoji avatar */}
            <span
              className={cn(
                "text-2xl leading-none transition-transform duration-700",
                desk.status === "working" && "agent-working",
                desk.status === "thinking" && "agent-thinking",
                desk.status === "away" && "agent-away",
              )}
              style={{
                transform: walker.facingRight ? "scaleX(1)" : "scaleX(-1)",
              }}
            >
              {desk.agentEmoji}
            </span>

            {/* Name tag */}
            <span className="mt-1 font-mono text-[10px] font-semibold leading-none whitespace-nowrap text-muted uppercase">
              {desk.agentName}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export default function OverviewPage() {
  const {
    costSnapshot,
    connectionStatus,
    health,
    activeAgent,
    activityEvents,
    heatmap,
    settings,
    agentDesks,
  } = useGatewayContext();

  const router = useRouter();
  const updateAvailable = useLatestVersion(settings.gatewayVersion);

  const todayEvents = activityEvents.filter((e) => {
    const now = new Date();
    const eventDate = new Date(e.timestamp);
    return (
      eventDate.getDate() === now.getDate() &&
      eventDate.getMonth() === now.getMonth() &&
      eventDate.getFullYear() === now.getFullYear()
    );
  });

  const budgetPercent = costSnapshot.dailyBudget
    ? Math.min(
        100,
        Math.max(
          0,
          Math.round(
            ((costSnapshot.dailyBudget - costSnapshot.todaySpend) /
              costSnapshot.dailyBudget) *
              100,
          ),
        ),
      )
    : null;

  const last30 = costSnapshot.dailyTrend.slice(-30);
  const maxDailyCost = Math.max(...last30.map((d) => d.cost), 0.01);
  const last30TotalCost = last30.reduce((sum, d) => sum + d.cost, 0);

  const uptimeHours = Math.floor(settings.uptime / 3600);
  const uptimeMinutes = Math.floor((settings.uptime % 3600) / 60);

  return (
    <div className="flex flex-col px-4 py-8 lg:px-0 lg:py-0">
      {/* ── Page title ── */}
      <div className="flex items-center justify-between h-9">
        <h1 className="text-xl font-semibold text-foreground">Overview</h1>
        <div className="flex items-center gap-1.5">
          <ClockClockwise size={20} weight="regular" className="text-muted" />
          <span className="text-base font-semibold text-muted">
            v{settings.gatewayVersion}
          </span>
          {updateAvailable && (
            <button
              type="button"
              className="text-base font-bold text-accent transition-colors duration-150 hover:text-accent-hover"
            >
              Update
            </button>
          )}
        </div>
      </div>

      {/* ── Agent Fishbowl ── */}
      <div className="mt-8">
        <Fishbowl desks={agentDesks} onAgentClick={(id) => router.push(`/agents?id=${id}`)} />
      </div>

      {/* ── Cards section ── */}
      <div className="flex flex-col gap-3 mt-3">
        {/* ── Row 1: Spend · Sessions · Gateway ── */}
        <div className="flex gap-3">
          <div className="flex-1 bg-card border border-card-border rounded-lg p-4 h-[120px] flex flex-col justify-between">
            <p className="text-base font-semibold text-muted">Spend</p>
            <div>
              <p className="text-base font-semibold text-foreground">
                {formatCurrency(costSnapshot.todaySpend)} today
              </p>
              <p className="text-xs font-semibold text-muted mt-0.5">
                {formatCurrency(costSnapshot.burnRatePerHour)}/hr
                {costSnapshot.isIdle && " (idle)"}
              </p>
            </div>
          </div>

          <div className="flex-1 bg-card border border-card-border rounded-lg p-4 h-[120px] flex flex-col justify-between">
            <p className="text-base font-semibold text-muted">Sessions</p>
            <div>
              <p className="text-base font-semibold text-foreground">
                {health.sessions.active} active
              </p>
              <p className="text-xs font-semibold text-muted mt-0.5">
                {health.sessions.total} total
              </p>
            </div>
          </div>

          <div className="flex-1 bg-card border border-card-border rounded-lg p-4 h-[120px] flex flex-col justify-between">
            <p className="text-base font-semibold text-muted">Gateway</p>
            <div>
              <div className="flex items-center gap-1.5">
                <span
                  className={cn(
                    "h-2 w-2 rounded-full",
                    connectionStatus === "connected"
                      ? "bg-accent-green"
                      : connectionStatus === "degraded"
                        ? "bg-accent-yellow"
                        : "bg-accent-red",
                  )}
                />
                <p className="text-base font-semibold text-foreground capitalize">
                  {connectionStatus}
                </p>
              </div>
              <p className="text-xs font-semibold text-muted mt-0.5">
                {uptimeHours > 0 ? `${uptimeHours}h ${uptimeMinutes}m up` : `${uptimeMinutes}m up`}
              </p>
            </div>
          </div>
        </div>

        {/* ── Row 2: Budget · Tokens ── */}
        <div className="flex gap-3">
          <div className="flex-1 bg-card border border-card-border rounded-lg p-4 h-[120px] flex flex-col justify-between">
            <p className="text-base font-semibold text-muted">Budget</p>
            <div>
              {costSnapshot.dailyBudget ? (
                <>
                  <div className="flex items-center gap-2">
                    <p className="text-base font-semibold text-foreground">
                      {budgetPercent}% remaining
                    </p>
                  </div>
                  <p className="text-xs font-semibold text-muted mt-0.5">
                    {formatCurrency(costSnapshot.dailyBudget)}/day
                    {costSnapshot.timeToLimitHours != null &&
                      costSnapshot.timeToLimitHours > 0 &&
                      ` \u00b7 ${costSnapshot.timeToLimitHours.toFixed(1)}h to limit`}
                  </p>
                </>
              ) : (
                <>
                  <p className="text-base font-semibold text-foreground">
                    No limit set
                  </p>
                  <p className="text-xs font-semibold text-muted mt-0.5">
                    Projected {formatCurrency(costSnapshot.projectedMonthly)}/mo
                  </p>
                </>
              )}
            </div>
          </div>

          <div className="flex-1 bg-card border border-card-border rounded-lg p-4 h-[120px] flex flex-col justify-between">
            <p className="text-base font-semibold text-muted">Tokens</p>
            <div>
              <p className="text-base font-semibold text-foreground">
                {formatTokensShort(costSnapshot.todayTokens)} today
              </p>
              <p className="text-xs font-semibold text-muted mt-0.5">
                {costSnapshot.burnRateTokensPerMin > 0
                  ? `${formatTokensCompact(costSnapshot.burnRateTokensPerMin)}/min`
                  : "0 tok/min"}
                {costSnapshot.isIdle && " (idle)"}
              </p>
            </div>
          </div>
        </div>

        {/* ── Model card ── */}
        <div className="bg-card border border-card-border rounded-lg p-4 flex items-start justify-between">
          <div className="flex flex-col justify-between self-stretch min-h-[80px]">
            <p className="text-base font-semibold text-muted">Model</p>
            <div className="flex items-center gap-1">
              <p className="text-base font-semibold text-foreground">
                {activeAgent.model
                  .split("-")
                  .slice(0, 2)
                  .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
                  .join(" ")}
              </p>
              <CaretDown size={16} weight="bold" className="text-muted" />
            </div>
          </div>

          <div className="flex items-center gap-8">
            <div className="flex flex-col gap-1">
              {costSnapshot.modelSplit.map((m) => (
                <div key={m.model} className="flex items-center gap-1.5">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: m.color }}
                  />
                  <span className="text-xs font-semibold text-muted leading-4">
                    {m.model
                      .split("-")
                      .slice(0, 2)
                      .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
                      .join(" ")
                      .toLowerCase()}
                  </span>
                </div>
              ))}
            </div>

            <DonutChart
              segments={costSnapshot.modelSplit.map((m) => ({
                percentage: m.percentage,
                color: m.color,
              }))}
            />
          </div>
        </div>

        {/* ── Last 30 Days ── */}
        <div className="bg-card border border-card-border rounded-lg p-4 h-[120px] flex flex-col justify-between">
          <div className="flex items-center gap-2 w-full">
            <p className="text-base font-semibold text-muted whitespace-nowrap">
              Last 30 Days
            </p>
            <div className="flex-1 h-px bg-card-border" />
            <p className="text-base font-semibold text-muted whitespace-nowrap">
              {formatCurrency(last30TotalCost)} total
            </p>
          </div>
          <div className="flex gap-0.5 h-10 items-end">
            {last30.map((day, i) => {
              const ratio = day.cost / maxDailyCost;
              return (
                <div
                  key={day.date || i}
                  className="flex-1 rounded-[3px] bg-accent-yellow"
                  style={{
                    height: `${Math.max(4, ratio * 100)}%`,
                    opacity: ratio > 0.05 ? 1 : 0.25,
                  }}
                />
              );
            })}
            {Array.from({ length: Math.max(0, 30 - last30.length) }).map(
              (_, i) => (
                <div
                  key={`empty-${i}`}
                  className="flex-1 rounded-[3px] bg-card-border"
                  style={{ height: "4%" }}
                />
              ),
            )}
          </div>
        </div>

        {/* ── Activity Feed ── */}
        <div>
          <div className="flex items-center gap-2 py-4">
            <p className="text-xs font-semibold text-muted uppercase whitespace-nowrap">
              Today
            </p>
            <div className="flex-1 h-px bg-card-border" />
            <p className="text-xs font-semibold text-muted uppercase whitespace-nowrap">
              {todayEvents.length} actions
            </p>
          </div>

          <div className="flex flex-col">
            {todayEvents.length === 0 && (
              <p className="py-4 text-sm text-muted">No activity today</p>
            )}
            {todayEvents.map((event) => {
              const Icon = eventIcons[event.type] || Hammer;
              return (
                <div
                  key={event.id}
                  className="flex items-center justify-between py-4 border-b border-dashed border-card-border"
                >
                  <div className="flex items-center gap-4">
                    <Icon size={20} weight="regular" className="text-muted shrink-0" />
                    <div className="flex items-center gap-2">
                      <span className="text-lg leading-none">
                        {event.agentEmoji}
                      </span>
                      <p className="text-sm">
                        <span className="font-semibold text-foreground">
                          {event.agentName}
                        </span>
                        <span className="text-muted">
                          {" "}
                          {event.description}
                        </span>
                      </p>
                    </div>
                  </div>
                  <p className="text-xs font-semibold text-muted uppercase whitespace-nowrap ml-4">
                    {timeAgoShort(new Date(event.timestamp))}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
