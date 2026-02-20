/**
 * Activity heatmap data builder.
 * 30-day grid: 24 rows (hours) × 30 columns (days).
 * Each cell holds message count and token volume.
 */

import type { SessionFileData } from "./sessions";

export interface HeatmapCell {
  day: string;       // YYYY-MM-DD
  hour: number;      // 0-23
  messages: number;
  tokens: number;
  cost: number;
}

export interface HeatmapData {
  cells: HeatmapCell[];
  maxMessages: number;
  maxTokens: number;
  days: string[];
  currentStreak: number;
  longestStreak: number;
}

export function buildHeatmapData(sessions: SessionFileData[]): HeatmapData {
  const cellMap = new Map<string, HeatmapCell>();
  const activeDays = new Set<string>();

  for (const session of sessions) {
    for (const msg of session.messages) {
      if (!msg.timestamp) continue;

      const date = new Date(msg.timestamp);
      const day = date.toISOString().split("T")[0];
      const hour = date.getHours();
      const key = `${day}-${hour}`;

      activeDays.add(day);

      const tokens =
        (msg.usage?.input_tokens ?? 0) +
        (msg.usage?.output_tokens ?? 0) +
        (msg.usage?.cache_read_input_tokens ?? 0) +
        (msg.usage?.cache_creation_input_tokens ?? 0);

      const existing = cellMap.get(key);
      if (existing) {
        existing.messages++;
        existing.tokens += tokens;
      } else {
        cellMap.set(key, { day, hour, messages: 1, tokens, cost: 0 });
      }
    }
  }

  // Build 30-day range
  const days: string[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().split("T")[0]);
  }

  // Fill all cells for the 30-day grid
  const cells: HeatmapCell[] = [];
  let maxMessages = 0;
  let maxTokens = 0;

  for (const day of days) {
    for (let hour = 0; hour < 24; hour++) {
      const key = `${day}-${hour}`;
      const cell = cellMap.get(key) ?? { day, hour, messages: 0, tokens: 0, cost: 0 };
      cells.push(cell);
      if (cell.messages > maxMessages) maxMessages = cell.messages;
      if (cell.tokens > maxTokens) maxTokens = cell.tokens;
    }
  }

  // Calculate streaks
  const { currentStreak, longestStreak } = calculateStreaks(days, activeDays);

  return { cells, maxMessages, maxTokens, days, currentStreak, longestStreak };
}

function calculateStreaks(
  days: string[],
  activeDays: Set<string>
): { currentStreak: number; longestStreak: number } {
  // Check all days from today backwards
  const allDays: string[] = [];
  for (let i = 0; i < 365; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    allDays.push(d.toISOString().split("T")[0]);
  }

  let currentStreak = 0;
  let longestStreak = 0;
  let streak = 0;

  for (const day of allDays) {
    if (activeDays.has(day)) {
      streak++;
      if (streak > longestStreak) longestStreak = streak;
    } else {
      if (currentStreak === 0 && streak > 0) currentStreak = streak;
      streak = 0;
    }
  }

  // If still streaking from today
  if (currentStreak === 0 && streak > 0) currentStreak = streak;

  return { currentStreak, longestStreak };
}

/**
 * Map a value to an intensity level (0-3) for the heatmap color scale.
 */
export function getIntensityLevel(value: number, max: number): 0 | 1 | 2 | 3 {
  if (value === 0 || max === 0) return 0;
  const ratio = value / max;
  if (ratio < 0.25) return 1;
  if (ratio < 0.6) return 2;
  return 3;
}
