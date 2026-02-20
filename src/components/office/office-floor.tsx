"use client";

import type { AgentDesk } from "@/types";
import { AgentWorkstation } from "./agent-workstation";

interface OfficeFloorProps {
  desks: AgentDesk[];
}

export function OfficeFloor({ desks }: OfficeFloorProps) {
  return (
    <div
      className="office-floor rounded-xl p-6"
      style={{
        perspective: "1200px",
      }}
    >
      <div
        className="grid grid-cols-1 sm:grid-cols-2 gap-4"
        style={{
          transform: "rotateX(2deg)",
          transformOrigin: "center center",
        }}
      >
        {desks
          .sort((a, b) => a.position.row * 10 + a.position.col - (b.position.row * 10 + b.position.col))
          .map((desk) => (
            <AgentWorkstation key={desk.id} desk={desk} />
          ))}
      </div>
    </div>
  );
}
