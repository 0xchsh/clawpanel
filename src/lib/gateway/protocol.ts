/**
 * Gateway WebSocket protocol types.
 * Matches the OpenClaw gateway wire format.
 */

// --- Outbound (client → gateway) ---

export interface ConnectFrame {
  type: "connect";
  params: {
    role: "operator";
    scope: string[];
    auth: { token: string };
  };
}

export interface RpcRequest {
  type: "req";
  id: string;
  method: string;
  params?: Record<string, unknown>;
  idempotencyKey?: string;
}

// --- Inbound (gateway → client) ---

export interface ChallengeEvent {
  type: "event";
  event: "connect.challenge";
  payload: { nonce: string; ts: number };
}

export interface HelloOkEvent {
  type: "event";
  event: "hello-ok";
  payload: {
    presence: unknown[];
    health: Record<string, unknown>;
    stateVersion: number;
    uptimeMs: number;
    limits: Record<string, unknown>;
    policy: Record<string, unknown>;
  };
}

export interface GatewayEvent {
  type: "event";
  event: string;
  payload: Record<string, unknown>;
  seq?: number;
  stateVersion?: number;
}

export interface RpcResponse {
  type: "res";
  id: string;
  ok: boolean;
  payload?: Record<string, unknown>;
  error?: { code: string; message: string };
}

export type InboundFrame = ChallengeEvent | HelloOkEvent | GatewayEvent | RpcResponse;

// --- Helpers ---

export function createConnectFrame(token: string): ConnectFrame {
  return {
    type: "connect",
    params: {
      role: "operator",
      scope: ["operator.admin"],
      auth: { token },
    },
  };
}

export function createRpcRequest(
  method: string,
  params?: Record<string, unknown>
): RpcRequest {
  return {
    type: "req",
    id: crypto.randomUUID(),
    method,
    params,
  };
}

export function parseFrame(data: string): InboundFrame | null {
  try {
    return JSON.parse(data) as InboundFrame;
  } catch {
    return null;
  }
}
