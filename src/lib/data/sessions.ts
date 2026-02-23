/**
 * Session JSONL file reader.
 * Reads and parses session files from ~/.openclaw/agents/<agentId>/sessions/*.jsonl
 *
 * Actual JSONL format (OpenClaw v2026):
 * - type: "session" — session header with id, timestamp
 * - type: "model_change" — provider + modelId
 * - type: "thinking_level_change" — thinkingLevel
 * - type: "message" — contains message.role, message.content, message.usage
 *   - usage: { input, output, cacheRead, cacheWrite, totalTokens, cost: { input, output, cacheRead, cacheWrite, total } }
 *   - model, provider, api, stopReason fields on assistant messages
 * - type: "custom" — custom events (model-snapshot, etc.)
 */

import { promises as fs } from "fs";
import path from "path";

export interface SessionUsage {
  input: number;
  output: number;
  cacheRead: number;
  cacheWrite: number;
  totalTokens: number;
  cost?: {
    input: number;
    output: number;
    cacheRead: number;
    cacheWrite: number;
    total: number;
  };
}

export interface SessionMessage {
  type: string;
  id?: string;
  parentId?: string | null;
  timestamp?: string;
  // For type: "message"
  message?: {
    role: "user" | "assistant" | "system" | "tool" | "toolResult";
    content?: unknown;
    usage?: SessionUsage;
    api?: string;
    provider?: string;
    model?: string;
    stopReason?: string;
    timestamp?: number;
    toolCallId?: string;
    toolName?: string;
  };
  // For type: "model_change"
  provider?: string;
  modelId?: string;
  // For type: "session"
  version?: number;
  cwd?: string;
  // For type: "thinking_level_change"
  thinkingLevel?: string;
}

export interface SessionFileData {
  filename: string;
  sessionId: string | null;
  messages: SessionMessage[];
  totalInputTokens: number;
  totalOutputTokens: number;
  totalCacheReadTokens: number;
  totalCacheWriteTokens: number;
  totalCost: number;
  messageCount: number;
  firstTimestamp: string | null;
  lastTimestamp: string | null;
  models: Set<string>;
  provider: string | null;
}

export interface SessionDirInfo {
  path: string;
  fileCount: number;
  totalSizeBytes: number;
  files: string[];
}

const DEFAULT_SESSION_PATH = path.join(
  process.env.HOME ?? "~",
  ".openclaw",
  "agents",
  "main",
  "sessions"
);

export function getSessionPath(override?: string): string {
  if (override && override !== "~/.openclaw/agents/main/sessions/") {
    return override.replace(/^~/, process.env.HOME ?? "~");
  }
  return DEFAULT_SESSION_PATH;
}

export async function getSessionDirInfo(sessionPath?: string): Promise<SessionDirInfo | null> {
  const dir = getSessionPath(sessionPath);
  try {
    const entries = await fs.readdir(dir);
    const jsonlFiles = entries.filter((f) => f.endsWith(".jsonl"));

    let totalSize = 0;
    for (const file of jsonlFiles) {
      const stat = await fs.stat(path.join(dir, file));
      totalSize += stat.size;
    }

    return {
      path: dir,
      fileCount: jsonlFiles.length,
      totalSizeBytes: totalSize,
      files: jsonlFiles,
    };
  } catch {
    return null;
  }
}

export async function readSessionFile(filePath: string): Promise<SessionFileData> {
  const content = await fs.readFile(filePath, "utf-8");
  const lines = content.trim().split("\n").filter(Boolean);

  const messages: SessionMessage[] = [];
  let totalInput = 0;
  let totalOutput = 0;
  let totalCacheRead = 0;
  let totalCacheWrite = 0;
  let totalCost = 0;
  let firstTimestamp: string | null = null;
  let lastTimestamp: string | null = null;
  let sessionId: string | null = null;
  let provider: string | null = null;
  const models = new Set<string>();

  for (const line of lines) {
    try {
      const entry = JSON.parse(line) as SessionMessage;
      messages.push(entry);

      // Track timestamps
      if (entry.timestamp) {
        if (!firstTimestamp) firstTimestamp = entry.timestamp;
        lastTimestamp = entry.timestamp;
      }

      // Session header
      if (entry.type === "session") {
        sessionId = entry.id ?? null;
      }

      // Model changes
      if (entry.type === "model_change") {
        if (entry.modelId) models.add(entry.modelId);
        if (entry.provider) provider = entry.provider;
      }

      // Messages with usage data
      if (entry.type === "message" && entry.message) {
        const msg = entry.message;

        // Track model from assistant messages
        if (msg.model) models.add(msg.model);
        if (msg.provider) provider = msg.provider;

        if (msg.usage) {
          const u = msg.usage;
          totalInput += u.input ?? 0;
          totalOutput += u.output ?? 0;
          totalCacheRead += u.cacheRead ?? 0;
          totalCacheWrite += u.cacheWrite ?? 0;
          if (u.cost?.total) {
            totalCost += u.cost.total;
          }
        }
      }
    } catch {
      // Skip malformed lines
    }
  }

  return {
    filename: path.basename(filePath),
    sessionId,
    messages,
    totalInputTokens: totalInput,
    totalOutputTokens: totalOutput,
    totalCacheReadTokens: totalCacheRead,
    totalCacheWriteTokens: totalCacheWrite,
    totalCost,
    messageCount: messages.filter((m) => m.type === "message").length,
    firstTimestamp,
    lastTimestamp,
    models,
    provider,
  };
}

export async function readAllSessions(sessionPath?: string): Promise<SessionFileData[]> {
  const dir = getSessionPath(sessionPath);
  try {
    const entries = await fs.readdir(dir);
    const jsonlFiles = entries
      .filter((f) => f.endsWith(".jsonl"))
      .map((f) => path.join(dir, f));

    const results = await Promise.all(
      jsonlFiles.map((fp) => readSessionFile(fp).catch(() => null))
    );

    return results.filter((r): r is SessionFileData => r !== null);
  } catch {
    return [];
  }
}
