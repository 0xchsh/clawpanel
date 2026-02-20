/**
 * Single event bridge — classifies every gateway event into one of two pipelines:
 *   1. Summary refresh — presence, health, heartbeat → health bar + agent state
 *   2. Runtime stream — chat, agent → activity feed + session browser
 */

import type { GatewayEvent } from "./protocol";

export type EventCategory = "summary" | "runtime" | "system" | "unknown";

export interface ClassifiedEvent {
  category: EventCategory;
  event: string;
  payload: Record<string, unknown>;
  seq?: number;
  stateVersion?: number;
}

const SUMMARY_EVENTS = new Set([
  "presence",
  "health",
  "heartbeat",
  "tick",
]);

const RUNTIME_EVENTS = new Set([
  "chat",
  "agent",
]);

const SYSTEM_EVENTS = new Set([
  "shutdown",
  "hello-ok",
  "connect.challenge",
]);

export function classifyGatewayEvent(frame: GatewayEvent): ClassifiedEvent {
  let category: EventCategory = "unknown";

  if (SUMMARY_EVENTS.has(frame.event)) {
    category = "summary";
  } else if (RUNTIME_EVENTS.has(frame.event)) {
    category = "runtime";
  } else if (SYSTEM_EVENTS.has(frame.event)) {
    category = "system";
  }

  return {
    category,
    event: frame.event,
    payload: frame.payload,
    seq: frame.seq,
    stateVersion: frame.stateVersion,
  };
}

export type EventHandler = (event: ClassifiedEvent) => void;

export class EventDispatcher {
  private handlers: Map<EventCategory, Set<EventHandler>> = new Map();

  on(category: EventCategory, handler: EventHandler): () => void {
    if (!this.handlers.has(category)) {
      this.handlers.set(category, new Set());
    }
    this.handlers.get(category)!.add(handler);
    return () => {
      this.handlers.get(category)?.delete(handler);
    };
  }

  dispatch(event: ClassifiedEvent): void {
    const handlers = this.handlers.get(event.category);
    if (handlers) {
      for (const handler of handlers) {
        handler(event);
      }
    }
  }

  clear(): void {
    this.handlers.clear();
  }
}
