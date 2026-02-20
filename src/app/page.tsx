"use client";

import { useGatewayContext } from "@/contexts/gateway-context";
import { AgentHeader } from "@/components/agent-header";
import { CostHero, CostBreakdown, CostTrend } from "@/components/cost-tracker";
import { ActivityFeed } from "@/components/activity-feed";
import { SessionSummary } from "@/components/session-summary";
import { ActivityHeatmap } from "@/components/activity-heatmap";

export default function Dashboard() {
  const {
    connectionStatus,
    activeAgent,
    agents,
    selectAgent,
    activityEvents,
    costSnapshot,
    sessions,
    heatmap,
  } = useGatewayContext();

  return (
    <div className="flex flex-1 flex-col overflow-y-auto">
      <AgentHeader
        activeAgent={activeAgent}
        agents={agents}
        onSelectAgent={selectAgent}
        connectionStatus={connectionStatus}
      />

      <div className="flex-1 px-6 pt-6 pb-10">
        <div className="mx-auto max-w-5xl flex flex-col gap-6">
          {/* Cost: 2 cards side by side */}
          <div className="animate-fade-up" style={{ animationDelay: "0ms" }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <CostHero cost={costSnapshot} />
              <CostBreakdown cost={costSnapshot} />
            </div>
          </div>

          {/* 7-day trend: full width */}
          <div className="animate-fade-up" style={{ animationDelay: "80ms" }}>
            <CostTrend cost={costSnapshot} />
          </div>

          {/* Activity heatmap */}
          <div className="animate-fade-up" style={{ animationDelay: "160ms" }}>
            <ActivityHeatmap
              cells={heatmap.cells}
              maxMessages={heatmap.maxMessages}
              days={heatmap.days}
              currentStreak={heatmap.currentStreak}
              longestStreak={heatmap.longestStreak}
            />
          </div>

          {/* Activity feed + sessions */}
          <div className="animate-fade-up" style={{ animationDelay: "240ms" }}>
            <ActivityFeed events={activityEvents} />
          </div>
          <div className="animate-fade-up" style={{ animationDelay: "300ms" }}>
            <SessionSummary sessions={sessions} />
          </div>
        </div>
      </div>
    </div>
  );
}
