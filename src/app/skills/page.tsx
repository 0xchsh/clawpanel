"use client";

import { useState } from "react";
import { useGatewayContext } from "@/contexts/gateway-context";
import { PageHeader } from "@/components/page-header";
import { SkillList } from "@/components/skills/skill-list";
import { SkillDetail } from "@/components/skills/skill-detail";
import { Puzzle } from "lucide-react";
import { EmptyState } from "@/components/empty-state";

export default function SkillsPage() {
  const { skillsFull, toggleSkillFull } = useGatewayContext();
  const [selectedId, setSelectedId] = useState<string | null>(
    skillsFull[0]?.id ?? null
  );

  const selectedSkill = skillsFull.find((s) => s.id === selectedId);

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <PageHeader
        title="Skills"
        description={`${skillsFull.filter((s) => s.active).length} active, ${skillsFull.filter((s) => !s.active).length} inactive`}
      />
      <div className="flex flex-1 overflow-hidden">
        <div className="w-[60%] border-r border-card-border overflow-hidden">
          <SkillList
            skills={skillsFull}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onToggle={toggleSkillFull}
          />
        </div>
        <div className="w-[40%] overflow-hidden">
          {selectedSkill ? (
            <SkillDetail skill={selectedSkill} />
          ) : (
            <EmptyState
              icon={Puzzle}
              title="No skill selected"
              description="Select a skill from the list to view its details and dependencies."
            />
          )}
        </div>
      </div>
    </div>
  );
}
