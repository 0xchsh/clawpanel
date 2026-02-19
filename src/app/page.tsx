"use client";

import { useGatewayContext } from "@/contexts/gateway-context";
import { AgentHeader } from "@/components/agent-header";
import { CostHero, CostBreakdown, CostTrend } from "@/components/cost-tracker";
import { ActivityFeed } from "@/components/activity-feed";
import { SessionSummary } from "@/components/session-summary";

export default function Dashboard() {
  const {
    connectionStatus,
    activeAgent,
    agents,
    selectAgent,
    activityEvents,
    costSnapshot,
    sessions,
  } = useGatewayContext();

  return (
    <div className="flex flex-1 flex-col overflow-y-auto">
      <AgentHeader
        activeAgent={activeAgent}
        agents={agents}
        onSelectAgent={selectAgent}
        connectionStatus={connectionStatus}
      />

      <div className="flex-1 px-6 pb-10">
        <div className="mx-auto max-w-5xl space-y-6">
          {/* Cost: 2 cards side by side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <CostHero cost={costSnapshot} />
            <CostBreakdown cost={costSnapshot} />
          </div>

          {/* 7-day trend: full width */}
          <CostTrend cost={costSnapshot} />

          {/* Activity feed + sessions */}
          <ActivityFeed events={activityEvents} />
          <SessionSummary sessions={sessions} />
        </div>
      </div>
    </div>
  );
}
