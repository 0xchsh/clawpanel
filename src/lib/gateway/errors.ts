/**
 * Structured error codes for ClawPanel.
 * Every error uses a namespaced code for debugging and issue reports.
 */

export type ClawPanelErrorCode =
  | "clawpanel.gateway_unreachable"
  | "clawpanel.gateway_token_invalid"
  | "clawpanel.gateway_token_missing"
  | "clawpanel.protocol_incompatible"
  | "clawpanel.sessions_unreadable"
  | "clawpanel.port_in_use"
  | "clawpanel.config_corrupt"
  | "clawpanel.wss_required"
  | "clawpanel.connection_closed"
  | "clawpanel.handshake_timeout"
  | "clawpanel.rpc_timeout"
  | "clawpanel.sequence_gap";

const errorMessages: Record<ClawPanelErrorCode, string> = {
  "clawpanel.gateway_unreachable": "Cannot connect to gateway. Is OpenClaw running?",
  "clawpanel.gateway_token_invalid": "Gateway rejected the auth token. Re-check your token or run `openclaw doctor --generate-gateway-token`.",
  "clawpanel.gateway_token_missing": "No gateway token found. Paste your token in Settings or ensure ~/.openclaw/openclaw.json is accessible.",
  "clawpanel.protocol_incompatible": "Gateway protocol version mismatch. Update ClawPanel or OpenClaw.",
  "clawpanel.sessions_unreadable": "Cannot read session JSONL files from disk. Check file permissions.",
  "clawpanel.port_in_use": "Port is already in use by another process.",
  "clawpanel.config_corrupt": "Config file exists but contains invalid JSON.",
  "clawpanel.wss_required": "Your browser requires a secure WebSocket connection (wss://). Change your gateway URL from ws:// to wss://, or access ClawPanel over http://.",
  "clawpanel.connection_closed": "WebSocket connection was closed unexpectedly.",
  "clawpanel.handshake_timeout": "Gateway did not respond to the auth handshake in time.",
  "clawpanel.rpc_timeout": "RPC request timed out waiting for a response.",
  "clawpanel.sequence_gap": "Event sequence gap detected. Resyncing state.",
};

export class ClawPanelError extends Error {
  code: ClawPanelErrorCode;

  constructor(code: ClawPanelErrorCode, detail?: string) {
    const base = errorMessages[code];
    super(detail ? `${base} ${detail}` : base);
    this.code = code;
    this.name = "ClawPanelError";
  }
}

export function getErrorMessage(code: ClawPanelErrorCode): string {
  return errorMessages[code];
}
