/**
 * Lifetime stats aggregator.
 * All-time totals calculated from session JSONL files.
 */

import type { SessionFileData } from "./sessions";

export interface LifetimeStats {
  totalTokens: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  totalCacheReadTokens: number;
  totalCacheWriteTokens: number;
  totalMessages: number;
  totalSessions: number;
  totalCost: number;
  firstSessionDate: string | null;
  lastSessionDate: string | null;
}

export function calculateLifetimeStats(
  sessions: SessionFileData[],
  lifetimeCost: number
): LifetimeStats {
  let totalTokens = 0;
  let totalInput = 0;
  let totalOutput = 0;
  let totalCacheRead = 0;
  let totalCacheWrite = 0;
  let totalMessages = 0;
  let firstDate: string | null = null;
  let lastDate: string | null = null;

  for (const session of sessions) {
    totalInput += session.totalInputTokens;
    totalOutput += session.totalOutputTokens;
    totalCacheRead += session.totalCacheReadTokens;
    totalCacheWrite += session.totalCacheWriteTokens;
    totalMessages += session.messageCount;

    if (session.firstTimestamp) {
      if (!firstDate || session.firstTimestamp < firstDate) {
        firstDate = session.firstTimestamp;
      }
    }
    if (session.lastTimestamp) {
      if (!lastDate || session.lastTimestamp > lastDate) {
        lastDate = session.lastTimestamp;
      }
    }
  }

  totalTokens = totalInput + totalOutput + totalCacheRead + totalCacheWrite;

  return {
    totalTokens,
    totalInputTokens: totalInput,
    totalOutputTokens: totalOutput,
    totalCacheReadTokens: totalCacheRead,
    totalCacheWriteTokens: totalCacheWrite,
    totalMessages,
    totalSessions: sessions.length,
    totalCost: lifetimeCost,
    firstSessionDate: firstDate,
    lastSessionDate: lastDate,
  };
}
