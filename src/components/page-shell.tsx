"use client";

import { useGateway } from "@/hooks/use-gateway";
import { GatewayContext } from "@/contexts/gateway-context";
import { HealthBar } from "@/components/health-bar";
import { SideNav } from "@/components/icon-rail";
import { StatusSidebar } from "@/components/status-sidebar";
import { useKeyboardShortcuts } from "@/components/keyboard-shortcuts";
import { ErrorBoundary } from "@/components/error-boundary";
import { OfflineIndicator } from "@/components/offline-indicator";

export function PageShell({ children }: { children: React.ReactNode }) {
  const gateway = useGateway();
  const { helpOpen, setHelpOpen, ShortcutsOverlay } = useKeyboardShortcuts();

  return (
    <GatewayContext.Provider value={gateway}>
      <div className="flex h-screen flex-col bg-card">
        {/* Mobile-only health bar */}
        <div className="lg:hidden">
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
        </div>
        <OfflineIndicator />

        {/* Layout: 3-column on desktop, single column on mobile */}
        <div className="flex flex-1 overflow-y-auto lg:justify-center lg:gap-8 lg:pt-8 lg:pb-[72px]">
          <SideNav />
          <main className="flex-1 lg:w-[560px] lg:flex-none">
            <ErrorBoundary>
              {children}
            </ErrorBoundary>
          </main>
          <StatusSidebar />
        </div>
      </div>
      <ShortcutsOverlay open={helpOpen} onClose={() => setHelpOpen(false)} />
    </GatewayContext.Provider>
  );
}
