"use client";

import { TrendingUp, Clock, Flame, AlertTriangle } from "lucide-react";
import type { CostSnapshot } from "@/types";

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
        stroke="rgba(0,0,0,0.06)"
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

function TrendBar({ data }: { data: CostSnapshot["dailyTrend"] }) {
  const max = Math.max(...data.map((d) => d.cost), 1);

  return (
    <div className="flex items-end gap-1.5 h-20">
      {data.map((d, i) => {
        const height = Math.max((d.cost / max) * 100, 4);
        const isToday = i === data.length - 1;
        return (
          <div key={d.date} className="flex flex-col items-center gap-1.5 flex-1" title={`${d.date}: $${d.cost.toFixed(2)}`}>
            <div
              className={`w-full rounded ${
                isToday ? "bg-foreground" : "bg-foreground/15"
              }`}
              style={{ height: `${height}%` }}
            />
            <span className="text-[9px] text-muted/60 truncate w-full text-center">
              {d.date.split(" ")[1]}
            </span>
          </div>
        );
      })}
    </div>
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
            <span className="font-mono font-medium text-foreground" style={{ fontVariantNumeric: "tabular-nums" }}>${m.cost.toFixed(2)}</span>
          </div>
        ))}
      </div>
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
            <p className="text-4xl font-bold font-mono tracking-tight text-foreground" style={{ fontVariantNumeric: "tabular-nums" }}>
              ${cost.todaySpend.toFixed(2)}
            </p>
            <p className="text-[13px] text-muted font-mono mt-1" style={{ fontVariantNumeric: "tabular-nums" }}>
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
                  <span className="font-mono font-medium text-foreground" style={{ fontVariantNumeric: "tabular-nums" }}>
                    ${cost.burnRatePerHour.toFixed(2)}/hr
                  </span>
                )}
              </span>
            </div>
            {cost.timeToLimitHours && !cost.isIdle && (
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
        <div className="mt-4 flex items-center gap-2 rounded-lg bg-accent-yellow/8 px-4 py-2.5 text-[13px] text-accent-yellow" style={{ boxShadow: "0 0 0 1px rgba(245, 158, 11, 0.15)" }}>
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
      <h3 className="text-[12px] font-medium text-muted mb-4">
        Model Breakdown
      </h3>
      <div className="flex-1 flex flex-col justify-center">
        <ModelBar models={cost.modelSplit} />
      </div>
    </div>
  );
}

/** 7-day trend wide card */
export function CostTrend({ cost }: { cost: CostSnapshot }) {
  return (
    <div className="panel-frame p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[12px] font-medium text-muted">
          7-Day Trend
        </h3>
        <div className="flex items-center gap-1.5 text-[12px] text-muted">
          <TrendingUp size={13} />
          <span style={{ fontVariantNumeric: "tabular-nums" }}>Projected: ${cost.projectedMonthly}/mo</span>
        </div>
      </div>
      <TrendBar data={cost.dailyTrend} />
    </div>
  );
}
