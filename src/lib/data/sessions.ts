/**
 * Session JSONL file reader.
 * Reads and parses session files from ~/.openclaw/agents/<agentId>/sessions/*.jsonl
 *
 * This runs server-side (API routes) — browsers cannot read the filesystem.
 */

import { promises as fs } from "fs";
import path from "path";

export interface SessionMessage {
  role: "user" | "assistant" | "system" | "tool";
  content: string;
  timestamp?: string;
  model?: string;
  usage?: {
    input_tokens?: number;
    output_tokens?: number;
    cache_creation_input_tokens?: number;
    cache_read_input_tokens?: number;
  };
  tool_calls?: Array<{
    id: string;
    name: string;
    input: Record<string, unknown>;
    output?: string;
    duration_ms?: number;
    status?: string;
  }>;
}

export interface SessionFileData {
  filename: string;
  messages: SessionMessage[];
  totalInputTokens: number;
  totalOutputTokens: number;
  totalCacheReadTokens: number;
  totalCacheWriteTokens: number;
  messageCount: number;
  firstTimestamp: string | null;
  lastTimestamp: string | null;
  models: Set<string>;
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
  let firstTimestamp: string | null = null;
  let lastTimestamp: string | null = null;
  const models = new Set<string>();

  for (const line of lines) {
    try {
      const msg = JSON.parse(line) as SessionMessage;
      messages.push(msg);

      if (msg.usage) {
        totalInput += msg.usage.input_tokens ?? 0;
        totalOutput += msg.usage.output_tokens ?? 0;
        totalCacheRead += msg.usage.cache_read_input_tokens ?? 0;
        totalCacheWrite += msg.usage.cache_creation_input_tokens ?? 0;
      }

      if (msg.timestamp) {
        if (!firstTimestamp) firstTimestamp = msg.timestamp;
        lastTimestamp = msg.timestamp;
      }

      if (msg.model) models.add(msg.model);
    } catch {
      // Skip malformed lines
    }
  }

  return {
    filename: path.basename(filePath),
    messages,
    totalInputTokens: totalInput,
    totalOutputTokens: totalOutput,
    totalCacheReadTokens: totalCacheRead,
    totalCacheWriteTokens: totalCacheWrite,
    messageCount: messages.length,
    firstTimestamp,
    lastTimestamp,
    models,
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
