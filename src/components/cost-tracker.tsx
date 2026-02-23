"use client";

import { TrendingUp, Clock, Flame, AlertTriangle } from "lucide-react";
import type { CostSnapshot } from "@/types";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function BudgetRing({ spent, budget }: { spent: number; budget: number }) {
  const pct = Math.min((spent / budget) * 100, 100);
  const r = 38;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  const color =
    pct > 85 ? "var(--accent-red)" : pct > 60 ? "var(--accent-yellow)" : "var(--accent-green)";

  return (
    <svg width="96" height="96" viewBox="0 0 96 96" className="shrink-0">
      <circle
        cx="48"
        cy="48"
        r={r}
        fill="none"
        stroke="var(--card-border)"
        strokeWidth="6"
      />
      <circle
        cx="48"
        cy="48"
        r={r}
        fill="none"
        stroke={color}
        strokeWidth="6"
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        transform="rotate(-90 48 48)"
        className="transition-[stroke-dashoffset] duration-700"
        style={{ transitionTimingFunction: "var(--ease-out)" }}
      />
      <text
        x="48"
        y="44"
        textAnchor="middle"
        fill="var(--foreground)"
        fontSize="18"
        fontWeight="700"
        fontFamily="var(--font-mono)"
      >
        ${spent.toFixed(2)}
      </text>
      <text
        x="48"
        y="60"
        textAnchor="middle"
        fill="var(--muted)"
        fontSize="10"
      >
        of ${budget}
      </text>
    </svg>
  );
}

function ModelBar({ models }: { models: CostSnapshot["modelSplit"] }) {
  return (
    <div className="space-y-3">
      <div className="flex h-2 rounded-full overflow-hidden bg-foreground/5">
        {models.map((m) => (
          <div
            key={m.model}
            className="h-full"
            style={{ width: `${m.percentage}%`, backgroundColor: m.color }}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-x-5 gap-y-1.5">
        {models.map((m) => (
          <div key={m.model} className="flex items-center gap-2 text-[12px]">
            <span
              className="h-2.5 w-2.5 rounded-full shrink-0"
              style={{ backgroundColor: m.color }}
            />
            <span className="text-muted">{m.model}</span>
            <span
              className="font-mono font-medium text-foreground"
              style={{ fontVariantNumeric: "tabular-nums" }}
            >
              ${m.cost.toFixed(2)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

interface TooltipPayload {
  value?: number;
  name?: string;
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
}) {
  if (!active || !payload || payload.length === 0) return null;
  const value = payload[0]?.value ?? 0;
  return (
    <div
      className="rounded-lg bg-card px-3 py-2 text-[12px]"
      style={{ boxShadow: "0 4px 16px var(--shadow-medium)", border: "1px solid var(--card-border)" }}
    >
      <p className="text-muted mb-0.5">{label}</p>
      <p className="font-mono font-semibold text-foreground" style={{ fontVariantNumeric: "tabular-nums" }}>
        ${value.toFixed(3)}
      </p>
    </div>
  );
}

/** Today's spend hero card with budget ring and burn rate */
export function CostHero({ cost }: { cost: CostSnapshot }) {
  const budgetPct = cost.dailyBudget
    ? Math.round((cost.todaySpend / cost.dailyBudget) * 100)
    : null;

  return (
    <div className="panel-frame p-6">
      <div className="flex items-center gap-6">
        {cost.dailyBudget && (
          <BudgetRing spent={cost.todaySpend} budget={cost.dailyBudget} />
        )}
        <div className="flex-1 space-y-3">
          <div>
            <p className="text-[12px] text-muted mb-1">Today&apos;s Spend</p>
            <p
              className="text-4xl font-bold font-mono tracking-tight text-foreground"
              style={{ fontVariantNumeric: "tabular-nums" }}
            >
              ${cost.todaySpend.toFixed(2)}
            </p>
            <p
              className="text-[13px] text-muted font-mono mt-1"
              style={{ fontVariantNumeric: "tabular-nums" }}
            >
              {(cost.todayTokens / 1000).toFixed(0)}K tokens
            </p>
          </div>

          <div className="flex gap-5">
            <div className="flex items-center gap-1.5">
              <Flame size={13} className="text-accent-yellow" />
              <span className="text-[13px]">
                {cost.isIdle ? (
                  <span className="text-muted">Idle</span>
                ) : (
                  <span
                    className="font-mono font-medium text-foreground"
                    style={{ fontVariantNumeric: "tabular-nums" }}
                  >
                    ${cost.burnRatePerHour.toFixed(2)}/hr
                  </span>
                )}
              </span>
            </div>
            {cost.timeToLimitHours != null && !cost.isIdle && (
              <div className="flex items-center gap-1.5">
                <Clock size={13} className="text-muted" />
                <span className="text-[13px] text-muted">
                  ~{cost.timeToLimitHours.toFixed(1)}h to limit
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {budgetPct !== null && budgetPct > 80 && (
        <div className="mt-4 flex items-center gap-2 rounded-lg bg-accent-yellow/8 border border-accent-yellow/15 px-4 py-2.5 text-[13px] text-accent-yellow">
          <AlertTriangle size={14} />
          Daily budget {budgetPct}% used
        </div>
      )}
    </div>
  );
}

/** Model breakdown card */
export function CostBreakdown({ cost }: { cost: CostSnapshot }) {
  return (
    <div className="panel-frame p-6 flex flex-col">
      <h3 className="text-[12px] font-medium text-muted mb-4">Model Breakdown</h3>
      <div className="flex-1 flex flex-col justify-center">
        {cost.modelSplit.length > 0 ? (
          <ModelBar models={cost.modelSplit} />
        ) : (
          <p className="text-[12px] text-muted/50 text-center">No model data yet</p>
        )}
      </div>
    </div>
  );
}

/** 7-day trend using Recharts AreaChart */
export function CostTrend({ cost }: { cost: CostSnapshot }) {
  const data = cost.dailyTrend.map((d) => ({
    date: d.date.split(" ").pop() ?? d.date.slice(-5),
    cost: d.cost,
    tokens: d.tokens,
  }));

  const hasData = data.some((d) => d.cost > 0);

  return (
    <div className="panel-frame p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[12px] font-medium text-muted">7-Day Trend</h3>
        <div className="flex items-center gap-1.5 text-[12px] text-muted">
          <TrendingUp size={13} />
          <span style={{ fontVariantNumeric: "tabular-nums" }}>
            Projected: ${cost.projectedMonthly.toFixed(2)}/mo
          </span>
        </div>
      </div>

      {hasData ? (
        <div className="h-24">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 4, right: 4, bottom: 4, left: 0 }}
            >
              <defs>
                <linearGradient id="costGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--foreground)" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="var(--foreground)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="date"
                tick={{ fontSize: 9, fill: "var(--muted)", opacity: 0.6 }}
                axisLine={false}
                tickLine={false}
                interval={0}
              />
              <YAxis hide />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="cost"
                stroke="var(--foreground)"
                strokeWidth={1.5}
                fill="url(#costGradient)"
                dot={false}
                activeDot={{ r: 3, fill: "var(--foreground)" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="h-24 flex items-center justify-center">
          <p className="text-[12px] text-muted/50">No spend data in the last 7 days</p>
        </div>
      )}
    </div>
  );
}
