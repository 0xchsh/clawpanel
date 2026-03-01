"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import {
  Link as LinkIcon,
  CurrencyDollar,
  Bell,
  ArrowsClockwise,
  Sun,
  Moon,
  Desktop,
  Check,
  ChatsCircle,
  Trash,
  Plus,
} from "@phosphor-icons/react";
import {
  SiWhatsapp,
  SiTelegram,
  SiDiscord,
} from "@icons-pack/react-simple-icons";
import type { Icon as PhosphorIcon } from "@phosphor-icons/react";
import { useTheme } from "@/components/theme-provider";
import { useGatewayContext } from "@/contexts/gateway-context";
import { cn } from "@/lib/utils";

interface SettingsState {
  gatewayUrl: string;
  gatewayToken: string;
  dailyBudgetEnabled: boolean;
  dailyBudget: string;
  monthlyBudgetEnabled: boolean;
  monthlyBudget: string;
  notificationsEnabled: boolean;
  activityPollRate: string;
  costRecalcInterval: string;
  sessionDataPath: string;
}

const defaultSettings: SettingsState = {
  gatewayUrl: "ws://127.0.0.1:18789",
  gatewayToken: "",
  dailyBudgetEnabled: false,
  dailyBudget: "10.00",
  monthlyBudgetEnabled: false,
  monthlyBudget: "150.00",
  notificationsEnabled: false,
  activityPollRate: "5",
  costRecalcInterval: "30",
  sessionDataPath: "~/.openclaw/agents/main/sessions/",
};

function Toggle({
  enabled,
  onToggle,
}: {
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      onClick={onToggle}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors duration-150",
        enabled ? "bg-foreground" : "bg-card-border"
      )}
    >
      <span
        className={cn(
          "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform duration-150 mt-[2px]",
          enabled ? "translate-x-5" : "translate-x-0.5"
        )}
      />
    </button>
  );
}

const channelBrandIcon: Record<string, { icon: typeof SiWhatsapp; color: string }> = {
  whatsapp: { icon: SiWhatsapp, color: "#25D366" },
  telegram: { icon: SiTelegram, color: "#26A5E4" },
  discord: { icon: SiDiscord, color: "#5865F2" },
};

const statusDotColor: Record<string, string> = {
  connected: "bg-accent-green",
  degraded: "bg-accent-yellow",
  disconnected: "bg-accent-red",
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<SettingsState>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const { theme, setTheme } = useTheme();
  const { channelHealth } = useGatewayContext();
  const searchParams = useSearchParams();
  const channelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data: Record<string, unknown>) => {
        setSettings((prev) => ({
          ...prev,
          gatewayUrl: (data.gatewayUrl as string) || prev.gatewayUrl,
          gatewayToken: (data.gatewayToken as string) || prev.gatewayToken,
          dailyBudgetEnabled:
            (data.budgets as Record<string, unknown> | undefined)?.daily != null
              ? ((data.budgets as Record<string, Record<string, unknown>>).daily
                  ?.enabled as boolean) ?? false
              : prev.dailyBudgetEnabled,
          dailyBudget:
            (data.budgets as Record<string, unknown> | undefined)?.daily != null
              ? String(
                  ((data.budgets as Record<string, Record<string, unknown>>)
                    .daily?.amount as number) ?? prev.dailyBudget
                )
              : prev.dailyBudget,
          monthlyBudgetEnabled:
            (data.budgets as Record<string, unknown> | undefined)?.monthly !=
            null
              ? ((data.budgets as Record<string, Record<string, unknown>>)
                  .monthly?.enabled as boolean) ?? false
              : prev.monthlyBudgetEnabled,
          monthlyBudget:
            (data.budgets as Record<string, unknown> | undefined)?.monthly !=
            null
              ? String(
                  ((data.budgets as Record<string, Record<string, unknown>>)
                    .monthly?.amount as number) ?? prev.monthlyBudget
                )
              : prev.monthlyBudget,
          notificationsEnabled:
            (data.notificationsEnabled as boolean) ??
            prev.notificationsEnabled,
          activityPollRate: String(
            (data.activityPollRate as number) ?? prev.activityPollRate
          ),
          costRecalcInterval: String(
            (data.costRecalcInterval as number) ?? prev.costRecalcInterval
          ),
          sessionDataPath:
            (data.sessionDataPath as string) || prev.sessionDataPath,
        }));
        if (data.theme) setTheme(data.theme as "light" | "dark" | "system");
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [setTheme]);

  // Scroll to channels section if linked from sidebar
  useEffect(() => {
    if (searchParams.get("section") === "channels" && channelRef.current) {
      setTimeout(() => {
        channelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
  }, [searchParams, loading]);

  const update = useCallback(
    (key: keyof SettingsState, value: string | boolean) => {
      setSettings((prev) => ({ ...prev, [key]: value }));
      setSaved(false);
    },
    []
  );

  const handleSave = useCallback(async () => {
    const payload = {
      gatewayUrl: settings.gatewayUrl,
      gatewayToken: settings.gatewayToken,
      notificationsEnabled: settings.notificationsEnabled,
      activityPollRate: Number(settings.activityPollRate),
      costRecalcInterval: Number(settings.costRecalcInterval),
      sessionDataPath: settings.sessionDataPath,
      theme,
      budgets: {
        daily: settings.dailyBudgetEnabled
          ? { enabled: true, amount: parseFloat(settings.dailyBudget) || 10 }
          : null,
        monthly: settings.monthlyBudgetEnabled
          ? {
              enabled: true,
              amount: parseFloat(settings.monthlyBudget) || 150,
            }
          : null,
      },
    };

    try {
      await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      await fetch("/api/budget", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload.budgets),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      // ignore
    }
  }, [settings, theme]);

  const themeOptions: {
    value: "light" | "dark" | "system";
    label: string;
    icon: PhosphorIcon;
  }[] = [
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
    { value: "system", label: "System", icon: Desktop },
  ];

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-sm text-muted">Loading settings…</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col px-4 py-8 lg:px-0 lg:py-0">
      {/* Page title */}
      <div className="flex items-center justify-between h-9">
        <h1 className="text-xl font-semibold text-foreground">Settings</h1>
        <span className="text-base font-semibold text-muted">
          ClawPanel configuration
        </span>
      </div>

      <div className="flex flex-col gap-3 mt-8">
        {/* Appearance */}
        <SettingsSection icon={Sun} title="Appearance">
          <div>
            <p className="text-sm font-semibold text-foreground mb-2">Theme</p>
            <div className="flex gap-2">
              {themeOptions.map((opt) => {
                const Icon = opt.icon;
                const active = theme === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      setTheme(opt.value);
                      setSaved(false);
                    }}
                    className={cn(
                      "flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition-colors duration-150 cursor-pointer active:scale-[0.97]",
                      active
                        ? "bg-foreground text-card"
                        : "bg-card text-muted hover:text-foreground"
                    )}
                  >
                    <Icon size={16} weight={active ? "fill" : "regular"} />
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
        </SettingsSection>

        {/* Gateway Connection */}
        <SettingsSection icon={LinkIcon} title="Gateway Connection">
          <Field
            label="Gateway URL"
            description="WebSocket URL for the OpenClaw gateway"
          >
            <input
              type="text"
              value={settings.gatewayUrl}
              onChange={(e) => update("gatewayUrl", e.target.value)}
              className="settings-input"
              placeholder="ws://127.0.0.1:18789"
            />
          </Field>
          <Field
            label="Gateway Token"
            description="Auth token (auto-detected for local connections)"
          >
            <input
              type="password"
              value={settings.gatewayToken}
              onChange={(e) => update("gatewayToken", e.target.value)}
              className="settings-input"
              placeholder="Auto-detect or paste token"
            />
          </Field>
        </SettingsSection>

        {/* Budget Limits */}
        <SettingsSection icon={CurrencyDollar} title="Budget Limits">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-foreground">
                Daily Budget
              </p>
              <p className="text-xs text-muted">Set a daily spending limit</p>
            </div>
            <Toggle
              enabled={settings.dailyBudgetEnabled}
              onToggle={() =>
                update("dailyBudgetEnabled", !settings.dailyBudgetEnabled)
              }
            />
          </div>
          {settings.dailyBudgetEnabled && (
            <div className="flex items-center gap-2">
              <span className="text-sm font-mono text-muted">$</span>
              <input
                type="text"
                value={settings.dailyBudget}
                onChange={(e) => update("dailyBudget", e.target.value)}
                className="settings-input w-28"
                placeholder="10.00"
              />
              <span className="text-xs text-muted">USD / day</span>
            </div>
          )}

          <div className="h-px bg-card-border" />

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-foreground">
                Monthly Budget
              </p>
              <p className="text-xs text-muted">
                Set a monthly spending limit
              </p>
            </div>
            <Toggle
              enabled={settings.monthlyBudgetEnabled}
              onToggle={() =>
                update(
                  "monthlyBudgetEnabled",
                  !settings.monthlyBudgetEnabled
                )
              }
            />
          </div>
          {settings.monthlyBudgetEnabled && (
            <div className="flex items-center gap-2">
              <span className="text-sm font-mono text-muted">$</span>
              <input
                type="text"
                value={settings.monthlyBudget}
                onChange={(e) => update("monthlyBudget", e.target.value)}
                className="settings-input w-28"
                placeholder="150.00"
              />
              <span className="text-xs text-muted">USD / month</span>
            </div>
          )}
        </SettingsSection>

        {/* Channels */}
        <div ref={channelRef}>
          <SettingsSection icon={ChatsCircle} title="Channels">
            {channelHealth.length === 0 ? (
              <p className="text-sm text-muted py-2">
                No channels configured. Add a messaging channel to connect your agent.
              </p>
            ) : (
              <div className="flex flex-col gap-3">
                {channelHealth.map((ch) => {
                  const brand = channelBrandIcon[ch.provider];
                  const BrandIcon = brand?.icon;
                  return (
                    <div
                      key={ch.name}
                      className="flex items-center gap-3 rounded-lg bg-background px-4 py-3"
                    >
                      {BrandIcon ? (
                        <BrandIcon
                          size={20}
                          color={ch.status === "connected" ? brand.color : "var(--muted)"}
                          className="shrink-0"
                        />
                      ) : (
                        <ChatsCircle size={20} weight="fill" className="text-muted shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground">
                          {ch.name}
                        </p>
                        <p className="text-xs text-muted capitalize">
                          {ch.provider}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span
                          className={cn(
                            "h-2 w-2 rounded-full",
                            statusDotColor[ch.status],
                          )}
                        />
                        <span className="text-sm text-muted capitalize">
                          {ch.status}
                        </span>
                      </div>
                      <button
                        type="button"
                        aria-label={`Remove ${ch.name}`}
                        className="p-1 rounded-md text-muted hover:text-accent-red transition-colors duration-150 cursor-pointer"
                      >
                        <Trash size={14} weight="regular" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
            <button
              type="button"
              className="flex items-center gap-2 mt-1 px-3 py-2 rounded-md text-sm font-semibold text-muted hover:text-foreground transition-colors duration-150 cursor-pointer"
            >
              <Plus size={14} weight="bold" />
              Add Channel
            </button>
          </SettingsSection>
        </div>

        {/* Notifications */}
        <SettingsSection icon={Bell} title="Notifications">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-foreground">
                Budget Alerts
              </p>
              <p className="text-xs text-muted">
                Browser notifications at 80% and 100% of budget limits
              </p>
            </div>
            <Toggle
              enabled={settings.notificationsEnabled}
              onToggle={() =>
                update(
                  "notificationsEnabled",
                  !settings.notificationsEnabled
                )
              }
            />
          </div>
        </SettingsSection>

        {/* Refresh Intervals */}
        <SettingsSection icon={ArrowsClockwise} title="Refresh Intervals">
          <Field
            label="Activity Feed Poll Rate"
            description="Seconds between activity feed refreshes"
          >
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={settings.activityPollRate}
                onChange={(e) => update("activityPollRate", e.target.value)}
                className="settings-input w-20"
              />
              <span className="text-xs text-muted">seconds</span>
            </div>
          </Field>
          <Field
            label="Cost Recalculation"
            description="Seconds between cost recalculations"
          >
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={settings.costRecalcInterval}
                onChange={(e) =>
                  update("costRecalcInterval", e.target.value)
                }
                className="settings-input w-20"
              />
              <span className="text-xs text-muted">seconds</span>
            </div>
          </Field>
          <Field
            label="Session Data Path"
            description="Override for non-standard OpenClaw installations"
          >
            <input
              type="text"
              value={settings.sessionDataPath}
              onChange={(e) => update("sessionDataPath", e.target.value)}
              className="settings-input"
              placeholder="~/.openclaw/agents/main/sessions/"
            />
          </Field>
        </SettingsSection>

        {/* Save */}
        <div className="flex flex-col gap-3">
          <div className="bg-card border border-card-border rounded-lg p-4">
            <p className="text-xs text-muted leading-relaxed">
              ClawPanel is a monitor, not a config editor. To change OpenClaw
              settings, use{" "}
              <code className="rounded-md bg-card px-1.5 py-0.5 font-mono text-xs text-foreground">
                openclaw config set
              </code>{" "}
              or message your agent.
            </p>
          </div>
          <button
            type="button"
            onClick={handleSave}
            className={cn(
              "flex items-center justify-center gap-2 rounded-md px-6 py-3 text-sm font-semibold transition-all duration-200 cursor-pointer active:scale-[0.97] w-full",
              saved
                ? "bg-accent-green/10 text-accent-green"
                : "bg-foreground text-card hover:bg-foreground/90"
            )}
          >
            {saved ? (
              <>
                <Check size={16} weight="bold" />
                Saved
              </>
            ) : (
              "Save Settings"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function SettingsSection({
  icon: Icon,
  title,
  children,
}: {
  icon: PhosphorIcon;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-card border border-card-border rounded-lg overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-card-border/50">
        <Icon size={16} weight="regular" className="text-muted" />
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      </div>
      <div className="flex flex-col gap-4 p-4">{children}</div>
    </div>
  );
}

function Field({
  label,
  description,
  children,
}: {
  label: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div>
        <p className="text-sm font-semibold text-foreground">{label}</p>
        <p className="text-xs text-muted">{description}</p>
      </div>
      {children}
    </div>
  );
}
