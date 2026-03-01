"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { useGatewayContext } from "@/contexts/gateway-context";
import {
  Cake,
  CirclesThree,
  SpinnerGap,
  Pause,
  Warning,
  CaretDown,
  FileText,
  Check,
  X,
  List,
  Files,
  Toolbox,
  ShootingStar,
  TextB,
  TextItalic,
  TextStrikethrough,
  Code,
  ListBullets,
  ListNumbers,
  Quotes,
  Link as LinkIcon,
  Eye,
  PencilSimple,
  FloppyDisk,
} from "@phosphor-icons/react";
import type { Icon as PhosphorIcon } from "@phosphor-icons/react";
import type {
  AgentWorkspace,
  ConnectionStatus,
  AgentState,
  ModelOption,
} from "@/types";
import { cn } from "@/lib/utils";

/* ── Helpers ── */

function formatModel(model: string): string {
  return model
    .split(/[-/]/)
    .filter((s) => !/^\d/.test(s) && s !== "anthropic" && s !== "openai")
    .slice(0, 2)
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(" ");
}

function formatCurrency(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

function formatTokens(count: number): string {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K`;
  return `${count}`;
}

/* ── Status config ── */

const badgeConfig: Record<
  AgentState,
  { bg: string; label: string; icon: "spinner" | "pause" | "warning" }
> = {
  running: { bg: "bg-accent", label: "Running", icon: "spinner" },
  idle: { bg: "bg-muted", label: "Idle", icon: "pause" },
  error: { bg: "bg-accent-red", label: "Error", icon: "warning" },
};

const statusDotColor: Record<ConnectionStatus, string> = {
  connected: "bg-accent-green",
  degraded: "bg-accent-yellow",
  disconnected: "bg-accent-red",
};

const statusLabelMap: Record<ConnectionStatus, string> = {
  connected: "Connected",
  degraded: "Degraded",
  disconnected: "Disconnected",
};

const BadgeIcon = {
  spinner: SpinnerGap,
  pause: Pause,
  warning: Warning,
};

/* ══════════════════════════════════════════════════════
   LIST VIEW — Agent Card (from Figma design 1)
   Two cards side-by-side, vertical layout with avatar,
   name, meta, divider, and data rows.
   ══════════════════════════════════════════════════════ */

function AgentCard({
  agent,
  isActive,
  agentState: state,
  connectionStatus: connStatus,
  sessionCost,
  sessionTokens,
  lifetimeCost,
  lifetimeTokens,
  onSelect,
}: {
  agent: AgentWorkspace;
  isActive: boolean;
  agentState: AgentState;
  connectionStatus: ConnectionStatus;
  sessionCost: number;
  sessionTokens: number;
  lifetimeCost: number;
  lifetimeTokens: number;
  onSelect: () => void;
}) {
  const badge = isActive ? badgeConfig[state] : badgeConfig.idle;
  const status = isActive ? connStatus : agent.status;
  const Icon = BadgeIcon[badge.icon];

  return (
    <button
      type="button"
      onClick={onSelect}
      className="relative flex-1 min-w-0 bg-card border border-card-border rounded-[16px] p-4 flex flex-col gap-4 text-left cursor-pointer transition-all duration-200 hover:shadow-sm active:scale-[0.99]"
    >
      {/* Avatar */}
      <div className="relative">
        <div
          className="h-[72px] w-[72px] rounded-full flex items-center justify-center overflow-hidden"
          style={{
            background: "linear-gradient(145deg, #f0e6d3, #d4cfc6)",
            border: "2px solid var(--card-border)",
          }}
        >
          <span style={{ fontSize: "40px", filter: "saturate(0.7)" }}>
            {agent.emoji}
          </span>
        </div>
      </div>

      {/* Status badge — top right */}
      <div
        className={cn(
          "absolute top-4 right-4 flex items-center gap-0.5 px-1.5 py-1 rounded-md",
          badge.bg
        )}
      >
        <Icon size={14} weight="bold" className="text-white" />
        <span className="text-sm font-semibold text-white leading-5">
          {badge.label}
        </span>
      </div>

      {/* Name & meta */}
      <div className="flex flex-col gap-2">
        <p className="text-lg font-semibold text-foreground leading-7">
          {agent.name}
        </p>
        <div className="flex items-center gap-1">
          <Cake size={16} weight="regular" className="text-muted shrink-0" />
          <span className="text-sm font-semibold text-muted">
            Created on Feb 24, 2026
          </span>
        </div>
        <div className="flex items-center gap-1">
          <CirclesThree
            size={16}
            weight="regular"
            className="text-muted shrink-0"
          />
          <span className="text-sm font-semibold text-muted">
            Favorite model: {formatModel(agent.model)}
          </span>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-card-border" />

      {/* Data rows */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-muted">Gateway</span>
          <div className="flex items-center gap-1.5">
            <span
              className={cn("h-2 w-2 rounded-full", statusDotColor[status])}
            />
            <span className="text-sm font-medium text-foreground">
              {statusLabelMap[status]}
            </span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-muted">Session</span>
          <p className="text-sm font-medium">
            <span className="text-foreground">
              {formatCurrency(sessionCost)}
            </span>
            <span className="text-muted">/{formatTokens(sessionTokens)}</span>
          </p>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-muted">Lifetime</span>
          <p className="text-sm font-medium">
            <span className="text-foreground">
              {formatCurrency(lifetimeCost)}
            </span>
            <span className="text-muted">/{formatTokens(lifetimeTokens)}</span>
          </p>
        </div>
      </div>
    </button>
  );
}

/* ══════════════════════════════════════════════════════
   DETAIL VIEW — Agent Hero Card (from Figma design 2)
   Full-width horizontal card: left side has avatar + meta,
   right side has status badge + white data panel.
   ══════════════════════════════════════════════════════ */

function AgentHeroCard({
  agent,
  agentState: state,
  connectionStatus: connStatus,
}: {
  agent: AgentWorkspace;
  agentState: AgentState;
  connectionStatus: ConnectionStatus;
}) {
  const badge = badgeConfig[state];
  const Icon = BadgeIcon[badge.icon];

  return (
    <div className="bg-card border border-card-border rounded-[24px] p-6 flex items-center">
      {/* Left — avatar + name/meta in a row */}
      <div className="flex flex-1 gap-4 items-center min-w-0">
        {/* Avatar with status dot */}
        <div className="relative shrink-0">
          <div
            className="h-[76px] w-[76px] rounded-full flex items-center justify-center overflow-hidden"
            style={{
              background: "linear-gradient(145deg, #f0e6d3, #d4cfc6)",
              border: "2px solid var(--card-border)",
            }}
          >
            <span style={{ fontSize: "42px", filter: "saturate(0.7)" }}>
              {agent.emoji}
            </span>
          </div>
          <span
            className={cn(
              "absolute bottom-0 left-0 h-4 w-4 rounded-full border-2 border-card",
              statusDotColor[connStatus]
            )}
          />
        </div>

        {/* Name & meta */}
        <div className="flex flex-col gap-1 min-w-0">
          <p className="text-lg font-semibold text-foreground leading-7">
            {agent.name}
          </p>
          <div className="flex items-center gap-1">
            <Cake size={16} weight="regular" className="text-muted shrink-0" />
            <span className="text-sm font-medium text-muted">
              Created on Feb 24, 2026
            </span>
          </div>
          <div className="flex items-center gap-1">
            <CirclesThree
              size={16}
              weight="regular"
              className="text-muted shrink-0"
            />
            <span className="text-sm font-medium text-muted">
              Favorite model: {formatModel(agent.model)}
            </span>
          </div>
        </div>
      </div>

      {/* Right — status badge */}
      <div
        className={cn(
          "flex items-center gap-0.5 px-1.5 py-1 rounded-md shrink-0",
          badge.bg
        )}
      >
        <Icon size={14} weight="bold" className="text-white" />
        <span className="text-sm font-semibold text-white leading-5">
          {badge.label}
        </span>
      </div>
    </div>
  );
}

/* ── Reusable sub-components ── */

type AgentTab = "details" | "files" | "tools" | "skills";

const tabConfig: { key: AgentTab; label: string; icon: PhosphorIcon }[] = [
  { key: "details", label: "Details", icon: List },
  { key: "files", label: "Files", icon: Files },
  { key: "tools", label: "Tools", icon: Toolbox },
  { key: "skills", label: "Skills", icon: ShootingStar },
];

function Toggle({
  enabled,
  onToggle,
}: {
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      onClick={onToggle}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors duration-150",
        enabled ? "bg-foreground" : "bg-card-border"
      )}
    >
      <span
        className={cn(
          "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform duration-150 mt-[2px]",
          enabled ? "translate-x-5" : "translate-x-0.5"
        )}
      />
    </button>
  );
}

function ModelSelector({
  currentModel,
  availableModels,
  onSelect,
}: {
  currentModel: string;
  availableModels: ModelOption[];
  onSelect: (modelId: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const displayName =
    availableModels.find((m) => m.id === currentModel)?.name ?? currentModel;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label="Select model"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 rounded-md px-2 py-1 text-sm font-mono font-medium text-foreground transition-colors duration-150 hover:bg-card-hover cursor-pointer active:scale-[0.97]"
      >
        {displayName}
        <CaretDown
          size={13}
          weight="bold"
          className={cn(
            "text-muted transition-transform duration-200",
            open && "rotate-180"
          )}
          style={{ transitionTimingFunction: "var(--ease-out)" }}
        />
      </button>
      {open && (
        <div
          className="absolute right-0 top-full mt-2 min-w-56 rounded-lg bg-card py-1.5 border border-card-border animate-dropdown"
          style={{
            zIndex: "var(--z-dropdown)",
            boxShadow: "0 8px 24px var(--shadow-medium)",
          }}
        >
          {availableModels.map((model) => (
            <button
              key={model.id}
              type="button"
              onClick={() => {
                onSelect(model.id);
                setOpen(false);
              }}
              className={cn(
                "flex w-full items-center justify-between px-4 py-2.5 text-sm transition-colors duration-150 hover:bg-card-hover cursor-pointer",
                model.id === currentModel
                  ? "font-semibold text-foreground"
                  : "text-muted"
              )}
            >
              <span>{model.name}</span>
              <span className="text-[11px] text-muted/60">
                {model.provider}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between py-0.5">
      <span className="text-sm text-muted">{label}</span>
      {children}
    </div>
  );
}

/* ── Markdown Editor ── */

function MarkdownEditor({
  initialContent,
  fileName,
  onSave,
}: {
  initialContent: string;
  fileName: string;
  onSave?: (content: string) => void;
}) {
  const [content, setContent] = useState(initialContent);
  const [mode, setMode] = useState<"edit" | "preview">("edit");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const dirty = content !== initialContent;

  const wrapSelection = useCallback(
    (before: string, after: string) => {
      const ta = textareaRef.current;
      if (!ta) return;
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const selected = content.slice(start, end);
      const replacement = `${before}${selected || "text"}${after}`;
      const next =
        content.slice(0, start) + replacement + content.slice(end);
      setContent(next);
      requestAnimationFrame(() => {
        ta.focus();
        ta.selectionStart = start + before.length;
        ta.selectionEnd = start + before.length + (selected || "text").length;
      });
    },
    [content],
  );

  const insertPrefix = useCallback(
    (prefix: string) => {
      const ta = textareaRef.current;
      if (!ta) return;
      const start = ta.selectionStart;
      const lineStart = content.lastIndexOf("\n", start - 1) + 1;
      const next =
        content.slice(0, lineStart) + prefix + content.slice(lineStart);
      setContent(next);
      requestAnimationFrame(() => {
        ta.focus();
        ta.selectionStart = ta.selectionEnd = start + prefix.length;
      });
    },
    [content],
  );

  const toolbarButtons: {
    icon: PhosphorIcon;
    label: string;
    action: () => void;
  }[] = [
    { icon: TextB, label: "Bold", action: () => wrapSelection("**", "**") },
    { icon: TextItalic, label: "Italic", action: () => wrapSelection("_", "_") },
    { icon: TextStrikethrough, label: "Strikethrough", action: () => wrapSelection("~~", "~~") },
    { icon: Code, label: "Code", action: () => wrapSelection("`", "`") },
    { icon: LinkIcon, label: "Link", action: () => wrapSelection("[", "](url)") },
    { icon: Quotes, label: "Quote", action: () => insertPrefix("> ") },
    { icon: ListBullets, label: "Bullet list", action: () => insertPrefix("- ") },
    { icon: ListNumbers, label: "Numbered list", action: () => insertPrefix("1. ") },
  ];

  // Simple markdown → HTML for preview
  const renderPreview = (md: string) => {
    let html = md
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
    // headings
    html = html.replace(/^### (.+)$/gm, '<h3 class="text-base font-semibold mt-3 mb-1">$1</h3>');
    html = html.replace(/^## (.+)$/gm, '<h2 class="text-lg font-semibold mt-4 mb-1">$1</h2>');
    html = html.replace(/^# (.+)$/gm, '<h1 class="text-xl font-semibold mt-4 mb-2">$1</h1>');
    // bold, italic, strikethrough, code
    html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    html = html.replace(/_(.+?)_/g, "<em>$1</em>");
    html = html.replace(/~~(.+?)~~/g, "<del>$1</del>");
    html = html.replace(/`(.+?)`/g, '<code class="rounded bg-background px-1 py-0.5 font-mono text-sm">$1</code>');
    // bullet lists
    html = html.replace(/^- (.+)$/gm, '<li class="ml-4 list-disc">$1</li>');
    // blockquote
    html = html.replace(/^&gt; (.+)$/gm, '<blockquote class="border-l-2 border-card-border pl-3 text-muted italic">$1</blockquote>');
    // line breaks
    html = html.replace(/\n/g, "<br />");
    return html;
  };

  return (
    <div className="bg-card border border-card-border rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center gap-0.5 px-3 py-2 border-b border-card-border">
        <div className="flex items-center gap-0.5 flex-1">
          {toolbarButtons.map((btn) => {
            const BtnIcon = btn.icon;
            return (
              <button
                key={btn.label}
                type="button"
                aria-label={btn.label}
                onClick={btn.action}
                disabled={mode === "preview"}
                className="p-1.5 rounded-md text-muted hover:text-foreground hover:bg-background transition-colors duration-150 cursor-pointer disabled:opacity-30 disabled:cursor-default"
              >
                <BtnIcon size={16} weight="bold" />
              </button>
            );
          })}

          <div className="h-4 w-px bg-card-border mx-1" />

          {/* Edit / Preview toggle */}
          <button
            type="button"
            onClick={() => setMode(mode === "edit" ? "preview" : "edit")}
            className={cn(
              "flex items-center gap-1 px-2 py-1 rounded-md text-sm font-medium transition-colors duration-150 cursor-pointer",
              mode === "preview"
                ? "bg-background text-foreground"
                : "text-muted hover:text-foreground",
            )}
          >
            {mode === "edit" ? (
              <>
                <Eye size={14} weight="bold" />
                Preview
              </>
            ) : (
              <>
                <PencilSimple size={14} weight="bold" />
                Edit
              </>
            )}
          </button>
        </div>

        {/* Save */}
        {dirty && onSave && (
          <button
            type="button"
            onClick={() => onSave(content)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-foreground text-card text-sm font-semibold transition-opacity duration-150 hover:opacity-90 cursor-pointer"
          >
            <FloppyDisk size={14} weight="bold" />
            Save
          </button>
        )}
      </div>

      {/* Content area */}
      {mode === "edit" ? (
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          spellCheck={false}
          className="w-full min-h-[240px] max-h-[480px] resize-y bg-card p-4 font-mono text-sm leading-relaxed text-foreground outline-none placeholder:text-muted/50"
          placeholder="Write markdown…"
        />
      ) : (
        <div
          className="w-full min-h-[240px] max-h-[480px] overflow-y-auto p-4 text-sm leading-relaxed text-foreground prose-sm"
          dangerouslySetInnerHTML={{ __html: renderPreview(content) }}
        />
      )}

      {/* Footer */}
      <div className="flex items-center justify-between px-3 py-1.5 border-t border-card-border text-xs text-muted">
        <span>{fileName}</span>
        <span>{content.length} chars</span>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   PAGE
   ══════════════════════════════════════════════════════ */

export default function AgentsPage() {
  const {
    agentWorkspaces,
    toggleAgentTool,
    skillsFull,
    settings,
    updateSettings,
    connectionStatus,
    agentState,
    costSnapshot,
    health,
    activeAgent,
  } = useGatewayContext();

  // Read ?id= query param to deep-link to an agent
  const searchParams = useSearchParams();
  const initialId = searchParams.get("id");

  // null = list view, string = detail view for that agent
  const [selectedId, setSelectedId] = useState<string | null>(initialId);
  const [activeTab, setActiveTab] = useState<AgentTab>("details");

  const selectedAgent = selectedId
    ? agentWorkspaces.find((a) => a.id === selectedId)
    : null;

  function getAgentData(agent: AgentWorkspace) {
    const isActive =
      agent.id === activeAgent.id || agent.id === agentWorkspaces[0]?.id;
    return {
      isActive,
      agentState: isActive ? agentState : ("idle" as AgentState),
      sessionCost: isActive ? costSnapshot.todaySpend : 0,
      sessionTokens: isActive ? costSnapshot.todayTokens : 0,
      lifetimeCost: isActive ? costSnapshot.todaySpend * 5 : 0,
      lifetimeTokens: isActive ? health.tokenCount : 0,
    };
  }

  /* ── Detail view ── */
  if (selectedAgent) {
    const data = getAgentData(selectedAgent);

    return (
      <div className="flex flex-col px-4 py-8 lg:px-0 lg:py-0">
        {/* Breadcrumb header */}
        <div className="flex items-center justify-between h-9">
          <h1 className="text-xl font-semibold leading-7">
            <button
              type="button"
              onClick={() => setSelectedId(null)}
              className="text-muted hover:text-foreground transition-colors duration-150 cursor-pointer"
            >
              Agents
            </button>
            <span className="text-muted"> / </span>
            <span className="text-foreground">{selectedAgent.name}</span>
          </h1>
        </div>

        <div className="flex flex-col gap-3 mt-8">
          {/* Hero card */}
          <AgentHeroCard
            agent={selectedAgent}
            agentState={data.agentState}
            connectionStatus={connectionStatus}
          />

          {/* Tabs — icon + label, equal width */}
          <div className="flex gap-1.5">
            {tabConfig.map((tab) => {
              const TabIcon = tab.icon;
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-base font-semibold transition-colors duration-150 cursor-pointer active:scale-[0.98]",
                    isActive
                      ? "bg-background text-foreground"
                      : "bg-card text-foreground hover:bg-background/50"
                  )}
                >
                  <TabIcon size={20} weight="regular" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Tab content */}
          {activeTab === "details" && (
            <div className="flex flex-col gap-3">
              <div className="bg-card border border-card-border rounded-lg p-4">
                <p className="text-base font-semibold text-muted mb-3">
                  Configuration
                </p>
                <div className="flex flex-col gap-2">
                  <Row label="Gateway">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={cn(
                          "h-2 w-2 rounded-full",
                          statusDotColor[connectionStatus]
                        )}
                      />
                      <span className="text-sm font-medium text-foreground">
                        {statusLabelMap[connectionStatus]}
                      </span>
                    </div>
                  </Row>
                  <Row label="Session">
                    <p className="text-sm font-medium">
                      <span className="text-foreground">
                        {formatCurrency(data.sessionCost)}
                      </span>
                      <span className="text-muted">
                        /{formatTokens(data.sessionTokens)}
                      </span>
                    </p>
                  </Row>
                  <Row label="Lifetime">
                    <p className="text-sm font-medium">
                      <span className="text-foreground">
                        {formatCurrency(data.lifetimeCost)}
                      </span>
                      <span className="text-muted">
                        /{formatTokens(data.lifetimeTokens)}
                      </span>
                    </p>
                  </Row>
                  <Row label="Model">
                    <ModelSelector
                      currentModel={selectedAgent.model}
                      availableModels={settings.availableModels}
                      onSelect={(modelId) =>
                        updateSettings({ selectedModel: modelId })
                      }
                    />
                  </Row>
                  <Row label="Status">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={cn(
                          "h-2 w-2 rounded-full",
                          statusDotColor[selectedAgent.status]
                        )}
                      />
                      <span className="text-sm font-semibold capitalize">
                        {selectedAgent.status}
                      </span>
                    </div>
                  </Row>
                  <Row label="Auto Build">
                    <span className="text-sm font-semibold">
                      {selectedAgent.autoBuild ? "Enabled" : "Disabled"}
                    </span>
                  </Row>
                  <Row label="Workspace">
                    <span className="font-mono text-xs text-muted truncate max-w-[280px]">
                      {selectedAgent.workspacePath}
                    </span>
                  </Row>
                  {selectedAgent.identityFile && (
                    <Row label="Identity">
                      <span className="font-mono text-xs text-muted truncate max-w-[280px]">
                        {selectedAgent.identityFile}
                      </span>
                    </Row>
                  )}
                  {selectedAgent.personaFile && (
                    <Row label="Persona">
                      <span className="font-mono text-xs text-muted truncate max-w-[280px]">
                        {selectedAgent.personaFile}
                      </span>
                    </Row>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "files" && (
            <div className="flex flex-col gap-3">
              {selectedAgent.files.length === 0 ? (
                <p className="py-8 text-sm text-muted text-center">
                  No files in this workspace
                </p>
              ) : (
                selectedAgent.files.map((file) => (
                  <MarkdownEditor
                    key={file.id}
                    initialContent={file.content ?? ""}
                    fileName={file.name}
                  />
                ))
              )}
            </div>
          )}

          {activeTab === "tools" && (
            <div className="flex flex-col gap-2">
              {selectedAgent.tools.map((tool) => (
                <div
                  key={tool.name}
                  className="flex items-center justify-between bg-card border border-card-border rounded-lg px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    {tool.allowed ? (
                      <Check
                        size={14}
                        weight="bold"
                        className="text-accent-green"
                      />
                    ) : (
                      <X
                        size={14}
                        weight="bold"
                        className="text-accent-red"
                      />
                    )}
                    <span className="font-mono text-sm">{tool.name}</span>
                    {tool.profile && (
                      <span className="rounded-md bg-card px-2 py-0.5 text-[10px] text-muted">
                        {tool.profile}
                      </span>
                    )}
                  </div>
                  <Toggle
                    enabled={tool.allowed}
                    onToggle={() =>
                      toggleAgentTool(selectedAgent.id, tool.name)
                    }
                  />
                </div>
              ))}
            </div>
          )}

          {activeTab === "skills" && (
            <div className="flex flex-col gap-2">
              {skillsFull.map((skill) => {
                const allowed =
                  selectedAgent.skillAllowlist.includes(skill.name);
                return (
                  <div
                    key={skill.id}
                    className="flex items-center gap-3 bg-card border border-card-border rounded-lg px-4 py-3"
                  >
                    <span
                      className={cn(
                        "h-2 w-2 rounded-full shrink-0",
                        allowed ? "bg-accent-green" : "bg-card-border"
                      )}
                    />
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-semibold">
                        {skill.name}
                      </span>
                      {allowed && (
                        <span className="ml-2 text-[10px] text-accent-green font-semibold">
                          Allowed
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-muted">{skill.type}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  /* ── List view ── */
  return (
    <div className="flex flex-col px-4 py-8 lg:px-0 lg:py-0">
      {/* Page title */}
      <div className="flex items-center justify-between h-9">
        <h1 className="text-xl font-semibold text-foreground">Agents</h1>
        <span className="text-base font-semibold text-muted">
          {agentWorkspaces.length} workspaces
        </span>
      </div>

      {/* Agent cards — stacked */}
      <div className="flex flex-col gap-3 mt-8">
        {agentWorkspaces.map((agent) => {
          const data = getAgentData(agent);
          return (
            <AgentCard
              key={agent.id}
              agent={agent}
              isActive={data.isActive}
              agentState={data.agentState}
              connectionStatus={connectionStatus}
              sessionCost={data.sessionCost}
              sessionTokens={data.sessionTokens}
              lifetimeCost={data.lifetimeCost}
              lifetimeTokens={data.lifetimeTokens}
              onSelect={() => {
                setSelectedId(agent.id);
                setActiveTab("details");
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
