"use client";

import { useState, useRef, useEffect } from "react";
import { useGatewayContext } from "@/contexts/gateway-context";
import {
  Robot,
  Star,
  CaretDown,
  FileText,
  Check,
  X,
} from "@phosphor-icons/react";
import type { AgentWorkspace, ModelOption } from "@/types";
import { cn } from "@/lib/utils";

type AgentTab = "overview" | "files" | "tools" | "skills";

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

const statusDotColor: Record<string, string> = {
  connected: "bg-accent-green",
  degraded: "bg-accent-yellow",
  disconnected: "bg-accent-red",
};

export default function AgentsPage() {
  const {
    agentWorkspaces,
    toggleAgentTool,
    skillsFull,
    settings,
    updateSettings,
  } = useGatewayContext();
  const [selectedId, setSelectedId] = useState<string>(
    agentWorkspaces[0]?.id ?? ""
  );
  const [activeTab, setActiveTab] = useState<AgentTab>("overview");

  const selectedAgent = agentWorkspaces.find((a) => a.id === selectedId);

  const tabs: { key: AgentTab; label: string }[] = [
    { key: "overview", label: "Overview" },
    { key: "files", label: "Files" },
    { key: "tools", label: "Tools" },
    { key: "skills", label: "Skills" },
  ];

  return (
    <div className="flex flex-col px-4 py-8 lg:px-0 lg:py-0">
      {/* Page title */}
      <div className="flex items-center justify-between h-9">
        <h1 className="text-xl font-semibold text-foreground">Agents</h1>
        <span className="text-base font-semibold text-muted">
          {agentWorkspaces.length} workspaces
        </span>
      </div>

      <div className="flex flex-col gap-3 mt-8">
        {/* Agent selector */}
        <div className="flex flex-col gap-2">
          {agentWorkspaces.map((agent) => {
            const selected = selectedId === agent.id;
            return (
              <button
                key={agent.id}
                type="button"
                onClick={() => {
                  setSelectedId(agent.id);
                  setActiveTab("overview");
                }}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-4 py-3 text-left transition-colors duration-150 cursor-pointer",
                  selected
                    ? "bg-foreground text-card"
                    : "bg-background hover:bg-background/80"
                )}
              >
                <span className="text-xl">{agent.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-semibold truncate">
                      {agent.name}
                    </span>
                    {agent.isDefault && (
                      <Star
                        size={12}
                        weight="fill"
                        className={selected ? "text-card" : "text-accent-yellow"}
                      />
                    )}
                  </div>
                  <p
                    className={cn(
                      "text-xs truncate",
                      selected ? "text-card/60" : "text-muted"
                    )}
                  >
                    {agent.model
                      .split("-")
                      .slice(0, 2)
                      .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
                      .join(" ")}
                  </p>
                </div>
                <span
                  className={cn(
                    "h-2 w-2 rounded-full shrink-0",
                    statusDotColor[agent.status]
                  )}
                />
              </button>
            );
          })}
        </div>

        {/* Selected agent detail */}
        {selectedAgent && (
          <>
            {/* Tabs */}
            <div className="flex gap-1 pt-2">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-sm font-semibold transition-colors duration-150 cursor-pointer active:scale-[0.97]",
                    activeTab === tab.key
                      ? "bg-foreground text-card"
                      : "text-muted hover:text-foreground hover:bg-background"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab content */}
            {activeTab === "overview" && (
              <div className="flex flex-col gap-3">
                <div className="bg-background rounded-lg p-4">
                  <p className="text-base font-semibold text-muted mb-3">
                    Configuration
                  </p>
                  <div className="flex flex-col gap-2">
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
              <div className="flex flex-col gap-2">
                {selectedAgent.files.length === 0 ? (
                  <p className="py-8 text-sm text-muted text-center">
                    No files in this workspace
                  </p>
                ) : (
                  selectedAgent.files.map((file) => (
                    <div
                      key={file.id}
                      className="bg-background rounded-lg p-4"
                    >
                      <div className="flex items-center gap-2">
                        <FileText
                          size={16}
                          weight="regular"
                          className="text-muted shrink-0"
                        />
                        <span className="text-sm font-semibold">
                          {file.name}
                        </span>
                        <span className="text-xs text-muted">
                          {file.size < 1024
                            ? `${file.size} B`
                            : `${(file.size / 1024).toFixed(1)} KB`}
                        </span>
                      </div>
                      {file.content && (
                        <pre className="mt-3 rounded-md bg-card p-3 font-mono text-xs leading-relaxed text-muted overflow-x-auto max-h-32 overflow-y-auto">
                          {file.content}
                        </pre>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === "tools" && (
              <div className="flex flex-col gap-2">
                {selectedAgent.tools.map((tool) => (
                  <div
                    key={tool.name}
                    className="flex items-center justify-between bg-background rounded-lg px-4 py-3"
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
                      className="flex items-center gap-3 bg-background rounded-lg px-4 py-3"
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
          </>
        )}
      </div>
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
