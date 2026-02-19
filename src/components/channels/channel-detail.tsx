"use client";

import type { Channel } from "@/types";
import { StatusBadge } from "@/components/status-badge";
import { providerLabels, dmPolicyLabels } from "./channel-card";
import { formatRelativeTime } from "@/lib/format";

interface ChannelDetailProps {
  channel: Channel;
}

export function ChannelDetail({ channel }: ChannelDetailProps) {
  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold">{channel.name}</h2>
          <p className="text-sm text-muted">
            {providerLabels[channel.provider]} channel
          </p>
        </div>

        <div className="space-y-4">
          <Section title="Status">
            <div className="flex items-center gap-3">
              <StatusBadge status={channel.status} />
              {channel.lastActivity && (
                <span className="text-xs text-muted" suppressHydrationWarning>
                  Last activity {formatRelativeTime(channel.lastActivity)}
                </span>
              )}
            </div>
          </Section>

          <Section title="DM Policy">
            <span className="text-sm">{dmPolicyLabels[channel.dmPolicy]}</span>
            {channel.dmPolicy === "allowlist" && channel.allowlist.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {channel.allowlist.map((item, i) => (
                  <span
                    key={i}
                    className="rounded-full bg-card-border px-2.5 py-0.5 text-xs"
                  >
                    {item}
                  </span>
                ))}
              </div>
            )}
          </Section>

          <Section title="Groups">
            <span className="text-sm">
              {channel.groupEnabled ? "Enabled" : "Disabled"}
            </span>
            {channel.groupEnabled && channel.groupAllowlist.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {channel.groupAllowlist.map((group, i) => (
                  <span
                    key={i}
                    className="rounded-full bg-card-border px-2.5 py-0.5 text-xs"
                  >
                    {group}
                  </span>
                ))}
              </div>
            )}
          </Section>

          <Section title="Unread Messages">
            <span className="text-sm font-mono">{channel.unreadCount}</span>
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
      <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted mb-2">
        {title}
      </h3>
      {children}
    </div>
  );
}
