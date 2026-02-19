"use client";

import { MessageSquare, Hash, Globe, Send, Shield, Smartphone, Monitor, MessageCircle } from "lucide-react";
import type { Channel, ChannelProvider } from "@/types";
import { StatusBadge } from "@/components/status-badge";
import { ToggleSwitch } from "@/components/toggle-switch";
import { formatRelativeTime } from "@/lib/format";

const providerIcons: Record<ChannelProvider, React.ReactNode> = {
  whatsapp: <MessageCircle size={16} />,
  telegram: <Send size={16} />,
  discord: <Hash size={16} />,
  slack: <Hash size={16} />,
  signal: <Shield size={16} />,
  imessage: <MessageSquare size={16} />,
  teams: <Monitor size={16} />,
  matrix: <Globe size={16} />,
  "google-chat": <MessageSquare size={16} />,
  mattermost: <MessageSquare size={16} />,
  webchat: <Smartphone size={16} />,
};

const providerLabels: Record<ChannelProvider, string> = {
  whatsapp: "WhatsApp",
  telegram: "Telegram",
  discord: "Discord",
  slack: "Slack",
  signal: "Signal",
  imessage: "iMessage",
  teams: "Teams",
  matrix: "Matrix",
  "google-chat": "Google Chat",
  mattermost: "Mattermost",
  webchat: "WebChat",
};

const dmPolicyLabels: Record<string, string> = {
  allow: "DMs open",
  deny: "DMs blocked",
  allowlist: "DMs allowlist",
};

interface ChannelCardProps {
  channel: Channel;
  selected: boolean;
  onSelect: () => void;
  onToggle: () => void;
}

export function ChannelCard({
  channel,
  selected,
  onSelect,
  onToggle,
}: ChannelCardProps) {
  return (
    <div
      onClick={onSelect}
      className={`flex items-center gap-3 rounded-2xl border p-3 transition-colors cursor-pointer ${
        selected
          ? "border-foreground/20 bg-background"
          : "border-card-border bg-card hover:bg-background"
      }`}
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-card-border text-muted">
        {providerIcons[channel.provider]}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-sm font-medium">{channel.name}</span>
          {channel.unreadCount > 0 && (
            <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-accent-red px-1 text-[10px] font-medium text-white">
              {channel.unreadCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <StatusBadge status={channel.status} />
          <span className="text-[10px] text-muted">
            {dmPolicyLabels[channel.dmPolicy]}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
        {channel.lastActivity && (
          <span className="text-[10px] text-muted" suppressHydrationWarning>
            {formatRelativeTime(channel.lastActivity)}
          </span>
        )}
        <ToggleSwitch enabled={channel.enabled} onToggle={onToggle} size="sm" />
      </div>
    </div>
  );
}

export { providerLabels, dmPolicyLabels };
