"use client";

import type { SkillFull } from "@/types";
import { typeLabels } from "./skill-card";
import { Check, X } from "lucide-react";
import { formatRelativeTime } from "@/lib/format";

interface SkillDetailProps {
  skill: SkillFull;
}

export function SkillDetail({ skill }: SkillDetailProps) {
  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-foreground">{skill.name}</h2>
          <p className="mt-1 text-[13px] text-muted">{skill.description}</p>
        </div>

        <div className="flex flex-wrap gap-4 text-[12px] text-muted">
          <span>
            Type:{" "}
            <span className="text-foreground">{typeLabels[skill.type]}</span>
          </span>
          <span>
            Version:{" "}
            <span className="font-mono text-foreground">v{skill.version}</span>
          </span>
          {skill.author && (
            <span>
              Author:{" "}
              <span className="text-foreground">{skill.author}</span>
            </span>
          )}
          <span suppressHydrationWarning>
            Updated:{" "}
            <span className="text-foreground">
              {formatRelativeTime(skill.updatedAt)}
            </span>
          </span>
        </div>

        {skill.dependencies.length > 0 && (
          <Section title="Dependencies">
            <div className="space-y-2">
              {skill.dependencies.map((dep) => (
                <div
                  key={dep.name}
                  className="flex items-center gap-2"
                >
                  {dep.met ? (
                    <Check size={14} className="text-accent-green" />
                  ) : (
                    <X size={14} className="text-accent-red" />
                  )}
                  <span className="font-mono text-[13px]">{dep.name}</span>
                  {dep.version && (
                    <span className="text-[11px] text-muted">
                      {dep.version}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </Section>
        )}

        {skill.documentation && (
          <Section title="Documentation">
            <pre className="whitespace-pre-wrap font-mono text-[13px] leading-relaxed text-muted">
              {skill.documentation}
            </pre>
          </Section>
        )}

        <div className="rounded-xl bg-foreground/[0.02] p-4" style={{ boxShadow: "0 0 0 1px rgba(0, 0, 0, 0.04)" }}>
          <p className="text-[13px] text-muted leading-relaxed">
            To install a skill, message your agent:{" "}
            <code className="rounded bg-foreground/5 px-1.5 py-0.5 font-mono text-[12px] text-foreground">&quot;install the {skill.name} skill from ClawHub&quot;</code>
          </p>
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
    <div className="panel-frame p-5">
      <h3 className="mb-3 text-[12px] font-medium text-muted">
        {title}
      </h3>
      {children}
    </div>
  );
}
