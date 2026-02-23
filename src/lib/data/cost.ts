/**
 * Cost calculation engine.
 * Aggregates token usage from session data and calculates costs.
 * Uses the embedded cost data from JSONL when available, falls back to pricing lookup.
 */

import type { SessionFileData } from "./sessions";
import { calculateCost, getPricing, type ModelPricing } from "./pricing";

export interface DailySpendData {
  date: string;
  cost: number;
  tokens: number;
  inputTokens: number;
  outputTokens: number;
  cacheReadTokens: number;
  cacheWriteTokens: number;
}

export interface ModelCostData {
  model: string;
  cost: number;
  tokens: number;
  percentage: number;
}

export interface CostSummary {
  todaySpend: number;
  todayTokens: number;
  todayInputTokens: number;
  todayOutputTokens: number;
  todayCacheReadTokens: number;
  todayCacheWriteTokens: number;
  dailyTrend: DailySpendData[];
  modelSplit: ModelCostData[];
  projectedMonthly: number;
  lifetimeCost: number;
  lifetimeTokens: number;
  lifetimeMessages: number;
}

function getDateKey(timestamp: string): string {
  return new Date(timestamp).toISOString().split("T")[0];
}

function getTodayKey(): string {
  return new Date().toISOString().split("T")[0];
}

export function calculateCostSummary(
  sessions: SessionFileData[],
  configPricing?: Record<string, ModelPricing>
): CostSummary {
  const today = getTodayKey();
  const dailyMap = new Map<string, DailySpendData>();
  const modelMap = new Map<string, { cost: number; tokens: number }>();

  let lifetimeCost = 0;
  let lifetimeTokens = 0;
  let lifetimeMessages = 0;

  for (const session of sessions) {
    for (const entry of session.messages) {
      if (entry.type !== "message" || !entry.message) continue;

      const msg = entry.message;
      if (!msg.usage) continue;

      lifetimeMessages++;

      const u = msg.usage;
      const input = u.input ?? 0;
      const output = u.output ?? 0;
      const cacheRead = u.cacheRead ?? 0;
      const cacheWrite = u.cacheWrite ?? 0;
      const totalTokens = u.totalTokens ?? (input + output + cacheRead + cacheWrite);

      // Use embedded cost if available, otherwise calculate from pricing
      let cost = 0;
      if (u.cost?.total) {
        cost = u.cost.total;
      } else {
        const model = msg.model ?? "unknown";
        const pricing = getPricing(model, configPricing);
        if (pricing) {
          cost = calculateCost({ input, output, cacheRead, cacheWrite }, pricing);
        }
      }

      lifetimeCost += cost;
      lifetimeTokens += totalTokens;

      // Model split
      const model = msg.model ?? "unknown";
      const existing = modelMap.get(model) ?? { cost: 0, tokens: 0 };
      modelMap.set(model, {
        cost: existing.cost + cost,
        tokens: existing.tokens + totalTokens,
      });

      // Daily aggregation
      const dateKey = entry.timestamp ? getDateKey(entry.timestamp) : today;
      const day = dailyMap.get(dateKey) ?? {
        date: dateKey,
        cost: 0,
        tokens: 0,
        inputTokens: 0,
        outputTokens: 0,
        cacheReadTokens: 0,
        cacheWriteTokens: 0,
      };
      day.cost += cost;
      day.tokens += totalTokens;
      day.inputTokens += input;
      day.outputTokens += output;
      day.cacheReadTokens += cacheRead;
      day.cacheWriteTokens += cacheWrite;
      dailyMap.set(dateKey, day);
    }
  }

  // Build 7-day trend
  const dailyTrend: DailySpendData[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split("T")[0];
    dailyTrend.push(
      dailyMap.get(key) ?? {
        date: key,
        cost: 0,
        tokens: 0,
        inputTokens: 0,
        outputTokens: 0,
        cacheReadTokens: 0,
        cacheWriteTokens: 0,
      }
    );
  }

  // Today's data
  const todayData = dailyMap.get(today) ?? {
    date: today,
    cost: 0,
    tokens: 0,
    inputTokens: 0,
    outputTokens: 0,
    cacheReadTokens: 0,
    cacheWriteTokens: 0,
  };

  // Model split as array sorted by cost
  const totalModelCost = Array.from(modelMap.values()).reduce((s, m) => s + m.cost, 0);
  const modelSplit: ModelCostData[] = Array.from(modelMap.entries())
    .map(([model, data]) => ({
      model,
      cost: data.cost,
      tokens: data.tokens,
      percentage: totalModelCost > 0 ? (data.cost / totalModelCost) * 100 : 0,
    }))
    .sort((a, b) => b.cost - a.cost);

  // Projected monthly
  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const last7Cost = dailyTrend.reduce((s, d) => s + d.cost, 0);
  const avgDaily = last7Cost / 7;
  const projectedMonthly = avgDaily * daysInMonth;

  return {
    todaySpend: todayData.cost,
    todayTokens: todayData.tokens,
    todayInputTokens: todayData.inputTokens,
    todayOutputTokens: todayData.outputTokens,
    todayCacheReadTokens: todayData.cacheReadTokens,
    todayCacheWriteTokens: todayData.cacheWriteTokens,
    dailyTrend,
    modelSplit,
    projectedMonthly,
    lifetimeCost,
    lifetimeTokens,
    lifetimeMessages,
  };
}
