"use client";

import { Monitor, Smartphone, Server } from "lucide-react";
import type { Node, NodePlatform } from "@/types";
import { StatusBadge } from "@/components/status-badge";
import { formatRelativeTime } from "@/lib/format";

const platformIcons: Record<NodePlatform, typeof Monitor> = {
  macos: Monitor,
  ios: Smartphone,
  android: Smartphone,
  linux: Server,
};

interface NodeCardProps {
  node: Node;
}

export function NodeCard({ node }: NodeCardProps) {
  const Icon = platformIcons[node.platform];

  return (
    <div className="rounded-2xl border border-card-border bg-card p-4 transition-colors hover:bg-background">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-card-border text-muted">
          <Icon size={20} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate text-sm font-medium">{node.name}</span>
            <StatusBadge status={node.status} />
          </div>
          <p className="mt-0.5 text-xs text-muted">{node.os}</p>
        </div>
      </div>

      {node.capabilities.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {node.capabilities.map((cap) => (
            <span
              key={cap}
              className="rounded-full bg-card-border px-2 py-0.5 text-[10px] text-muted"
            >
              {cap}
            </span>
          ))}
        </div>
      )}

      <div className="mt-3 flex items-center gap-3 text-[10px] text-muted">
        {node.lastSeen && (
          <span suppressHydrationWarning>
            Last seen {formatRelativeTime(node.lastSeen)}
          </span>
        )}
        {node.ipAddress && <span className="font-mono">{node.ipAddress}</span>}
      </div>
    </div>
  );
}
