"use client";

import { useState, useMemo } from "react";
import { Flame } from "lucide-react";

interface HeatmapCell {
  day: string;
  hour: number;
  messages: number;
  tokens: number;
}

interface ActivityHeatmapProps {
  cells: HeatmapCell[];
  maxMessages: number;
  days: string[];
  currentStreak: number;
  longestStreak: number;
}

function getIntensity(value: number, max: number): 0 | 1 | 2 | 3 {
  if (value === 0 || max === 0) return 0;
  const ratio = value / max;
  if (ratio < 0.25) return 1;
  if (ratio < 0.6) return 2;
  return 3;
}

const intensityColors = [
  "bg-foreground/[0.03]",  // 0: empty
  "bg-foreground/10",      // 1: light
  "bg-foreground/25",      // 2: medium
  "bg-foreground/50",      // 3: dark
];

function formatDay(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatHour(hour: number): string {
  if (hour === 0) return "12a";
  if (hour === 12) return "12p";
  return hour < 12 ? `${hour}a` : `${hour - 12}p`;
}

export function ActivityHeatmap({
  cells,
  maxMessages,
  days,
  currentStreak,
  longestStreak,
}: ActivityHeatmapProps) {
  const [tooltip, setTooltip] = useState<{
    cell: HeatmapCell;
    x: number;
    y: number;
  } | null>(null);

  // Group cells by day for column rendering
  const columns = useMemo(() => {
    const map = new Map<string, HeatmapCell[]>();
    for (const cell of cells) {
      const existing = map.get(cell.day) ?? [];
      existing.push(cell);
      map.set(cell.day, existing);
    }
    return days.map((day) => ({
      day,
      hours: map.get(day) ?? [],
    }));
  }, [cells, days]);

  // Show labels for every 5th day and hours 0, 6, 12, 18
  const hourLabels = [0, 6, 12, 18];

  return (
    <div className="panel-frame p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[12px] font-medium text-muted">
          Activity — 30 Days
        </h3>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-[11px] text-muted">
            <span>Less</span>
            {intensityColors.map((color, i) => (
              <span key={i} className={`h-2.5 w-2.5 rounded-sm ${color}`} />
            ))}
            <span>More</span>
          </div>
        </div>
      </div>

      <div className="relative overflow-x-auto">
        <div className="flex gap-px" style={{ minWidth: "fit-content" }}>
          {/* Hour labels column */}
          <div className="flex flex-col gap-px pr-1.5 shrink-0">
            {Array.from({ length: 24 }, (_, h) => (
              <div
                key={h}
                className="flex items-center justify-end"
                style={{ height: 10, width: 24 }}
              >
                {hourLabels.includes(h) && (
                  <span className="text-[8px] text-muted/50 leading-none">
                    {formatHour(h)}
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Grid columns */}
          {columns.map((col, colIdx) => (
            <div key={col.day} className="flex flex-col gap-px">
              {col.hours
                .sort((a, b) => a.hour - b.hour)
                .map((cell) => {
                  const level = getIntensity(cell.messages, maxMessages);
                  return (
                    <div
                      key={cell.hour}
                      className={`rounded-[2px] cursor-default transition-opacity duration-100 ${intensityColors[level]}`}
                      style={{ width: 10, height: 10 }}
                      onMouseEnter={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        setTooltip({ cell, x: rect.left, y: rect.top });
                      }}
                      onMouseLeave={() => setTooltip(null)}
                    />
                  );
                })}
              {/* Day label below (every 7th column) */}
              {colIdx % 7 === 0 && (
                <span className="text-[8px] text-muted/50 mt-1 text-center leading-none">
                  {formatDay(col.day)}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Streak counter */}
      <div className="mt-4 flex items-center gap-4 text-[12px]">
        <div className="flex items-center gap-1.5">
          <Flame size={13} className="text-accent-yellow" />
          <span className="font-medium text-foreground">{currentStreak}-day streak</span>
        </div>
        {longestStreak > currentStreak && (
          <span className="text-muted">
            Longest: {longestStreak} days
          </span>
        )}
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="fixed rounded-lg bg-foreground px-3 py-2 text-[11px] text-card pointer-events-none"
          style={{
            left: tooltip.x,
            top: tooltip.y - 48,
            zIndex: "var(--z-tooltip)",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
          }}
        >
          <p className="font-medium">
            {formatDay(tooltip.cell.day)} at {formatHour(tooltip.cell.hour)}
          </p>
          <p className="text-card/70">
            {tooltip.cell.messages} messages · {(tooltip.cell.tokens / 1000).toFixed(1)}K tokens
          </p>
        </div>
      )}
    </div>
  );
}
