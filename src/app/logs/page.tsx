"use client";

import { useState } from "react";
import { useGatewayContext } from "@/contexts/gateway-context";
import { PageHeader } from "@/components/page-header";
import { formatRelativeTime } from "@/lib/format";
import { Search } from "lucide-react";
import type { LogLevel } from "@/types";

const levelColors: Record<LogLevel, string> = {
  trace: "text-muted",
  debug: "text-muted",
  info: "text-accent-green",
  warn: "text-accent-yellow",
  error: "text-accent-red",
  fatal: "text-accent-red font-bold",
};

const allLevels: LogLevel[] = ["trace", "debug", "info", "warn", "error", "fatal"];

export default function LogsPage() {
  const { logEntries } = useGatewayContext();
  const [enabledLevels, setEnabledLevels] = useState<Set<LogLevel>>(
    new Set(["info", "warn", "error", "fatal"])
  );
  const [search, setSearch] = useState("");

  const toggleLevel = (level: LogLevel) => {
    setEnabledLevels((prev) => {
      const next = new Set(prev);
      if (next.has(level)) next.delete(level);
      else next.add(level);
      return next;
    });
  };

  const filtered = logEntries.filter((entry) => {
    if (!enabledLevels.has(entry.level)) return false;
    if (
      search &&
      !entry.message.toLowerCase().includes(search.toLowerCase()) &&
      !entry.subsystem.toLowerCase().includes(search.toLowerCase())
    )
      return false;
    return true;
  });

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <PageHeader
        title="Logs"
        description={`${logEntries.length} entries`}
      />

      <div className="flex items-center gap-3 border-b border-card-border px-6 py-2">
        <div className="flex gap-1">
          {allLevels.map((level) => (
            <button
              key={level}
              onClick={() => toggleLevel(level)}
              className={`rounded-md px-2.5 py-1 text-[10px] font-medium uppercase transition-colors cursor-pointer ${
                enabledLevels.has(level)
                  ? `${levelColors[level]} bg-card-border`
                  : "text-muted/40 hover:text-muted"
              }`}
            >
              {level}
            </button>
          ))}
        </div>
        <div className="relative ml-auto">
          <Search
            size={12}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter logs..."
            className="h-7 w-48 rounded-lg border border-card-border bg-input-bg pl-7 pr-3 text-xs text-foreground placeholder:text-muted outline-none"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 font-mono">
        <div className="space-y-0.5">
          {filtered.map((entry) => (
            <div
              key={entry.id}
              className="flex items-start gap-3 rounded-lg px-3 py-1.5 text-[11px] hover:bg-card transition-colors"
            >
              <span
                className="shrink-0 w-16 text-[10px] text-muted text-right"
                suppressHydrationWarning
              >
                {formatRelativeTime(entry.timestamp)}
              </span>
              <span
                className={`shrink-0 w-10 uppercase ${levelColors[entry.level]}`}
              >
                {entry.level}
              </span>
              <span className="shrink-0 w-20 text-muted truncate">
                {entry.subsystem}
              </span>
              <span className="text-foreground">{entry.message}</span>
            </div>
          ))}
          {filtered.length === 0 && (
            <p className="py-12 text-center text-xs text-muted">
              No log entries match the current filters
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
