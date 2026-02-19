"use client";

import { useGateway } from "@/hooks/use-gateway";
import { GatewayContext } from "@/contexts/gateway-context";
import { HealthBar } from "@/components/health-bar";

export function PageShell({ children }: { children: React.ReactNode }) {
  const gateway = useGateway();

  return (
    <GatewayContext.Provider value={gateway}>
      <div className="flex h-screen flex-col bg-background">
        <HealthBar
          tokenCount={gateway.health.tokenCount}
          agents={gateway.agents}
          gatewayStatus={gateway.connectionStatus}
          activeModel={gateway.activeAgent.model}
          availableModels={gateway.settings.availableModels}
          onSelectModel={(modelId) => gateway.updateSettings({ selectedModel: modelId })}
          channels={gateway.channelHealth}
          agentState={gateway.agentState}
        />
        <div className="flex flex-1 overflow-hidden">
          <div className="flex flex-1 flex-col overflow-hidden">
            {children}
          </div>
        </div>
      </div>
    </GatewayContext.Provider>
  );
}
