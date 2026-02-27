"use client";

import { useGatewayContext } from "@/contexts/gateway-context";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { formatRelativeTime } from "@/lib/format";
import { Monitor, Smartphone, Server } from "lucide-react";

const familyIcons: Record<string, typeof Monitor> = {
  desktop: Monitor,
  mobile: Smartphone,
  server: Server,
};

export default function InstancesPage() {
  const { instances } = useGatewayContext();

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <PageHeader
        title="Instances"
        description={`${instances.length} connected instances`}
      />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-3xl space-y-3">
          {instances.map((inst) => {
            const Icon = familyIcons[inst.deviceFamily] || Monitor;
            const stale = inst.presenceAge > 300;

            return (
              <div
                key={inst.id}
                className="rounded-2xl border border-card-border bg-card p-4"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-card-border text-muted">
                    <Icon size={20} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-sm font-medium">
                        {inst.host}
                      </span>
                      <StatusBadge
                        status={stale ? "offline" : "online"}
                        label={stale ? "Stale" : "Active"}
                      />
                    </div>
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      <Chip>{inst.platform}</Chip>
                      <Chip>{inst.deviceFamily}</Chip>
                      <Chip>{inst.mode}</Chip>
                      <Chip>v{inst.version}</Chip>
                      {inst.model && <Chip>{inst.model.split("-").slice(0, 2).join("-")}</Chip>}
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {inst.roles.map((r) => (
                        <span
                          key={r}
                          className="rounded-full bg-accent-green/10 px-2 py-0.5 text-[10px] text-accent-green"
                        >
                          {r}
                        </span>
                      ))}
                      {inst.scopes.map((s) => (
                        <span
                          key={s}
                          className="rounded-full bg-foreground/10 px-2 py-0.5 text-[10px] text-foreground"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-[10px] text-muted" suppressHydrationWarning>
                      {formatRelativeTime(inst.lastActivity)}
                    </p>
                    {inst.statusReason && (
                      <p className="mt-0.5 text-[10px] text-accent-yellow">
                        {inst.statusReason}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-card-border px-2 py-0.5 text-[10px] text-muted">
      {children}
    </span>
  );
}
