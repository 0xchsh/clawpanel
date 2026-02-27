"use client";

import { useGatewayContext } from "@/contexts/gateway-context";
import { PageHeader } from "@/components/page-header";
import { formatTokenCount, formatDuration, formatRelativeTime } from "@/lib/format";

export default function UsagePage() {
  const { usageData } = useGatewayContext();

  const maxDailyTokens = Math.max(
    ...usageData.dailyData.map(
      (d) => d.inputTokens + d.outputTokens + d.cacheReadTokens + d.cacheWriteTokens
    )
  );

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <PageHeader title="Usage" description="Token and cost analytics" />

      <div className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-4xl space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard label="Total Cost" value={`$${usageData.totalCost.toFixed(2)}`} />
            <StatCard
              label="Input Tokens"
              value={formatTokenCount(usageData.totalInputTokens)}
            />
            <StatCard
              label="Output Tokens"
              value={formatTokenCount(usageData.totalOutputTokens)}
            />
            <StatCard
              label="Cache Tokens"
              value={formatTokenCount(
                usageData.totalCacheReadTokens + usageData.totalCacheWriteTokens
              )}
            />
          </div>

          {/* Latency & Errors */}
          <div className="grid grid-cols-3 gap-3">
            <StatCard
              label="Avg Latency"
              value={formatDuration(usageData.avgLatencyMs)}
            />
            <StatCard
              label="P95 Latency"
              value={formatDuration(usageData.p95LatencyMs)}
            />
            <StatCard
              label="Error Rate"
              value={`${(usageData.errorRate * 100).toFixed(1)}%`}
            />
          </div>

          {/* Daily Breakdown Chart */}
          <Section title="Daily Usage (7 days)">
            <div className="space-y-2">
              {usageData.dailyData.map((day) => {
                const total =
                  day.inputTokens +
                  day.outputTokens +
                  day.cacheReadTokens +
                  day.cacheWriteTokens;
                const pct = maxDailyTokens > 0 ? (total / maxDailyTokens) * 100 : 0;
                const inputPct = (day.inputTokens / total) * pct;
                const outputPct = (day.outputTokens / total) * pct;
                const cachePct =
                  ((day.cacheReadTokens + day.cacheWriteTokens) / total) * pct;

                return (
                  <div key={day.date} className="flex items-center gap-3">
                    <span className="w-20 shrink-0 text-xs text-muted">
                      {day.date.slice(5)}
                    </span>
                    <div className="flex flex-1 h-5 rounded-full bg-background overflow-hidden">
                      <div
                        className="bg-accent-green/60 transition-all"
                        style={{ width: `${inputPct}%` }}
                        title={`Input: ${formatTokenCount(day.inputTokens)}`}
                      />
                      <div
                        className="bg-accent-yellow/60 transition-all"
                        style={{ width: `${outputPct}%` }}
                        title={`Output: ${formatTokenCount(day.outputTokens)}`}
                      />
                      <div
                        className="bg-muted/30 transition-all"
                        style={{ width: `${cachePct}%` }}
                        title={`Cache: ${formatTokenCount(day.cacheReadTokens + day.cacheWriteTokens)}`}
                      />
                    </div>
                    <span className="w-16 shrink-0 text-right font-mono text-[10px] text-muted">
                      ${day.cost.toFixed(2)}
                    </span>
                  </div>
                );
              })}
              <div className="flex items-center gap-4 pt-2 text-[10px] text-muted">
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-accent-green/60" />
                  Input
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-accent-yellow/60" />
                  Output
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-muted/30" />
                  Cache
                </span>
              </div>
            </div>
          </Section>

          {/* Tool Usage */}
          <Section title="Tool Usage">
            <div className="space-y-1.5">
              {usageData.toolStats.map((tool) => (
                <div
                  key={tool.name}
                  className="flex items-center justify-between rounded-xl bg-background px-3 py-2"
                >
                  <span className="font-mono text-sm">{tool.name}</span>
                  <div className="flex items-center gap-4 text-xs text-muted">
                    <span>
                      <span className="font-mono text-foreground">
                        {tool.calls}
                      </span>{" "}
                      calls
                    </span>
                    <span>
                      avg{" "}
                      <span className="font-mono text-foreground">
                        {formatDuration(tool.avgDurationMs)}
                      </span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          {/* Session Analysis */}
          <Section title="Session Analysis">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-[10px] font-semibold uppercase tracking-wider text-muted">
                    <th className="pb-2 pr-4">Session</th>
                    <th className="pb-2 pr-4">Tokens</th>
                    <th className="pb-2 pr-4">Cost</th>
                    <th className="pb-2 pr-4">Messages</th>
                    <th className="pb-2 pr-4">Errors</th>
                    <th className="pb-2">Last Active</th>
                  </tr>
                </thead>
                <tbody>
                  {usageData.sessionStats.map((s) => (
                    <tr key={s.sessionKey} className="border-t border-card-border">
                      <td className="py-2 pr-4">
                        <p className="text-sm font-medium">{s.label}</p>
                        <p className="font-mono text-[10px] text-muted">
                          {s.sessionKey}
                        </p>
                      </td>
                      <td className="py-2 pr-4 font-mono text-xs">
                        {formatTokenCount(s.tokens)}
                      </td>
                      <td className="py-2 pr-4 font-mono text-xs">
                        ${s.cost.toFixed(2)}
                      </td>
                      <td className="py-2 pr-4 font-mono text-xs">
                        {s.messages}
                      </td>
                      <td className="py-2 pr-4 font-mono text-xs">
                        {s.errors > 0 ? (
                          <span className="text-accent-red">{s.errors}</span>
                        ) : (
                          <span className="text-muted">0</span>
                        )}
                      </td>
                      <td
                        className="py-2 text-[10px] text-muted"
                        suppressHydrationWarning
                      >
                        {formatRelativeTime(s.lastActive)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-card-border bg-card p-4">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">
        {label}
      </p>
      <p className="mt-1 text-xl font-semibold">{value}</p>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-card-border bg-card p-4">
      <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted mb-4">
        {title}
      </h3>
      {children}
    </div>
  );
}
