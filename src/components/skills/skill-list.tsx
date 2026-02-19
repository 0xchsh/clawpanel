"use client";

import { useState } from "react";
import type { SkillFull, SkillType } from "@/types";
import { SkillCard } from "./skill-card";
import { Search } from "lucide-react";

type ActiveFilter = "all" | "active" | "inactive";

interface SkillListProps {
  skills: SkillFull[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onToggle: (id: string) => void;
}

export function SkillList({
  skills,
  selectedId,
  onSelect,
  onToggle,
}: SkillListProps) {
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>("all");
  const [typeFilter, setTypeFilter] = useState<SkillType | "all">("all");
  const [search, setSearch] = useState("");

  const filtered = skills.filter((s) => {
    if (activeFilter === "active" && !s.active) return false;
    if (activeFilter === "inactive" && s.active) return false;
    if (typeFilter !== "all" && s.type !== typeFilter) return false;
    if (search && !s.name.toLowerCase().includes(search.toLowerCase()))
      return false;
    return true;
  });

  const activeTabs: { key: ActiveFilter; label: string }[] = [
    { key: "all", label: "All" },
    { key: "active", label: "Active" },
    { key: "inactive", label: "Inactive" },
  ];

  const typeTabs: { key: SkillType | "all"; label: string }[] = [
    { key: "all", label: "All types" },
    { key: "bundled", label: "Bundled" },
    { key: "managed", label: "Managed" },
    { key: "workspace", label: "Workspace" },
  ];

  return (
    <div className="flex flex-col overflow-hidden">
      <div className="space-y-2 px-4 py-3" style={{ boxShadow: "0 1px 0 rgba(0, 0, 0, 0.04)" }}>
        <div className="flex gap-0.5">
          {activeTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveFilter(tab.key)}
              className={`rounded-full px-3 py-1.5 text-[12px] font-medium transition-colors duration-150 cursor-pointer ${
                activeFilter === tab.key
                  ? "text-foreground"
                  : "text-muted hover:text-foreground"
              }`}
              style={activeFilter === tab.key ? { boxShadow: "0 0 0 1px var(--card-border)" } : undefined}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <div className="flex gap-0.5">
            {typeTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setTypeFilter(tab.key)}
                className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors duration-150 cursor-pointer ${
                  typeFilter === tab.key
                    ? "text-foreground bg-foreground/5"
                    : "text-muted hover:text-foreground"
                }`}
              >
                {tab.label}
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
              placeholder="Search\u2026"
              className="h-8 w-32 rounded-lg bg-foreground/[0.03] pl-7 pr-2 text-[12px] text-foreground placeholder:text-muted/40 outline-none transition-colors duration-150 focus:bg-foreground/[0.05]"
              style={{ boxShadow: "0 0 0 1px rgba(0, 0, 0, 0.06)" }}
            />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-1">
        {filtered.map((skill) => (
          <SkillCard
            key={skill.id}
            skill={skill}
            selected={selectedId === skill.id}
            onSelect={() => onSelect(skill.id)}
            onToggle={() => onToggle(skill.id)}
          />
        ))}
        {filtered.length === 0 && (
          <p className="py-8 text-center text-[13px] text-muted">
            No skills match filters
          </p>
        )}
      </div>
    </div>
  );
}
