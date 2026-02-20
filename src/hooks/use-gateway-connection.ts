"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  GatewayConnection,
  type ConnectionState,
  type ClassifiedEvent,
} from "@/lib/gateway";
import type { ActivityEvent, ActivityEventType } from "@/types";

interface GatewayConnectionState {
  connectionState: ConnectionState;
  error: string | null;
  reconnectMs: number | null;
  events: ActivityEvent[];
}

let eventCounter = 0;

function gatewayEventToActivity(event: ClassifiedEvent): ActivityEvent | null {
  const payload = event.payload;

  let type: ActivityEventType = "message";
  let description = "";
  let detail: string | undefined;

  switch (event.event) {
    case "chat":
      type = "message";
      description = (payload.direction === "inbound" ? "Received" : "Sent") +
        ` message${payload.channel ? ` on ${payload.channel}` : ""}`;
      detail = payload.preview as string | undefined;
      break;
    case "agent":
      if (payload.tool) {
        type = "skill";
        description = `Ran ${payload.tool}`;
        detail = payload.input as string | undefined;
      } else {
        type = "session";
        description = (payload.action as string) ?? "Agent activity";
      }
      break;
    case "presence":
      type = "node";
      description = `${payload.host ?? "Device"} ${payload.action ?? "updated"}`;
      break;
    case "health":
      type = "channel";
      description = "Health status changed";
      break;
    case "heartbeat":
    case "tick":
      return null; // Don't show heartbeats in feed
    default:
      description = event.event;
  }

  return {
    id: `gw-${++eventCounter}`,
    agentName: (payload.agent as string) ?? "Agent",
    agentEmoji: "🦊",
    type,
    description,
    timestamp: new Date(),
    detail,
  };
}

export function useGatewayConnection(url: string, token: string) {
  const [state, setState] = useState<GatewayConnectionState>({
    connectionState: "disconnected",
    error: null,
    reconnectMs: null,
    events: [],
  });

  const connRef = useRef<GatewayConnection | null>(null);

  const connect = useCallback(() => {
    if (connRef.current) {
      connRef.current.disconnect();
    }

    if (!url || !token) return;

    const conn = new GatewayConnection({
      url,
      token,
      onStateChange: (newState) => {
        setState((prev) => ({
          ...prev,
          connectionState: newState,
          error: null,
          reconnectMs: null,
        }));
      },
      onEvent: (event) => {
        const activity = gatewayEventToActivity(event);
        if (activity) {
          setState((prev) => ({
            ...prev,
            events: [activity, ...prev.events].slice(0, 100),
          }));
        }
      },
      onError: (error) => {
        setState((prev) => ({
          ...prev,
          error: error.message,
        }));
      },
      onReconnectCountdown: (ms) => {
        setState((prev) => ({
          ...prev,
          reconnectMs: ms,
        }));
      },
      onHelloOk: () => {
        setState((prev) => ({
          ...prev,
          connectionState: "connected",
          error: null,
          reconnectMs: null,
        }));
      },
    });

    connRef.current = conn;
    conn.connect();
  }, [url, token]);

  const disconnect = useCallback(() => {
    connRef.current?.disconnect();
    connRef.current = null;
  }, []);

  const rpc = useCallback(
    async <T = Record<string, unknown>>(
      method: string,
      params?: Record<string, unknown>
    ): Promise<T | null> => {
      try {
        return (await connRef.current?.rpc<T>(method, params)) ?? null;
      } catch {
        return null;
      }
    },
    []
  );

  useEffect(() => {
    return () => {
      connRef.current?.disconnect();
    };
  }, []);

  return {
    ...state,
    connect,
    disconnect,
    rpc,
    connection: connRef.current,
  };
}
