import { NextResponse } from "next/server";
import { readAllSessions } from "@/lib/data/sessions";
import { calculateCostSummary } from "@/lib/data/cost";
import { calculateBurnRate } from "@/lib/data/burn-rate";
import { calculateLifetimeStats } from "@/lib/data/lifetime";
import { buildHeatmapData } from "@/lib/data/heatmap";
import { readOpenClawConfig, extractModelPricing } from "@/lib/data/config";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sessionPath = searchParams.get("path") ?? undefined;
  const dailyBudget = searchParams.get("dailyBudget")
    ? parseFloat(searchParams.get("dailyBudget")!)
    : null;

  const config = await readOpenClawConfig();
  const configPricing = config ? extractModelPricing(config) : undefined;

  const sessions = await readAllSessions(sessionPath);

  if (sessions.length === 0) {
    return NextResponse.json({
      available: false,
      cost: null,
      burnRate: null,
      lifetime: null,
      heatmap: null,
      sessions: [],
    });
  }

  const costSummary = calculateCostSummary(sessions, configPricing);
  const burnRate = calculateBurnRate(sessions, costSummary.todaySpend, dailyBudget, configPricing);
  const lifetime = calculateLifetimeStats(sessions, costSummary.lifetimeCost);
  const heatmap = buildHeatmapData(sessions);

  // Session summaries for the dashboard
  const sessionSummaries = sessions.map((s) => ({
    filename: s.filename,
    sessionId: s.sessionId,
    messageCount: s.messageCount,
    totalCost: s.totalCost,
    totalTokens: s.totalInputTokens + s.totalOutputTokens + s.totalCacheReadTokens + s.totalCacheWriteTokens,
    firstTimestamp: s.firstTimestamp,
    lastTimestamp: s.lastTimestamp,
    models: Array.from(s.models),
    provider: s.provider,
  }));

  return NextResponse.json({
    available: true,
    cost: costSummary,
    burnRate,
    lifetime,
    heatmap,
    sessions: sessionSummaries,
  });
}
