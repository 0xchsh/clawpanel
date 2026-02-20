"use client";

import { useState, useMemo } from "react";
import type { Memory, MemorySource } from "@/types";
import { Search } from "lucide-react";
import { MemoryCard } from "./memory-card";

const sourceFilters: { label: string; value: MemorySource | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Conversation", value: "conversation" },
  { label: "Research", value: "research" },
  { label: "Observation", value: "observation" },
  { label: "Reflection", value: "reflection" },
  { label: "Note", value: "user_note" },
];

interface MemoryListProps {
  memories: Memory[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function MemoryList({ memories, selectedId, onSelect }: MemoryListProps) {
  const [search, setSearch] = useState("");
  const [sourceFilter, setSourceFilter] = useState<MemorySource | "all">("all");

  const filtered = useMemo(() => {
    let result = memories;
    if (sourceFilter !== "all") {
      result = result.filter((m) => m.source === sourceFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (m) =>
          m.title.toLowerCase().includes(q) ||
          m.content.toLowerCase().includes(q) ||
          m.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    return result.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }, [memories, search, sourceFilter]);

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 space-y-2 border-b border-card-border">
        <div className="relative">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
          />
          <input
            type="text"
            placeholder="Search memories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="settings-input pl-8"
          />
        </div>
        <div className="flex flex-wrap gap-1">
          {sourceFilters.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => setSourceFilter(value)}
              className={`rounded-full px-2 py-0.5 text-[11px] font-medium transition-colors ${
                sourceFilter === value
                  ? "bg-foreground text-background"
                  : "text-muted hover:text-foreground"
              }`}
              style={
                sourceFilter !== value
                  ? { background: "var(--pill-bg)", boxShadow: "0 0 0 1px var(--shadow-border)" }
                  : undefined
              }
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto divide-y divide-card-border">
        {filtered.map((memory) => (
          <MemoryCard
            key={memory.id}
            memory={memory}
            selected={memory.id === selectedId}
            onSelect={onSelect}
          />
        ))}
        {filtered.length === 0 && (
          <div className="py-12 text-center text-[13px] text-muted">
            No memories found.
          </div>
        )}
      </div>
    </div>
  );
}
