"use client";

import { use, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, ChevronDown, ChevronRight, Clock, Cpu, Wrench, RefreshCw } from "lucide-react";
import { useGatewayContext } from "@/contexts/gateway-context";
import { formatRelativeTime, formatTokenCount } from "@/lib/format";

interface ToolCallDisplay {
  id: string;
  name: string;
  status: "running" | "completed" | "failed";
  result?: string;
}

interface MessageDisplay {
  id: string;
  role: "user" | "agent" | "tool";
  content: string;
  timestamp: Date;
  tokens?: number;
  model?: string;
  toolCalls?: ToolCallDisplay[];
  cost?: number;
}

// ─── Gateway chat.history message type ────────────────────────────────────────

interface GatewayMessage {
  id?: string;
  type?: string;
  timestamp?: string;
  message?: {
    role?: string;
    content?: unknown;
    usage?: {
      input?: number;
      output?: number;
      totalTokens?: number;
      cost?: { total?: number };
    };
    model?: string;
    provider?: string;
    toolName?: string;
    toolCallId?: string;
  };
  // tool calls embedded in assistant messages
  toolCalls?: { id: string; name: string; input?: unknown }[];
  toolResults?: { callId: string; output?: unknown }[];
}

interface GatewayHistoryResponse {
  messages?: GatewayMessage[];
  sessionId?: string;
  model?: string;
  totalTokens?: number;
  totalCost?: number;
}

// ─── Message extraction helpers ──────────────────────────────────────────────

function extractTextContent(content: unknown): string {
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content
      .map((c: unknown) => {
        if (typeof c === "string") return c;
        if (c && typeof c === "object" && "text" in c) return (c as { text: string }).text;
        return "";
      })
      .filter(Boolean)
      .join("\n");
  }
  return "";
}

function buildMessagesFromHistory(raw: GatewayMessage[]): {
  messages: MessageDisplay[];
  totalTokens: number;
  totalCost: number;
  model: string;
} {
  const messages: MessageDisplay[] = [];
  let totalTokens = 0;
  let totalCost = 0;
  let model = "claude-sonnet-4";
  const toolCallMap = new Map<string, string>(); // callId → tool name

  for (const entry of raw) {
    if (entry.type !== "message" || !entry.message) continue;
    const msg = entry.message;
    const role = msg.role;
    if (!role || role === "system") continue;

    if (msg.model) model = msg.model;

    const tokens = msg.usage?.totalTokens ?? (msg.usage?.input ?? 0) + (msg.usage?.output ?? 0);
    const cost = msg.usage?.cost?.total ?? 0;
    totalTokens += tokens;
    totalCost += cost;

    const content = extractTextContent(msg.content);

    // Collect tool calls for assistant messages
    const toolCalls: ToolCallDisplay[] = [];
    if (Array.isArray((entry as unknown as { toolCalls?: unknown[] }).toolCalls)) {
      for (const tc of (entry as unknown as { toolCalls: { id: string; name: string; input?: unknown }[] }).toolCalls) {
        toolCallMap.set(tc.id, tc.name);
        toolCalls.push({
          id: tc.id,
          name: tc.name,
          status: "completed",
          result: tc.input ? JSON.stringify(tc.input, null, 2) : undefined,
        });
      }
    }

    // Tool result messages
    if (role === "tool" || msg.toolCallId) {
      const toolName = msg.toolName ?? toolCallMap.get(msg.toolCallId ?? "") ?? "tool";
      // Find last assistant message and attach result
      const lastAssistant = messages.filter((m) => m.role === "agent").pop();
      if (lastAssistant) {
        const existing = lastAssistant.toolCalls?.find((tc) => tc.id === (msg.toolCallId ?? ""));
        if (existing) {
          existing.result = content;
        } else {
          lastAssistant.toolCalls = [
            ...(lastAssistant.toolCalls ?? []),
            { id: msg.toolCallId ?? toolName, name: toolName, status: "completed", result: content },
          ];
        }
      }
      continue;
    }

    messages.push({
      id: entry.id ?? `msg-${messages.length}`,
      role: role === "assistant" ? "agent" : "user",
      content: content || "(empty)",
      timestamp: entry.timestamp ? new Date(entry.timestamp) : new Date(),
      tokens: tokens || undefined,
      model: msg.model,
      toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
      cost: cost || undefined,
    });
  }

  return { messages, totalTokens, totalCost, model };
}

// ─── Fallback messages ────────────────────────────────────────────────────────

function buildFallbackMessages(sessionKey: string): {
  messages: MessageDisplay[];
  totalTokens: number;
  totalCost: number;
  model: string;
  duration: string;
} {
  return {
    messages: [
      {
        id: "m1",
        role: "user",
        content: "Loading session history…",
        timestamp: new Date(),
      },
    ],
    totalTokens: 0,
    totalCost: 0,
    model: "—",
    duration: "—",
  };
  void sessionKey;
}

// ─── Components ───────────────────────────────────────────────────────────────

function ToolCallCard({ tool }: { tool: ToolCallDisplay }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className="rounded-lg overflow-hidden"
      style={{ boxShadow: "0 0 0 1px rgba(0, 0, 0, 0.06)" }}
    >
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-2 px-3 py-2 text-left text-[12px] transition-colors duration-150 hover:bg-card-hover/50 cursor-pointer"
      >
        <Wrench size={12} className="text-muted shrink-0" />
        <span className="font-mono font-medium text-foreground">{tool.name}</span>
        <span
          className={`ml-auto rounded-full px-2 py-0.5 text-[10px] font-medium ${
            tool.status === "completed"
              ? "bg-accent-green/10 text-accent-green"
              : tool.status === "failed"
              ? "bg-accent-red/10 text-accent-red"
              : "bg-accent-yellow/10 text-accent-yellow"
          }`}
        >
          {tool.status}
        </span>
        {expanded ? (
          <ChevronDown size={12} className="text-muted shrink-0" />
        ) : (
          <ChevronRight size={12} className="text-muted shrink-0" />
        )}
      </button>
      {expanded && tool.result && (
        <div className="border-t border-card-border/40 bg-background-deep px-3 py-2">
          <pre className="text-[11px] text-muted font-mono whitespace-pre-wrap leading-relaxed max-h-64 overflow-y-auto">
            {tool.result}
          </pre>
        </div>
      )}
    </div>
  );
}

function MessageBubble({
  message,
  runningCost,
}: {
  message: MessageDisplay;
  runningCost: number;
}) {
  const isUser = message.role === "user";

  return (
    <div className="flex gap-3">
      <div
        className={`mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold ${
          isUser ? "bg-foreground text-card" : "bg-foreground/10 text-foreground"
        }`}
      >
        {isUser ? "U" : "A"}
      </div>

      <div className="min-w-0 flex-1 space-y-2">
        <div className="flex items-center gap-2 text-[11px]">
          <span className="font-medium text-foreground">
            {isUser ? "You" : "Agent"}
          </span>
          <span className="text-muted/50" suppressHydrationWarning>
            {formatRelativeTime(message.timestamp)}
          </span>
          {message.tokens && (
            <span
              className="text-muted/40 font-mono"
              style={{ fontVariantNumeric: "tabular-nums" }}
            >
              {formatTokenCount(message.tokens)} tokens
            </span>
          )}
          {!isUser && runningCost > 0 && (
            <span
              className="text-muted/30 font-mono text-[10px] ml-auto"
              style={{ fontVariantNumeric: "tabular-nums" }}
            >
              ${runningCost.toFixed(4)}
            </span>
          )}
        </div>

        <p className="text-[13px] text-foreground/90 leading-relaxed whitespace-pre-wrap">
          {message.content}
        </p>

        {message.toolCalls && message.toolCalls.length > 0 && (
          <div className="space-y-1.5 pt-1">
            {message.toolCalls.map((tool) => (
              <ToolCallCard key={tool.id} tool={tool} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SessionDetailPage({
  params,
}: {
  params: Promise<{ key: string }>;
}) {
  const { key } = use(params);
  const { sessions, connectionStatus } = useGatewayContext();
  const session = sessions.find((s) => s.key === key);

  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<MessageDisplay[]>([]);
  const [totalTokens, setTotalTokens] = useState(0);
  const [totalCost, setTotalCost] = useState(0);
  const [model, setModel] = useState("—");
  const [duration, setDuration] = useState("—");
  const [error, setError] = useState<string | null>(null);

  const loadHistory = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Try to read JSONL file directly via API
      const resp = await fetch(`/api/sessions/${encodeURIComponent(key)}`);
      if (resp.ok) {
        const data = (await resp.json()) as {
          messages?: GatewayMessage[];
          totalTokens?: number;
          totalCost?: number;
          model?: string;
          duration?: string;
        };
        if (data.messages && data.messages.length > 0) {
          const parsed = buildMessagesFromHistory(data.messages);
          setMessages(parsed.messages);
          setTotalTokens(parsed.totalTokens);
          setTotalCost(parsed.totalCost);
          setModel(parsed.model);
          setLoading(false);
          return;
        }
      }
    } catch {
      // fall through to fallback
    }

    // Fallback: show session metadata only
    const fallback = buildFallbackMessages(key);
    setMessages(fallback.messages);
    setTotalTokens(session?.tokens ?? 0);
    setTotalCost(0);
    setModel(fallback.model);
    setDuration(fallback.duration);
    setError("Session history not available. The gateway may need to be connected.");
    setLoading(false);
  }, [key, session]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  let runningCost = 0;

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Header */}
      <div
        className="flex items-center gap-4 px-6 py-4"
        style={{ boxShadow: "0 1px 0 rgba(0, 0, 0, 0.04)" }}
      >
        <Link
          href="/sessions"
          className="flex items-center gap-1.5 text-[13px] text-muted hover:text-foreground transition-colors duration-150"
        >
          <ArrowLeft size={14} />
          Sessions
        </Link>
        <div className="h-4 w-px bg-card-border" />
        <h1 className="text-[14px] font-semibold text-foreground font-mono truncate max-w-xs">
          {key}
        </h1>
        {session && (
          <span className="rounded-md bg-foreground/5 px-2 py-0.5 text-[11px] font-medium text-muted">
            {session.kind}
          </span>
        )}
        <button
          type="button"
          onClick={loadHistory}
          className="ml-auto flex items-center gap-1.5 text-[12px] text-muted hover:text-foreground transition-colors duration-150 cursor-pointer"
        >
          <RefreshCw size={12} />
          Refresh
        </button>
      </div>

      {/* Session metadata */}
      <div
        className="flex items-center gap-6 px-6 py-3 text-[12px]"
        style={{ boxShadow: "0 1px 0 rgba(0, 0, 0, 0.04)" }}
      >
        <div className="flex items-center gap-1.5 text-muted">
          <Cpu size={12} />
          <span className="font-mono">{model}</span>
        </div>
        {duration !== "—" && (
          <div className="flex items-center gap-1.5 text-muted">
            <Clock size={12} />
            <span>{duration}</span>
          </div>
        )}
        <div
          className="font-mono text-muted"
          style={{ fontVariantNumeric: "tabular-nums" }}
        >
          {formatTokenCount(totalTokens || session?.tokens || 0)} tokens
        </div>
        {totalCost > 0 && (
          <div
            className="font-mono text-muted"
            style={{ fontVariantNumeric: "tabular-nums" }}
          >
            ${totalCost.toFixed(4)}
          </div>
        )}
        {connectionStatus === "disconnected" && (
          <span className="ml-auto text-[11px] text-accent-yellow">
            Gateway disconnected
          </span>
        )}
      </div>

      {/* Error banner */}
      {error && (
        <div className="mx-6 mt-4 flex items-center gap-2 rounded-lg bg-accent-yellow/8 border border-accent-yellow/15 px-4 py-2.5 text-[12px] text-accent-yellow">
          {error}
        </div>
      )}

      {/* Conversation thread */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-[13px] text-muted">Loading session history…</p>
          </div>
        ) : (
          <div className="mx-auto max-w-3xl space-y-6">
            {messages.map((msg) => {
              if (msg.role === "agent" && msg.cost) {
                runningCost += msg.cost;
              } else if (msg.role === "agent" && msg.tokens) {
                runningCost += msg.tokens * 0.000015;
              }
              return (
                <MessageBubble
                  key={msg.id}
                  message={msg}
                  runningCost={runningCost}
                />
              );
            })}
            {messages.length === 0 && (
              <p className="text-center text-[13px] text-muted py-12">
                No messages in this session.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
