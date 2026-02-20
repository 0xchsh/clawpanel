/**
 * Gateway WebSocket connection manager.
 *
 * Lifecycle: DISCONNECTED → CONNECTING → CHALLENGED → AUTHENTICATING → CONNECTED → RECONNECTING
 *
 * Handles:
 * - Challenge-response auth handshake
 * - RPC request/response correlation
 * - Reconnection with exponential backoff
 * - Sequence gap detection and state refresh
 * - visibilitychange listener for tab focus reconnect
 * - WSS/HTTPS mismatch detection
 */

import {
  createConnectFrame,
  createRpcRequest,
  parseFrame,
  type InboundFrame,
  type RpcResponse,
  type GatewayEvent,
  type HelloOkEvent,
} from "./protocol";
import {
  initialReconnectState,
  nextReconnectDelay,
  resetReconnectState,
  type ReconnectState,
} from "./reconnect";
import {
  classifyGatewayEvent,
  EventDispatcher,
  type ClassifiedEvent,
} from "./event-bridge";
import { ClawPanelError } from "./errors";

export type ConnectionState =
  | "disconnected"
  | "connecting"
  | "challenged"
  | "authenticating"
  | "connected"
  | "reconnecting";

export interface ConnectionConfig {
  url: string;
  token: string;
  onStateChange?: (state: ConnectionState) => void;
  onEvent?: (event: ClassifiedEvent) => void;
  onHelloOk?: (payload: HelloOkEvent["payload"]) => void;
  onError?: (error: ClawPanelError) => void;
  onReconnectCountdown?: (ms: number) => void;
}

interface PendingRpc {
  resolve: (payload: Record<string, unknown>) => void;
  reject: (error: Error) => void;
  timer: ReturnType<typeof setTimeout>;
}

const HANDSHAKE_TIMEOUT = 10_000;
const RPC_TIMEOUT = 15_000;

export class GatewayConnection {
  private ws: WebSocket | null = null;
  private state: ConnectionState = "disconnected";
  private config: ConnectionConfig;
  private reconnectState: ReconnectState = initialReconnectState();
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private handshakeTimer: ReturnType<typeof setTimeout> | null = null;
  private pendingRpcs: Map<string, PendingRpc> = new Map();
  private lastSeq: number = -1;
  private lastStateVersion: number = -1;
  private dispatcher: EventDispatcher = new EventDispatcher();
  private visibilityHandler: (() => void) | null = null;
  private intentionalClose = false;

  constructor(config: ConnectionConfig) {
    this.config = config;
  }

  /** Start connection. Call once. */
  connect(): void {
    if (this.state !== "disconnected" && this.state !== "reconnecting") return;
    this.checkWssMismatch();
    this.doConnect();
    this.setupVisibilityListener();
  }

  /** Gracefully disconnect. */
  disconnect(): void {
    this.intentionalClose = true;
    this.clearTimers();
    this.removeVisibilityListener();
    this.dispatcher.clear();
    if (this.ws) {
      this.ws.close(1000, "ClawPanel disconnect");
      this.ws = null;
    }
    this.setState("disconnected");
  }

  /** Send an RPC request and get a typed response. */
  async rpc<T = Record<string, unknown>>(
    method: string,
    params?: Record<string, unknown>
  ): Promise<T> {
    if (this.state !== "connected") {
      throw new ClawPanelError("clawpanel.gateway_unreachable", "Not connected.");
    }

    const req = createRpcRequest(method, params);

    return new Promise<T>((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pendingRpcs.delete(req.id);
        reject(new ClawPanelError("clawpanel.rpc_timeout", `Method: ${method}`));
      }, RPC_TIMEOUT);

      this.pendingRpcs.set(req.id, {
        resolve: resolve as (payload: Record<string, unknown>) => void,
        reject,
        timer,
      });

      this.ws!.send(JSON.stringify(req));
    });
  }

  /** Subscribe to event categories. Returns unsubscribe function. */
  on(
    category: "summary" | "runtime" | "system" | "unknown",
    handler: (event: ClassifiedEvent) => void
  ): () => void {
    return this.dispatcher.on(category, handler);
  }

  /** Get current connection state. */
  getState(): ConnectionState {
    return this.state;
  }

  // --- Private ---

  private doConnect(): void {
    this.setState("connecting");

    try {
      this.ws = new WebSocket(this.config.url);
    } catch {
      this.config.onError?.(new ClawPanelError("clawpanel.gateway_unreachable"));
      this.scheduleReconnect();
      return;
    }

    this.ws.onopen = () => {
      // Wait for challenge from gateway
      this.handshakeTimer = setTimeout(() => {
        this.config.onError?.(new ClawPanelError("clawpanel.handshake_timeout"));
        this.ws?.close();
      }, HANDSHAKE_TIMEOUT);
    };

    this.ws.onmessage = (event) => {
      const frame = parseFrame(event.data as string);
      if (!frame) return;
      this.handleFrame(frame);
    };

    this.ws.onclose = () => {
      this.clearHandshakeTimer();
      this.rejectAllPendingRpcs();
      if (!this.intentionalClose) {
        this.scheduleReconnect();
      }
    };

    this.ws.onerror = () => {
      // onclose will fire after onerror — reconnect happens there
    };
  }

  private handleFrame(frame: InboundFrame): void {
    // Challenge
    if (frame.type === "event" && frame.event === "connect.challenge") {
      this.setState("challenged");
      this.sendAuth();
      return;
    }

    // Hello-ok (auth success)
    if (frame.type === "event" && frame.event === "hello-ok") {
      this.clearHandshakeTimer();
      this.setState("connected");
      this.reconnectState = resetReconnectState();
      this.config.onHelloOk?.((frame as HelloOkEvent).payload);
      return;
    }

    // RPC response
    if (frame.type === "res") {
      this.handleRpcResponse(frame as RpcResponse);
      return;
    }

    // Gateway event
    if (frame.type === "event") {
      this.handleEvent(frame as GatewayEvent);
      return;
    }
  }

  private sendAuth(): void {
    this.setState("authenticating");
    const connectFrame = createConnectFrame(this.config.token);
    this.ws?.send(JSON.stringify(connectFrame));
  }

  private handleRpcResponse(res: RpcResponse): void {
    const pending = this.pendingRpcs.get(res.id);
    if (!pending) return;

    clearTimeout(pending.timer);
    this.pendingRpcs.delete(res.id);

    if (res.ok && res.payload) {
      pending.resolve(res.payload);
    } else {
      const msg = res.error?.message ?? "RPC failed";
      if (res.error?.code === "auth.invalid_token") {
        pending.reject(new ClawPanelError("clawpanel.gateway_token_invalid"));
      } else {
        pending.reject(new Error(msg));
      }
    }
  }

  private handleEvent(frame: GatewayEvent): void {
    // Sequence gap detection
    if (frame.seq !== undefined && this.lastSeq >= 0) {
      if (frame.seq > this.lastSeq + 1) {
        this.config.onError?.(new ClawPanelError("clawpanel.sequence_gap"));
        this.refreshStateAfterGap();
      }
    }
    if (frame.seq !== undefined) this.lastSeq = frame.seq;
    if (frame.stateVersion !== undefined) this.lastStateVersion = frame.stateVersion;

    const classified = classifyGatewayEvent(frame);
    this.dispatcher.dispatch(classified);
    this.config.onEvent?.(classified);
  }

  private async refreshStateAfterGap(): Promise<void> {
    // After a sequence gap, refresh full state from gateway
    try {
      await Promise.all([
        this.rpc("health"),
        this.rpc("system-presence"),
      ]);
    } catch {
      // Best effort — state will eventually converge
    }
  }

  private scheduleReconnect(): void {
    this.setState("reconnecting");
    const { delayMs, next } = nextReconnectDelay(this.reconnectState);
    this.reconnectState = next;

    this.config.onReconnectCountdown?.(delayMs);

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.doConnect();
    }, delayMs);
  }

  private setState(state: ConnectionState): void {
    if (this.state === state) return;
    this.state = state;
    this.config.onStateChange?.(state);
  }

  private checkWssMismatch(): void {
    if (typeof window === "undefined") return;
    const isHttps = window.location.protocol === "https:";
    const isWs = this.config.url.startsWith("ws://");
    if (isHttps && isWs) {
      this.config.onError?.(new ClawPanelError("clawpanel.wss_required"));
    }
  }

  private setupVisibilityListener(): void {
    if (typeof document === "undefined") return;
    this.visibilityHandler = () => {
      if (
        document.visibilityState === "visible" &&
        this.state === "reconnecting"
      ) {
        // Immediate reconnect on tab focus
        if (this.reconnectTimer) {
          clearTimeout(this.reconnectTimer);
          this.reconnectTimer = null;
        }
        this.doConnect();
      }
    };
    document.addEventListener("visibilitychange", this.visibilityHandler);
  }

  private removeVisibilityListener(): void {
    if (this.visibilityHandler && typeof document !== "undefined") {
      document.removeEventListener("visibilitychange", this.visibilityHandler);
      this.visibilityHandler = null;
    }
  }

  private clearHandshakeTimer(): void {
    if (this.handshakeTimer) {
      clearTimeout(this.handshakeTimer);
      this.handshakeTimer = null;
    }
  }

  private clearTimers(): void {
    this.clearHandshakeTimer();
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  private rejectAllPendingRpcs(): void {
    const error = new ClawPanelError("clawpanel.connection_closed");
    for (const [id, pending] of this.pendingRpcs) {
      clearTimeout(pending.timer);
      pending.reject(error);
      this.pendingRpcs.delete(id);
    }
  }
}
