import { NextResponse } from "next/server";
import { readAllSessions } from "@/lib/data/sessions";
import { calculateCostSummary } from "@/lib/data/cost";
import { calculateBurnRate } from "@/lib/data/burn-rate";
import { calculateLifetimeStats } from "@/lib/data/lifetime";
import { readOpenClawConfig, extractModelPricing } from "@/lib/data/config";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sessionPath = searchParams.get("path") ?? undefined;
  const dailyBudget = searchParams.get("dailyBudget")
    ? parseFloat(searchParams.get("dailyBudget")!)
    : null;

  // Read config for pricing
  const config = await readOpenClawConfig();
  const configPricing = config ? extractModelPricing(config) : undefined;

  // Read all sessions
  const sessions = await readAllSessions(sessionPath);

  if (sessions.length === 0) {
    return NextResponse.json({
      available: false,
      cost: null,
      burnRate: null,
      lifetime: null,
    });
  }

  // Calculate cost summary
  const costSummary = calculateCostSummary(sessions, configPricing);

  // Calculate burn rate
  const burnRate = calculateBurnRate(
    sessions,
    costSummary.todaySpend,
    dailyBudget,
    configPricing
  );

  // Calculate lifetime stats
  const lifetime = calculateLifetimeStats(sessions, costSummary.lifetimeCost);

  return NextResponse.json({
    available: true,
    cost: costSummary,
    burnRate,
    lifetime,
  });
}
