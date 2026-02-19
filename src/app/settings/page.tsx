"use client";

import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Link2, DollarSign, Bell, RefreshCw } from "lucide-react";

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
  dailyBudgetEnabled: true,
  dailyBudget: "10.00",
  monthlyBudgetEnabled: true,
  monthlyBudget: "150.00",
  notificationsEnabled: false,
  activityPollRate: "5",
  costRecalcInterval: "30",
  sessionDataPath: "~/.openclaw/agents/main/sessions/",
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<SettingsState>(defaultSettings);

  const update = (key: keyof SettingsState, value: string | boolean) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <PageHeader
        title="Settings"
        description="ClawPanel configuration"
      />

      <div className="flex-1 overflow-y-auto px-6 py-8">
        <div className="mx-auto max-w-2xl space-y-8">
          {/* Gateway Connection */}
          <SettingsSection icon={Link2} title="Gateway Connection">
            <Field label="Gateway URL" description="WebSocket URL for the OpenClaw gateway">
              <input
                type="text"
                value={settings.gatewayUrl}
                onChange={(e) => update("gatewayUrl", e.target.value)}
                className="settings-input"
                placeholder="ws://127.0.0.1:18789"
              />
            </Field>
            <Field label="Gateway Token" description="Auth token (auto-detected for local connections)">
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
          <SettingsSection icon={DollarSign} title="Budget Limits">
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[13px] font-medium text-foreground">Daily Budget</p>
                  <p className="text-[12px] text-muted">Set a daily spending limit</p>
                </div>
                <ToggleInline
                  enabled={settings.dailyBudgetEnabled}
                  onToggle={() =>
                    update("dailyBudgetEnabled", !settings.dailyBudgetEnabled)
                  }
                />
              </div>
              {settings.dailyBudgetEnabled && (
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-mono text-muted">$</span>
                  <input
                    type="text"
                    value={settings.dailyBudget}
                    onChange={(e) => update("dailyBudget", e.target.value)}
                    className="settings-input w-28"
                    placeholder="10.00"
                  />
                  <span className="text-[12px] text-muted">USD / day</span>
                </div>
              )}

              <div className="h-px bg-card-border/40" />

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[13px] font-medium text-foreground">Monthly Budget</p>
                  <p className="text-[12px] text-muted">Set a monthly spending limit</p>
                </div>
                <ToggleInline
                  enabled={settings.monthlyBudgetEnabled}
                  onToggle={() =>
                    update("monthlyBudgetEnabled", !settings.monthlyBudgetEnabled)
                  }
                />
              </div>
              {settings.monthlyBudgetEnabled && (
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-mono text-muted">$</span>
                  <input
                    type="text"
                    value={settings.monthlyBudget}
                    onChange={(e) => update("monthlyBudget", e.target.value)}
                    className="settings-input w-28"
                    placeholder="150.00"
                  />
                  <span className="text-[12px] text-muted">USD / month</span>
                </div>
              )}
            </div>
          </SettingsSection>

          {/* Notifications */}
          <SettingsSection icon={Bell} title="Notifications">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[13px] font-medium text-foreground">Budget Alerts</p>
                <p className="text-[12px] text-muted">
                  Browser notifications at 80% and 100% of budget limits
                </p>
              </div>
              <ToggleInline
                enabled={settings.notificationsEnabled}
                onToggle={() =>
                  update("notificationsEnabled", !settings.notificationsEnabled)
                }
              />
            </div>
          </SettingsSection>

          {/* Refresh Intervals */}
          <SettingsSection icon={RefreshCw} title="Refresh Intervals">
            <Field label="Activity Feed Poll Rate" description="Seconds between activity feed refreshes">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={settings.activityPollRate}
                  onChange={(e) => update("activityPollRate", e.target.value)}
                  className="settings-input w-20"
                />
                <span className="text-[12px] text-muted">seconds</span>
              </div>
            </Field>
            <Field label="Cost Recalculation" description="Seconds between cost recalculations">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={settings.costRecalcInterval}
                  onChange={(e) =>
                    update("costRecalcInterval", e.target.value)
                  }
                  className="settings-input w-20"
                />
                <span className="text-[12px] text-muted">seconds</span>
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

          {/* Info footer */}
          <div className="rounded-xl bg-foreground/[0.02] p-5" style={{ boxShadow: "0 0 0 1px rgba(0, 0, 0, 0.04)" }}>
            <p className="text-[13px] text-muted leading-relaxed">
              ClawPanel is a monitor, not a config editor. To change OpenClaw
              settings, use{" "}
              <code className="rounded bg-foreground/5 px-1.5 py-0.5 font-mono text-[12px] text-foreground">openclaw config set</code>{" "}
              or message your agent.
            </p>
          </div>
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
  icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="panel-frame overflow-hidden">
      <div className="flex items-center gap-2.5 px-6 py-3.5" style={{ boxShadow: "0 1px 0 rgba(0, 0, 0, 0.04)" }}>
        <Icon size={15} className="text-muted" />
        <h3 className="text-[13px] font-semibold text-foreground">
          {title}
        </h3>
      </div>
      <div className="space-y-5 p-6">{children}</div>
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
    <div className="space-y-2">
      <div>
        <p className="text-[13px] font-medium text-foreground">{label}</p>
        <p className="text-[12px] text-muted">{description}</p>
      </div>
      {children}
    </div>
  );
}

function ToggleInline({
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
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors duration-150 ${
        enabled ? "bg-foreground" : "bg-card-border"
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform duration-150 mt-[2px] ${
          enabled ? "translate-x-5" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}
