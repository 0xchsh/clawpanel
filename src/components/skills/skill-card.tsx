"use client";

import type { SkillFull, SkillType } from "@/types";
import { ToggleSwitch } from "@/components/toggle-switch";
import { formatRelativeTime } from "@/lib/format";

const typeColors: Record<SkillType, string> = {
  bundled: "bg-accent-green/10 text-accent-green",
  managed: "bg-foreground/5 text-foreground",
  workspace: "bg-teal/10 text-teal-light",
};

const typeLabels: Record<SkillType, string> = {
  bundled: "Bundled",
  managed: "Managed",
  workspace: "Workspace",
};

interface SkillCardProps {
  skill: SkillFull;
  selected: boolean;
  onSelect: () => void;
  onToggle: () => void;
}

export function SkillCard({
  skill,
  selected,
  onSelect,
  onToggle,
}: SkillCardProps) {
  const unmetDeps = skill.dependencies.filter((d) => !d.met).length;

  return (
    <div
      onClick={onSelect}
      className={`flex items-start gap-3 rounded-xl p-4 transition-colors duration-150 cursor-pointer ${
        selected
          ? "bg-foreground/[0.03]"
          : "hover:bg-card-hover/50"
      }`}
      style={{ boxShadow: selected ? "0 0 0 1px rgba(0, 0, 0, 0.08)" : "0 0 0 1px rgba(0, 0, 0, 0.04)" }}
    >
      <span
        className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
          skill.active ? "bg-accent-green" : "bg-muted/30"
        }`}
      />

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-[13px] font-medium text-foreground">{skill.name}</span>
          <span
            className={`shrink-0 rounded-md px-2 py-0.5 text-[10px] font-medium ${typeColors[skill.type]}`}
          >
            {typeLabels[skill.type]}
          </span>
          <span className="shrink-0 font-mono text-[10px] text-muted">
            v{skill.version}
          </span>
        </div>
        <p className="mt-0.5 truncate text-[12px] text-muted">{skill.description}</p>
        <div className="mt-1.5 flex items-center gap-3">
          {unmetDeps > 0 && (
            <span className="text-[11px] text-accent-red">
              {unmetDeps} unmet dep{unmetDeps > 1 ? "s" : ""}
            </span>
          )}
          <span className="text-[10px] text-muted/40" suppressHydrationWarning>
            Updated {formatRelativeTime(skill.updatedAt)}
          </span>
        </div>
      </div>

      <div onClick={(e) => e.stopPropagation()}>
        <ToggleSwitch enabled={skill.active} onToggle={onToggle} size="sm" />
      </div>
    </div>
  );
}

export { typeLabels };
