"use client";

import { useState } from "react";
import { useGatewayContext } from "@/contexts/gateway-context";
import {
  ShootingStar,
  Package,
  Folder,
  Wrench,
  CaretDown,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

function Toggle({
  enabled,
  onToggle,
}: {
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      onClick={onToggle}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors duration-150",
        enabled ? "bg-foreground" : "bg-card-border"
      )}
    >
      <span
        className={cn(
          "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform duration-150 mt-[2px]",
          enabled ? "translate-x-5" : "translate-x-0.5"
        )}
      />
    </button>
  );
}

const typeIcon: Record<string, typeof Package> = {
  bundled: Package,
  managed: ShootingStar,
  workspace: Folder,
};

function timeAgo(date: Date): string {
  const now = Date.now();
  const diff = now - new Date(date).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

export default function SkillsPage() {
  const { skillsFull, toggleSkillFull } = useGatewayContext();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const activeCount = skillsFull.filter((s) => s.active).length;
  const inactiveCount = skillsFull.filter((s) => !s.active).length;

  return (
    <div className="flex flex-col px-4 py-8 lg:px-0 lg:py-0">
      {/* Page title */}
      <div className="flex items-center justify-between h-9">
        <h1 className="text-xl font-semibold text-foreground">Skills</h1>
        <span className="text-base font-semibold text-muted">
          {activeCount} active, {inactiveCount} inactive
        </span>
      </div>

      <div className="flex flex-col gap-2 mt-8">
        {skillsFull.length === 0 && (
          <div className="bg-background rounded-lg p-8 text-center">
            <ShootingStar
              size={32}
              weight="regular"
              className="text-muted mx-auto mb-3"
            />
            <p className="text-sm font-semibold text-foreground">
              No skills installed
            </p>
            <p className="text-xs text-muted mt-1">
              Skills extend your agent&apos;s capabilities.
            </p>
          </div>
        )}

        {skillsFull.map((skill) => {
          const expanded = expandedId === skill.id;
          const TypeIcon = typeIcon[skill.type] || Wrench;

          return (
            <div key={skill.id} className="bg-background rounded-lg">
              {/* Skill row */}
              <div className="flex items-center gap-3 px-4 py-3">
                <TypeIcon
                  size={18}
                  weight="regular"
                  className="text-muted shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-foreground truncate">
                      {skill.name}
                    </span>
                    <span className="text-[10px] font-semibold text-muted rounded-md bg-card px-1.5 py-0.5 shrink-0">
                      {skill.type}
                    </span>
                    <span className="text-[10px] text-muted shrink-0">
                      v{skill.version}
                    </span>
                  </div>
                  <p className="text-xs text-muted truncate mt-0.5">
                    {skill.description}
                  </p>
                </div>

                <button
                  type="button"
                  aria-label={expanded ? "Collapse details" : "Expand details"}
                  onClick={() => setExpandedId(expanded ? null : skill.id)}
                  className="p-1 rounded-md text-muted hover:text-foreground transition-colors duration-150 cursor-pointer shrink-0"
                >
                  <CaretDown
                    size={14}
                    weight="bold"
                    className={cn(
                      "transition-transform duration-200",
                      expanded && "rotate-180"
                    )}
                    style={{ transitionTimingFunction: "var(--ease-out)" }}
                  />
                </button>

                <Toggle
                  enabled={skill.active}
                  onToggle={() => toggleSkillFull(skill.id)}
                />
              </div>

              {/* Expanded detail */}
              {expanded && (
                <div className="px-4 pb-4 pt-1 border-t border-card-border/50">
                  <div className="flex flex-col gap-2 mt-3">
                    {skill.author && (
                      <Row label="Author">
                        <span className="text-sm text-foreground">
                          {skill.author}
                        </span>
                      </Row>
                    )}
                    <Row label="Updated">
                      <span className="text-sm text-foreground">
                        {timeAgo(skill.updatedAt)}
                      </span>
                    </Row>
                    {skill.dependencies.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs font-semibold text-muted mb-1.5">
                          Dependencies
                        </p>
                        <div className="flex flex-col gap-1">
                          {skill.dependencies.map((dep) => (
                            <div
                              key={dep.name}
                              className="flex items-center gap-2"
                            >
                              <span
                                className={cn(
                                  "h-1.5 w-1.5 rounded-full shrink-0",
                                  dep.met
                                    ? "bg-accent-green"
                                    : "bg-accent-red"
                                )}
                              />
                              <span className="font-mono text-xs text-muted">
                                {dep.name}
                                {dep.version && ` (${dep.version})`}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {skill.documentation && (
                      <div className="mt-2">
                        <p className="text-xs font-semibold text-muted mb-1.5">
                          Documentation
                        </p>
                        <p className="text-xs text-muted leading-relaxed">
                          {skill.documentation}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-muted">{label}</span>
      {children}
    </div>
  );
}
