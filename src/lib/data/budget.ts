/**
 * Budget limit checker + browser notification dispatcher.
 */

export interface BudgetConfig {
  daily: { enabled: boolean; amount: number } | null;
  monthly: { enabled: boolean; amount: number } | null;
}

export interface BudgetStatus {
  dailyPct: number | null;
  monthlyPct: number | null;
  dailyState: "safe" | "warning" | "critical" | null;
  monthlyState: "safe" | "warning" | "critical" | null;
}

function getState(pct: number): "safe" | "warning" | "critical" {
  if (pct > 85) return "critical";
  if (pct > 60) return "warning";
  return "safe";
}

export function checkBudget(
  todaySpend: number,
  monthSpend: number,
  config: BudgetConfig
): BudgetStatus {
  const dailyPct =
    config.daily?.enabled && config.daily.amount > 0
      ? (todaySpend / config.daily.amount) * 100
      : null;

  const monthlyPct =
    config.monthly?.enabled && config.monthly.amount > 0
      ? (monthSpend / config.monthly.amount) * 100
      : null;

  return {
    dailyPct,
    monthlyPct,
    dailyState: dailyPct !== null ? getState(dailyPct) : null,
    monthlyState: monthlyPct !== null ? getState(monthlyPct) : null,
  };
}

/**
 * Send browser notification for budget alerts.
 * Only fires when crossing 80% or 100% thresholds.
 */
export function sendBudgetNotification(
  type: "daily" | "monthly",
  pct: number,
  spend: number,
  limit: number,
  burnRatePerHour: number
): void {
  if (typeof window === "undefined" || !("Notification" in window)) return;
  if (Notification.permission !== "granted") return;

  const threshold = pct >= 100 ? "100%" : "80%";
  const title = `${type === "daily" ? "Daily" : "Monthly"} budget ${threshold} used`;
  const body = `$${spend.toFixed(2)} of $${limit.toFixed(2)}. Burning ~$${burnRatePerHour.toFixed(2)}/hr.`;

  new Notification(title, { body, icon: "/favicon.ico" });
}

/**
 * Request notification permission. Call once on first budget configuration.
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === "undefined" || !("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;

  const result = await Notification.requestPermission();
  return result === "granted";
}
