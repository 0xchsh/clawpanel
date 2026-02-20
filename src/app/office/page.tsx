"use client";

import { useGatewayContext } from "@/contexts/gateway-context";
import { PageHeader } from "@/components/page-header";
import { OfficeFloor } from "@/components/office/office-floor";

export default function OfficePage() {
  const { agentDesks } = useGatewayContext();

  const working = agentDesks.filter(
    (d) => d.status === "working" || d.status === "thinking"
  ).length;

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <PageHeader
        title="Office"
        description={`${agentDesks.length} agents, ${working} active`}
      />
      <div className="flex-1 overflow-y-auto p-4">
        <div className="mx-auto max-w-5xl">
          <OfficeFloor desks={agentDesks} />
        </div>
      </div>
    </div>
  );
}
