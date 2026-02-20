/**
 * Burn rate + time-to-limit calculator.
 *
 * Looks at the last 15 minutes of token activity to calculate:
 * - Tokens per minute
 * - Cost per hour
 * - Time to daily/monthly budget limit
 */

import type { SessionFileData } from "./sessions";
import { getPricing, calculateCost, type ModelPricing } from "./pricing";

const WINDOW_MINUTES = 15;
const IDLE_THRESHOLD_MINUTES = 5;

export interface BurnRateData {
  tokensPerMinute: number;
  costPerHour: number;
  isIdle: boolean;
  timeToLimitHours: number | null;
}

export function calculateBurnRate(
  sessions: SessionFileData[],
  todaySpend: number,
  dailyBudget: number | null,
  configPricing?: Record<string, ModelPricing>
): BurnRateData {
  const now = Date.now();
  const windowStart = now - WINDOW_MINUTES * 60 * 1000;
  const idleThreshold = now - IDLE_THRESHOLD_MINUTES * 60 * 1000;

  let windowTokens = 0;
  let windowCost = 0;
  let latestActivity = 0;

  for (const session of sessions) {
    for (const msg of session.messages) {
      if (!msg.timestamp || !msg.usage) continue;

      const ts = new Date(msg.timestamp).getTime();
      if (ts < windowStart) continue;

      if (ts > latestActivity) latestActivity = ts;

      const input = msg.usage.input_tokens ?? 0;
      const output = msg.usage.output_tokens ?? 0;
      const cacheRead = msg.usage.cache_read_input_tokens ?? 0;
      const cacheWrite = msg.usage.cache_creation_input_tokens ?? 0;

      windowTokens += input + output + cacheRead + cacheWrite;

      const model = msg.model ?? "unknown";
      const pricing = getPricing(model, configPricing);
      if (pricing) {
        windowCost += calculateCost({ input, output, cacheRead, cacheWrite }, pricing);
      }
    }
  }

  const isIdle = latestActivity < idleThreshold;

  if (isIdle || windowTokens === 0) {
    return {
      tokensPerMinute: 0,
      costPerHour: 0,
      isIdle: true,
      timeToLimitHours: null,
    };
  }

  const windowMinutes = Math.max((now - windowStart) / 60_000, 1);
  const tokensPerMinute = windowTokens / windowMinutes;
  const costPerHour = (windowCost / windowMinutes) * 60;

  let timeToLimitHours: number | null = null;
  if (dailyBudget !== null && costPerHour > 0) {
    const remaining = dailyBudget - todaySpend;
    timeToLimitHours = remaining > 0 ? remaining / costPerHour : 0;
  }

  return {
    tokensPerMinute,
    costPerHour,
    isIdle,
    timeToLimitHours,
  };
}
