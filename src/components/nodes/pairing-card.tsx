"use client";

import { Monitor, Smartphone, Server, Check, X } from "lucide-react";
import type { Node, NodePlatform } from "@/types";
import { formatRelativeTime } from "@/lib/format";

const platformIcons: Record<NodePlatform, typeof Monitor> = {
  macos: Monitor,
  ios: Smartphone,
  android: Smartphone,
  linux: Server,
};

interface PairingCardProps {
  node: Node;
  onApprove: () => void;
  onReject: () => void;
}

export function PairingCard({ node, onApprove, onReject }: PairingCardProps) {
  const Icon = platformIcons[node.platform];

  return (
    <div className="rounded-2xl border-2 border-accent-yellow/30 bg-accent-yellow/5 p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-yellow/10 text-accent-yellow">
          <Icon size={20} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate text-sm font-medium">{node.name}</span>
            <span className="rounded-full bg-accent-yellow/10 px-2 py-0.5 text-[10px] font-medium text-accent-yellow">
              Pending Approval
            </span>
          </div>
          <p className="mt-0.5 text-xs text-muted">{node.os}</p>
          {node.capabilities.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
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
          {node.lastSeen && (
            <p className="mt-2 text-[10px] text-muted" suppressHydrationWarning>
              Requested {formatRelativeTime(node.lastSeen)}
            </p>
          )}
        </div>
      </div>

      <div className="mt-3 flex gap-2">
        <button
          onClick={onApprove}
          className="flex items-center gap-1.5 rounded-xl bg-accent-green px-3 py-1.5 text-xs font-medium text-white transition-opacity hover:opacity-90 cursor-pointer"
        >
          <Check size={12} />
          Approve
        </button>
        <button
          onClick={onReject}
          className="flex items-center gap-1.5 rounded-xl bg-card-border px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:bg-accent-red hover:text-white cursor-pointer"
        >
          <X size={12} />
          Reject
        </button>
      </div>
    </div>
  );
}
