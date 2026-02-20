"use client";

import { use, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ChevronDown, ChevronRight, Clock, Cpu, Wrench } from "lucide-react";
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
  role: "user" | "agent";
  content: string;
  timestamp: Date;
  tokens?: number;
  model?: string;
  toolCalls?: ToolCallDisplay[];
}

// Build mock conversation for selected session
function buildSessionMessages(sessionKey: string): {
  messages: MessageDisplay[];
  totalTokens: number;
  totalCost: number;
  model: string;
  duration: string;
} {
  const messages: MessageDisplay[] = [
    {
      id: "m1",
      role: "user",
      content: "Can you check the status of the deployment pipeline?",
      timestamp: new Date(Date.now() - 3600000),
      tokens: 24,
    },
    {
      id: "m2",
      role: "agent",
      content: "I'll check the deployment pipeline status for you.",
      timestamp: new Date(Date.now() - 3540000),
      tokens: 847,
      model: "claude-sonnet-4",
      toolCalls: [
        {
          id: "tc1",
          name: "exec",
          status: "completed",
          result: "Pipeline Status: ✓ Build passed\n✓ Tests passed (142/142)\n✓ Deploy to staging: complete\n⏳ Deploy to production: pending approval",
        },
      ],
    },
    {
      id: "m3",
      role: "user",
      content: "Looks good. Approve the production deploy.",
      timestamp: new Date(Date.now() - 3480000),
      tokens: 18,
    },
    {
      id: "m4",
      role: "agent",
      content: "Production deployment has been approved and is now rolling out. I'll monitor it and let you know if any issues come up.",
      timestamp: new Date(Date.now() - 3420000),
      tokens: 1203,
      model: "claude-sonnet-4",
      toolCalls: [
        {
          id: "tc2",
          name: "exec",
          status: "completed",
          result: "Deployment approved. Rolling out to 3 regions...\nRegion us-east-1: ✓ healthy\nRegion eu-west-1: ✓ healthy\nRegion ap-southeast-1: deploying...",
        },
        {
          id: "tc3",
          name: "send_message",
          status: "completed",
          result: "Sent notification to #deployments channel",
        },
      ],
    },
  ];

  return {
    messages,
    totalTokens: messages.reduce((s, m) => s + (m.tokens ?? 0), 0),
    totalCost: 0.03,
    model: "claude-sonnet-4",
    duration: "3m 12s",
  };
}

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
          <pre className="text-[11px] text-muted font-mono whitespace-pre-wrap leading-relaxed">
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
    <div className={`flex gap-3 ${isUser ? "" : ""}`}>
      {/* Avatar */}
      <div
        className={`mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold ${
          isUser
            ? "bg-foreground text-card"
            : "bg-foreground/10 text-foreground"
        }`}
      >
        {isUser ? "U" : "A"}
      </div>

      <div className="min-w-0 flex-1 space-y-2">
        {/* Header */}
        <div className="flex items-center gap-2 text-[11px]">
          <span className="font-medium text-foreground">
            {isUser ? "You" : "Agent"}
          </span>
          <span className="text-muted/50" suppressHydrationWarning>
            {formatRelativeTime(message.timestamp)}
          </span>
          {message.tokens && (
            <span className="text-muted/40 font-mono" style={{ fontVariantNumeric: "tabular-nums" }}>
              {formatTokenCount(message.tokens)} tokens
            </span>
          )}
          {!isUser && (
            <span className="text-muted/30 font-mono text-[10px] ml-auto" style={{ fontVariantNumeric: "tabular-nums" }}>
              ${runningCost.toFixed(3)}
            </span>
          )}
        </div>

        {/* Content */}
        <p className="text-[13px] text-foreground/90 leading-relaxed">
          {message.content}
        </p>

        {/* Tool calls */}
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

export default function SessionDetailPage({
  params,
}: {
  params: Promise<{ key: string }>;
}) {
  const { key } = use(params);
  const { sessions } = useGatewayContext();
  const session = sessions.find((s) => s.key === key);
  const { messages, totalTokens, totalCost, model, duration } =
    buildSessionMessages(key);

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
        <h1 className="text-[14px] font-semibold text-foreground font-mono">
          {key}
        </h1>
        {session && (
          <span className="rounded-md bg-foreground/5 px-2 py-0.5 text-[11px] font-medium text-muted">
            {session.kind}
          </span>
        )}
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
        <div className="flex items-center gap-1.5 text-muted">
          <Clock size={12} />
          <span>{duration}</span>
        </div>
        <div className="font-mono text-muted" style={{ fontVariantNumeric: "tabular-nums" }}>
          {formatTokenCount(totalTokens)} tokens
        </div>
        <div className="font-mono text-muted" style={{ fontVariantNumeric: "tabular-nums" }}>
          ${totalCost.toFixed(3)}
        </div>
      </div>

      {/* Conversation thread */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="mx-auto max-w-3xl space-y-6">
          {messages.map((msg) => {
            if (msg.role === "agent" && msg.tokens) {
              runningCost += msg.tokens * 0.000015; // approximate
            }
            return (
              <MessageBubble
                key={msg.id}
                message={msg}
                runningCost={runningCost}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
