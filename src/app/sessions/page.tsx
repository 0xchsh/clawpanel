"use client";

import { useState } from "react";
import { useGatewayContext } from "@/contexts/gateway-context";
import { PageHeader } from "@/components/page-header";
import { formatRelativeTime, formatTokenCount } from "@/lib/format";
import type { SessionKind } from "@/types";

const kindBadgeColor: Record<SessionKind, string> = {
  chat: "bg-foreground/5 text-foreground",
  cron: "bg-foreground/5 text-foreground",
  api: "bg-accent-green/10 text-accent-green",
  system: "bg-foreground/5 text-muted",
};

export default function SessionsPage() {
  const { sessions } = useGatewayContext();
  const [filter, setFilter] = useState<SessionKind | "all">("all");

  const filtered =
    filter === "all" ? sessions : sessions.filter((s) => s.kind === filter);

  const sorted = filtered
    .slice()
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );

  const filterTabs: { key: SessionKind | "all"; label: string }[] = [
    { key: "all", label: "All" },
    { key: "chat", label: "Chat" },
    { key: "cron", label: "Cron" },
    { key: "api", label: "API" },
    { key: "system", label: "System" },
  ];

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <PageHeader
        title="Sessions"
        description={`${sessions.length} total sessions`}
      />

      <div className="flex gap-1 px-6 py-3" style={{ boxShadow: "0 1px 0 rgba(0, 0, 0, 0.04)" }}>
        {filterTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-colors duration-150 cursor-pointer ${
              filter === tab.key
                ? "text-foreground"
                : "text-muted hover:text-foreground"
            }`}
            style={filter === tab.key ? { boxShadow: "0 0 0 1px var(--card-border)" } : undefined}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left text-[11px] font-medium text-muted" style={{ boxShadow: "0 1px 0 rgba(0, 0, 0, 0.04)" }}>
              <th className="px-6 py-3 font-medium">Key</th>
              <th className="px-3 py-3 font-medium">Label</th>
              <th className="px-3 py-3 font-medium">Kind</th>
              <th className="px-3 py-3 font-medium">Tokens</th>
              <th className="px-3 py-3 font-medium">Updated</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((session) => (
              <tr
                key={session.id}
                className="transition-colors duration-150 hover:bg-card-hover/30"
                style={{ boxShadow: "0 1px 0 rgba(0, 0, 0, 0.03)" }}
              >
                <td className="px-6 py-3 font-mono text-[13px] text-foreground">
                  {session.key}
                </td>
                <td className="px-3 py-3 text-[13px]">{session.label}</td>
                <td className="px-3 py-3">
                  <span
                    className={`rounded-md px-2 py-0.5 text-[11px] font-medium ${kindBadgeColor[session.kind]}`}
                  >
                    {session.kind}
                  </span>
                </td>
                <td className="px-3 py-3 font-mono text-[13px] text-muted" style={{ fontVariantNumeric: "tabular-nums" }}>
                  {formatTokenCount(session.tokens)}
                </td>
                <td
                  className="px-3 py-3 text-[11px] text-muted/50"
                  suppressHydrationWarning
                >
                  {formatRelativeTime(session.updatedAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {sorted.length === 0 && (
          <p className="py-12 text-center text-[13px] text-muted">
            No sessions match the filter
          </p>
        )}
      </div>
    </div>
  );
}
