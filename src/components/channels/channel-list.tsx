"use client";

import { useState } from "react";
import type { Channel } from "@/types";
import { ChannelCard } from "./channel-card";

type FilterTab = "all" | "connected" | "disabled";

interface ChannelListProps {
  channels: Channel[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onToggle: (id: string) => void;
}

export function ChannelList({
  channels,
  selectedId,
  onSelect,
  onToggle,
}: ChannelListProps) {
  const [filter, setFilter] = useState<FilterTab>("all");

  const filtered = channels.filter((ch) => {
    if (filter === "connected") return ch.enabled && ch.status === "connected";
    if (filter === "disabled") return !ch.enabled;
    return true;
  });

  const tabs: { key: FilterTab; label: string; count: number }[] = [
    { key: "all", label: "All", count: channels.length },
    {
      key: "connected",
      label: "Connected",
      count: channels.filter((ch) => ch.enabled && ch.status === "connected").length,
    },
    {
      key: "disabled",
      label: "Disabled",
      count: channels.filter((ch) => !ch.enabled).length,
    },
  ];

  return (
    <div className="flex flex-col overflow-hidden">
      <div className="flex gap-1 border-b border-card-border px-4 py-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
              filter === tab.key
                ? "bg-foreground text-background"
                : "text-muted hover:bg-card-border hover:text-foreground"
            }`}
          >
            {tab.label}
            <span className="ml-1.5 text-[10px] opacity-70">{tab.count}</span>
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {filtered.map((channel) => (
          <ChannelCard
            key={channel.id}
            channel={channel}
            selected={selectedId === channel.id}
            onSelect={() => onSelect(channel.id)}
            onToggle={() => onToggle(channel.id)}
          />
        ))}
      </div>
    </div>
  );
}
