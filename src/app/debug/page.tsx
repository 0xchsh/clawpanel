"use client";

import { useState } from "react";
import { useGatewayContext } from "@/contexts/gateway-context";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { formatUptime, formatRelativeTime } from "@/lib/format";
import { Shield, AlertTriangle, Info, Play } from "lucide-react";

export default function DebugPage() {
  const { debugSnapshot, debugEvents } = useGatewayContext();
  const [rpcMethod, setRpcMethod] = useState("");
  const [rpcParams, setRpcParams] = useState("{}");
  const [rpcResult, setRpcResult] = useState<string | null>(null);

  const handleRpcExecute = () => {
    // Mock RPC execution
    setRpcResult(
      JSON.stringify(
        {
          ok: true,
          method: rpcMethod,
          result: `Mock response for ${rpcMethod}`,
          timestamp: new Date().toISOString(),
        },
        null,
        2
      )
    );
  };

  const issueIcons: Record<string, typeof Shield> = {
    critical: Shield,
    warning: AlertTriangle,
    info: Info,
  };

  const issueColors: Record<string, string> = {
    critical: "text-accent-red bg-accent-red/10",
    warning: "text-accent-yellow bg-accent-yellow/10",
    info: "text-muted bg-card-border",
  };

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <PageHeader title="Debug" description="Gateway diagnostics" />

      <div className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-3xl space-y-6">
          {/* Snapshot */}
          <Section title="Gateway Snapshot">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">
                  Status
                </p>
                <div className="mt-1">
                  <StatusBadge
                    status={
                      debugSnapshot.status === "healthy"
                        ? "connected"
                        : "degraded"
                    }
                    label={debugSnapshot.status}
                  />
                </div>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">
                  Uptime
                </p>
                <p className="mt-1 text-sm">
                  {formatUptime(debugSnapshot.uptime)}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">
                  Instances
                </p>
                <p className="mt-1 text-sm font-mono">
                  {debugSnapshot.instanceCount}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">
                  Sessions
                </p>
                <p className="mt-1 text-sm font-mono">
                  {debugSnapshot.sessionCount}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">
                  Cron
                </p>
                <p className="mt-1 text-sm">
                  {debugSnapshot.cronEnabled ? "Enabled" : "Disabled"}
                </p>
              </div>
              {debugSnapshot.cronNextWake && (
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">
                    Next Wake
                  </p>
                  <p
                    className="mt-1 text-sm"
                    suppressHydrationWarning
                  >
                    {formatRelativeTime(debugSnapshot.cronNextWake)}
                  </p>
                </div>
              )}
            </div>
          </Section>

          {/* Security Audit */}
          {debugSnapshot.securityIssues.length > 0 && (
            <Section title="Security Audit">
              <div className="space-y-2">
                {debugSnapshot.securityIssues.map((issue, i) => {
                  const Icon = issueIcons[issue.level] || Info;
                  return (
                    <div
                      key={i}
                      className={`flex items-start gap-2 rounded-xl p-3 ${issueColors[issue.level]}`}
                    >
                      <Icon size={14} className="mt-0.5 shrink-0" />
                      <span className="text-xs">{issue.message}</span>
                    </div>
                  );
                })}
              </div>
            </Section>
          )}

          {/* Manual RPC */}
          <Section title="Manual RPC">
            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={rpcMethod}
                  onChange={(e) => setRpcMethod(e.target.value)}
                  placeholder="Method name (e.g. health.read)"
                  className="flex-1 rounded-lg border border-card-border bg-input-bg px-3 py-1.5 font-mono text-xs text-foreground placeholder:text-muted outline-none"
                />
                <button
                  onClick={handleRpcExecute}
                  disabled={!rpcMethod.trim()}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                    rpcMethod.trim()
                      ? "bg-foreground text-background hover:opacity-90 cursor-pointer"
                      : "bg-card-border text-muted cursor-not-allowed"
                  }`}
                >
                  <Play size={12} />
                  Execute
                </button>
              </div>
              <textarea
                value={rpcParams}
                onChange={(e) => setRpcParams(e.target.value)}
                placeholder="JSON params"
                rows={3}
                className="w-full rounded-lg border border-card-border bg-input-bg px-3 py-2 font-mono text-xs text-foreground placeholder:text-muted outline-none resize-none"
              />
              {rpcResult && (
                <pre className="rounded-lg bg-background p-3 font-mono text-[11px] leading-relaxed overflow-x-auto max-h-48 overflow-y-auto">
                  {rpcResult}
                </pre>
              )}
            </div>
          </Section>

          {/* Event Log */}
          <Section title="Recent Events">
            <div className="space-y-2">
              {debugEvents.map((evt) => (
                <div
                  key={evt.id}
                  className="rounded-xl border border-card-border bg-background p-3"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="rounded-full bg-card-border px-2 py-0.5 text-[10px] font-medium text-foreground">
                      {evt.type}
                    </span>
                    <span
                      className="text-[10px] text-muted"
                      suppressHydrationWarning
                    >
                      {formatRelativeTime(evt.timestamp)}
                    </span>
                  </div>
                  <pre className="font-mono text-[10px] text-muted overflow-x-auto">
                    {evt.payload}
                  </pre>
                </div>
              ))}
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-card-border bg-card p-4">
      <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted mb-4">
        {title}
      </h3>
      {children}
    </div>
  );
}
