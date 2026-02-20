"use client";

import { WifiOff, RefreshCw, AlertTriangle } from "lucide-react";
import type { ConnectionState } from "@/lib/gateway/connection";

interface ConnectionBannerProps {
  state: ConnectionState;
  error?: string | null;
  reconnectMs?: number | null;
}

export function ConnectionBanner({ state, error, reconnectMs }: ConnectionBannerProps) {
  if (state === "connected") return null;

  const isReconnecting = state === "reconnecting";
  const isConnecting = state === "connecting" || state === "challenged" || state === "authenticating";

  return (
    <div
      className={`animate-slide-down flex items-center gap-3 px-6 py-2.5 text-[12px] font-medium ${
        isReconnecting
          ? "bg-accent-yellow/10 text-accent-yellow"
          : state === "disconnected"
          ? "bg-accent-red/10 text-accent-red"
          : "bg-foreground/5 text-muted"
      }`}
    >
      {isReconnecting ? (
        <>
          <RefreshCw size={13} className="animate-spin" />
          <span>
            Reconnecting
            {reconnectMs ? ` in ${Math.ceil(reconnectMs / 1000)}s` : "..."}
          </span>
        </>
      ) : state === "disconnected" ? (
        <>
          <WifiOff size={13} />
          <span>Disconnected from gateway</span>
          {error && (
            <span className="text-accent-red/60">— {error}</span>
          )}
        </>
      ) : isConnecting ? (
        <>
          <RefreshCw size={13} className="animate-spin" />
          <span>
            {state === "authenticating" ? "Authenticating..." : "Connecting..."}
          </span>
        </>
      ) : (
        <>
          <AlertTriangle size={13} />
          <span>{error ?? "Connection issue"}</span>
        </>
      )}
    </div>
  );
}
