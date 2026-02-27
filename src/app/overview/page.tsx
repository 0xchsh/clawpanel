"use client";

import { useGatewayContext } from "@/contexts/gateway-context";
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

function UsageBar({ filled, total }: { filled: number; total: number }) {
  return (
    <div className="flex gap-0.5 items-center">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "h-4 w-2 rounded-[3px] flex-1",
            i < filled ? "bg-accent-yellow" : "bg-card-border"
          )}
        />
      ))}
    </div>
  );
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

export default function OverviewPage() {
  const {
    costSnapshot,
    connectionStatus,
    health,
    activeAgent,
    activityEvents,
    heatmap,
    settings,
  } = useGatewayContext();

  const todayEvents = activityEvents.filter((e) => {
    const now = new Date();
    const eventDate = new Date(e.timestamp);
    return (
      eventDate.getDate() === now.getDate() &&
      eventDate.getMonth() === now.getMonth() &&
      eventDate.getFullYear() === now.getFullYear()
    );
  });

  const tokenMax = 1_000_000;
  const tokenFilled = Math.min(
    10,
    Math.round((health.tokenCount / tokenMax) * 10)
  );

  const budgetPercent = costSnapshot.dailyBudget
    ? Math.round(
        ((costSnapshot.dailyBudget - costSnapshot.todaySpend) /
          costSnapshot.dailyBudget) *
          100
      )
    : null;

  const last30 = costSnapshot.dailyTrend.slice(-30);
  const maxDailyCost = Math.max(...last30.map((d) => d.cost), 1);
  const totalMessages = heatmap.cells.reduce((sum, c) => sum + c.messages, 0);

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
          <button
            type="button"
            className="text-base font-semibold text-accent transition-colors duration-150 hover:text-accent-hover"
          >
            Update
          </button>
        </div>
      </div>

      {/* ── Cards section ── */}
      <div className="flex flex-col gap-3 mt-8">
        {/* ── Row 1: Today · Gateway · Tokens ── */}
        <div className="flex gap-3">
          <div className="flex-1 bg-background rounded-lg p-4 h-[120px] flex flex-col justify-between">
            <p className="text-base font-semibold text-muted">Today</p>
            <div>
              <p className="text-base font-semibold text-foreground">
                {formatCurrency(costSnapshot.todaySpend)}
              </p>
              <p className="text-base font-semibold text-foreground">
                {formatTokensShort(costSnapshot.todayTokens)}
              </p>
            </div>
          </div>

          <div className="flex-1 bg-background rounded-lg p-4 h-[120px] flex flex-col justify-between">
            <p className="text-base font-semibold text-muted">Gateway</p>
            <div className="flex items-center gap-1">
              <span className={cn("h-2 w-2 rounded-full", connectionStatus === "connected" ? "bg-accent-green" : connectionStatus === "degraded" ? "bg-accent-yellow" : "bg-accent-red")} />
              <p className="text-base font-semibold text-foreground capitalize">
                {connectionStatus}
              </p>
            </div>
          </div>

          <div className="flex-1 bg-background rounded-lg p-4 h-[120px] flex flex-col justify-between">
            <p className="text-base font-semibold text-muted">Tokens</p>
            <div className="flex flex-col gap-1">
              <UsageBar filled={tokenFilled} total={10} />
              <p className="text-base font-semibold text-foreground">
                {formatTokensCompact(health.tokenCount)}/1M
              </p>
            </div>
          </div>
        </div>

        {/* ── Row 2: Burn Rate · 7-Day Cost Trend ── */}
        <div className="flex gap-3">
          <div className="w-[181px] shrink-0 bg-background rounded-lg p-4 h-[120px] flex flex-col justify-between">
            <p className="text-base font-semibold text-muted">Burn Rate</p>
            <div>
              <p className="text-base font-semibold text-foreground">
                {formatCurrency(costSnapshot.burnRatePerHour)}/hr
              </p>
              {budgetPercent !== null && (
                <p className="text-base font-semibold text-foreground">
                  Budget: {budgetPercent}% left
                </p>
              )}
            </div>
          </div>

          <div className="flex-1 bg-background rounded-lg p-4 h-[120px] flex flex-col justify-between">
            <p className="text-base font-semibold text-muted">
              7-Day Cost Trend
            </p>
            <div className="flex flex-col gap-3">
              <UsageBar
                filled={Math.min(
                  10,
                  Math.round(
                    (costSnapshot.dailyTrend.slice(-7).length / 10) * 10
                  )
                )}
                total={10}
              />
              <p className="text-base font-semibold text-foreground">
                Projected: {formatCurrency(costSnapshot.projectedMonthly)}/mo
              </p>
            </div>
          </div>
        </div>

        {/* ── Model card ── */}
        <div className="bg-background rounded-lg p-4 flex items-start justify-between">
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
        <div className="bg-background rounded-lg p-4 h-[120px] flex flex-col justify-between">
          <div className="flex items-center gap-2 w-full">
            <p className="text-base font-semibold text-muted whitespace-nowrap">
              Last 30 Days
            </p>
            <div className="flex-1 h-px bg-card-border" />
            <p className="text-base font-semibold text-muted whitespace-nowrap">
              {totalMessages} messages
            </p>
          </div>
          <div className="flex gap-1 h-8 items-center">
            {last30.map((day, i) => (
              <div
                key={day.date || i}
                className={cn(
                  "flex-1 h-full rounded-[3px]",
                  day.cost / maxDailyCost > 0.1
                    ? "bg-accent-yellow"
                    : "bg-card-border"
                )}
              />
            ))}
            {Array.from({ length: Math.max(0, 30 - last30.length) }).map(
              (_, i) => (
                <div
                  key={`empty-${i}`}
                  className="flex-1 h-full rounded-[3px] bg-card-border"
                />
              )
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
