"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useGatewayConnection } from "@/hooks/use-gateway-connection";
import {
  mockAgent,
  mockAgents,
  mockFiles,
  mockSkills,
  mockMessages,
  mockHealth,
  mockChannels,
  mockSkillsFull,
  mockCronJobs,
  mockNodes,
  mockSettings,
  mockInstances,
  mockSessions,
  mockUsageData,
  mockAgentWorkspaces,
  mockConfigSections,
  mockDebugSnapshot,
  mockDebugEvents,
  mockLogEntries,
  mockActivityEvents,
  mockCostSnapshot,
  mockChannelHealth,
  mockAgentState,
  mockHeatmap,
  mockTasks,
  mockMemories,
  mockAgentDesks,
} from "@/lib/mock-data";
import type {
  Agent,
  AgentFile,
  Skill,
  ChatMessage,
  GatewayHealth,
  ConnectionStatus,
  Channel,
  SkillFull,
  SkillType,
  SkillDependency,
  CronJob,
  CronSchedule,
  CronRun,
  Node,
  Settings,
  Instance,
  Session,
  SessionKind,
  UsageData,
  AgentWorkspace,
  ConfigSection,
  DebugSnapshot,
  DebugEvent,
  LogEntry,
  ThinkingLevel,
  ActivityEvent,
  CostSnapshot,
  ChannelHealth,
  AgentState,
  Task,
  TaskStatus,
  Memory,
  AgentDesk,
  DailySpend,
  ModelCost,
} from "@/types";
import type { GatewayContextValue } from "@/contexts/gateway-context";

// ─── Model colors ──────────────────────────────────────────────────────────────

const MODEL_COLORS = [
  "#4ade80", "#60a5fa", "#f59e0b", "#a78bfa", "#f87171",
  "#34d399", "#fb923c", "#38bdf8", "#e879f9", "#a3e635",
];

// ─── Cost API response types ───────────────────────────────────────────────────

interface CostApiDailyTrend {
  date: string;
  cost: number;
  tokens: number;
}

interface CostApiModelSplit {
  model: string;
  cost: number;
  tokens: number;
  percentage: number;
}

interface CostApiSummary {
  todaySpend: number;
  todayTokens: number;
  dailyTrend: CostApiDailyTrend[];
  modelSplit: CostApiModelSplit[];
  projectedMonthly: number;
  lifetimeCost?: number;
}

interface CostApiBurnRate {
  tokensPerMinute: number;
  costPerHour: number;
  isIdle: boolean;
  timeToLimitHours: number | null;
}

interface CostApiHeatmap {
  cells: { day: string; hour: number; messages: number; tokens: number; cost?: number }[];
  maxMessages: number;
  maxTokens?: number;
  days: string[];
  currentStreak: number;
  longestStreak: number;
}

interface CostApiSession {
  filename: string;
  sessionId?: string | null;
  messageCount: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  totalCacheReadTokens: number;
  totalCacheWriteTokens: number;
  firstTimestamp: string | null;
  lastTimestamp: string | null;
  models: string[];
  totalCost?: number;
}

interface CostApiResponse {
  available: boolean;
  cost: CostApiSummary | null;
  burnRate: CostApiBurnRate | null;
  heatmap: CostApiHeatmap | null;
  sessions: CostApiSession[];
}

// ─── Sessions API response types ──────────────────────────────────────────────

interface SessionsApiSession {
  filename: string;
  messageCount: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  totalCacheReadTokens: number;
  totalCacheWriteTokens: number;
  firstTimestamp: string | null;
  lastTimestamp: string | null;
  models: string[];
}

interface SessionsApiResponse {
  available: boolean;
  path: string;
  files: number;
  totalSizeBytes?: number;
  sessions: SessionsApiSession[];
}

// ─── Gateway RPC response types ────────────────────────────────────────────────

interface GatewaySkill {
  id?: string;
  name: string;
  description?: string;
  enabled?: boolean;
  active?: boolean;
  type?: string;
  version?: string;
  author?: string;
  updatedAt?: string;
  dependencies?: { name: string; met?: boolean; version?: string }[];
}

interface GatewayCronJob {
  id?: string;
  name?: string;
  description?: string;
  enabled?: boolean;
  schedule?: string;
  cronExpr?: string;
  cron?: string;
  readable?: string;
  nextRun?: string;
  lastRun?: string;
  payload?: string;
  deliveryChannel?: string;
  runs?: {
    id?: string;
    startedAt?: string;
    completedAt?: string;
    status?: string;
    durationMs?: number;
    output?: string;
    error?: string;
  }[];
}

interface GatewayChannel {
  id?: string;
  name?: string;
  provider?: string;
  status?: string;
}

interface GatewayModel {
  id?: string;
  modelId?: string;
  name?: string;
  provider?: string;
}

// ─── Budget config ─────────────────────────────────────────────────────────────

interface BudgetConfig {
  daily?: { enabled: boolean; amount: number } | null;
  monthly?: { enabled: boolean; amount: number } | null;
}

// ─── Mapping helpers ───────────────────────────────────────────────────────────

function mapApiSessionsToSessions(apiSessions: SessionsApiSession[]): Session[] {
  return apiSessions
    .filter((s) => s.lastTimestamp || s.firstTimestamp)
    .map((s, i) => {
      const filename = s.filename;
      const key = filename.replace(/\.jsonl$/, "");
      const updatedAt = s.lastTimestamp ? new Date(s.lastTimestamp) : new Date();
      const totalTokens =
        s.totalInputTokens + s.totalOutputTokens +
        s.totalCacheReadTokens + s.totalCacheWriteTokens;

      // Infer kind: if looks like UUID, it's a main chat session
      // Cron sessions often have descriptive names
      let kind: SessionKind = "chat";
      if (key.includes("cron") || key.includes("schedule")) kind = "cron";
      else if (key.includes("api") || key.includes("hook")) kind = "api";
      else if (key.includes("system") || key.includes("sys")) kind = "system";

      const label = s.firstTimestamp
        ? new Date(s.firstTimestamp).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })
        : `Session ${i + 1}`;

      return {
        id: key,
        key,
        label,
        kind,
        updatedAt,
        tokens: totalTokens,
        thinkingLevel: "low" as ThinkingLevel,
        verbose: false,
        reasoning: false,
      };
    })
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
}

function mapCostToSnapshot(
  cost: CostApiSummary,
  burnRate: CostApiBurnRate | null,
  dailyBudget: number | null
): CostSnapshot {
  const coloredModelSplit: ModelCost[] = cost.modelSplit.map((m, i) => ({
    model: m.model,
    cost: m.cost,
    percentage: m.percentage,
    color: MODEL_COLORS[i % MODEL_COLORS.length],
  }));

  const dailyTrend: DailySpend[] = cost.dailyTrend.map((d) => ({
    date: d.date,
    cost: d.cost,
    tokens: d.tokens,
  }));

  return {
    todaySpend: cost.todaySpend,
    todayTokens: cost.todayTokens,
    dailyBudget,
    burnRatePerHour: burnRate?.costPerHour ?? 0,
    burnRateTokensPerMin: burnRate?.tokensPerMinute ?? 0,
    timeToLimitHours: burnRate?.timeToLimitHours ?? null,
    isIdle: burnRate?.isIdle ?? true,
    projectedMonthly: cost.projectedMonthly,
    dailyTrend,
    modelSplit: coloredModelSplit,
  };
}

function mapGatewaySkills(skills: GatewaySkill[]): SkillFull[] {
  return skills.map((s, i) => ({
    id: s.id ?? `skill-${i}`,
    name: s.name,
    description: s.description ?? "",
    active: s.enabled ?? s.active ?? false,
    type: (s.type as SkillType) ?? "managed",
    version: s.version ?? "1.0.0",
    author: s.author,
    updatedAt: s.updatedAt ? new Date(s.updatedAt) : new Date(),
    dependencies: (s.dependencies ?? []).map((d) => ({
      name: d.name,
      met: d.met ?? true,
      version: d.version,
    })) as SkillDependency[],
  }));
}

function mapGatewayCronJobs(jobs: GatewayCronJob[]): CronJob[] {
  return jobs.map((j, i) => {
    const scheduleExpr = j.cronExpr ?? j.cron ?? j.schedule ?? "* * * * *";
    const schedule: CronSchedule = {
      type: scheduleExpr.includes(" ") ? "cron" : "every",
      expression: scheduleExpr,
      readable: j.readable ?? scheduleExpr,
    };

    const runs: CronRun[] = (j.runs ?? []).map((r, ri) => ({
      id: r.id ?? `run-${ri}`,
      startedAt: r.startedAt ? new Date(r.startedAt) : new Date(),
      completedAt: r.completedAt ? new Date(r.completedAt) : undefined,
      status: (r.status as CronRun["status"]) ?? "success",
      durationMs: r.durationMs,
      output: r.output,
      error: r.error,
    }));

    return {
      id: j.id ?? `cron-${i}`,
      name: j.name ?? `Cron Job ${i + 1}`,
      description: j.description ?? "",
      enabled: j.enabled ?? true,
      schedule,
      nextRun: j.nextRun ? new Date(j.nextRun) : undefined,
      lastRun: j.lastRun ? new Date(j.lastRun) : undefined,
      payload: j.payload,
      deliveryChannel: j.deliveryChannel,
      runs,
    };
  });
}

function mapGatewayChannels(channels: GatewayChannel[]): ChannelHealth[] {
  return channels.map((ch) => ({
    name: ch.name ?? ch.provider ?? "Unknown",
    provider: ch.provider ?? "unknown",
    status: (ch.status === "connected"
      ? "connected"
      : ch.status === "degraded"
      ? "degraded"
      : "disconnected") as ConnectionStatus,
  }));
}

// ─── Main hook ────────────────────────────────────────────────────────────────

export function useGateway(): GatewayContextValue {
  // ─── Config ─────────────────────────────────────────────────────────────────
  const [gatewayUrl, setGatewayUrl] = useState("ws://127.0.0.1:18789");
  const [gatewayToken, setGatewayToken] = useState("");
  const [configLoaded, setConfigLoaded] = useState(false);
  const [dailyBudget, setDailyBudget] = useState<number | null>(null);

  // ─── WebSocket connection ───────────────────────────────────────────────────
  const {
    connectionState,
    events: wsEvents,
    rpc,
    connect,
  } = useGatewayConnection(gatewayUrl, gatewayToken);

  // ─── Real data state ─────────────────────────────────────────────────────────
  const [costSnapshot, setCostSnapshot] = useState<CostSnapshot>(mockCostSnapshot);
  const [costLoaded, setCostLoaded] = useState(false);
  const [sessions, setSessions] = useState<Session[]>(mockSessions);
  const [sessionsLoaded, setSessionsLoaded] = useState(false);
  const [skillsFull, setSkillsFull] = useState<SkillFull[]>(mockSkillsFull);
  const [cronJobs, setCronJobs] = useState<CronJob[]>(mockCronJobs);
  const [channelHealth, setChannelHealth] = useState<ChannelHealth[]>(mockChannelHealth);
  const [agentState, setAgentState] = useState<AgentState>(mockAgentState);
  const [activityEvents, setActivityEvents] = useState<ActivityEvent[]>(mockActivityEvents);
  const [heatmap, setHeatmap] = useState(mockHeatmap);
  const [activeModel, setActiveModel] = useState(mockAgent.model);

  // ─── Static mock state (unchanged) ──────────────────────────────────────────
  const [connectionStatus, setConnectionStatusState] = useState<ConnectionStatus>("disconnected");
  const [activeAgent, setActiveAgent] = useState<Agent>({ ...mockAgent });
  const [agents] = useState<Agent[]>(mockAgents);
  const [files] = useState<AgentFile[]>(mockFiles);
  const [skills] = useState<Skill[]>(mockSkills);
  const [messages, setMessages] = useState<ChatMessage[]>(mockMessages);
  const [health] = useState<GatewayHealth>(mockHealth);
  const [autoBuild, setAutoBuild] = useState(mockAgent.autoBuild);
  const [selectedFile, setSelectedFile] = useState<AgentFile | null>(null);
  const [channels, setChannels] = useState<Channel[]>(mockChannels);
  const [nodes, setNodes] = useState(mockNodes);
  const [settings, setSettings] = useState<Settings>(mockSettings);
  const [instances] = useState<Instance[]>(mockInstances);
  const [usageData] = useState<UsageData>(mockUsageData);
  const [agentWorkspaces, setAgentWorkspaces] = useState(mockAgentWorkspaces);
  const [configSections, setConfigSections] = useState(mockConfigSections);
  const [debugSnapshot] = useState<DebugSnapshot>(mockDebugSnapshot);
  const [debugEvents] = useState<DebugEvent[]>(mockDebugEvents);
  const [logEntries] = useState<LogEntry[]>(mockLogEntries);
  const [tasks, setTasks] = useState(mockTasks);
  const [memories] = useState<Memory[]>(mockMemories);
  const [agentDesks] = useState(mockAgentDesks);

  // Track whether we've received any real events
  const hadRealEventsRef = useRef(false);

  // ─── Derived connection status ───────────────────────────────────────────────
  useEffect(() => {
    const status: ConnectionStatus =
      connectionState === "connected"
        ? "connected"
        : connectionState === "reconnecting" ||
          connectionState === "connecting" ||
          connectionState === "challenged" ||
          connectionState === "authenticating"
        ? "degraded"
        : "disconnected";
    setConnectionStatusState(status);
  }, [connectionState]);

  // ─── Load config ─────────────────────────────────────────────────────────────
  useEffect(() => {
    fetch("/api/config")
      .then((r) => r.json())
      .then((data: { found: boolean; gatewayUrl: string; token: string | null }) => {
        if (data.gatewayUrl) setGatewayUrl(data.gatewayUrl);
        if (data.token) setGatewayToken(data.token);
        setConfigLoaded(true);
      })
      .catch(() => setConfigLoaded(true));
  }, []);

  // ─── Load budget config ──────────────────────────────────────────────────────
  useEffect(() => {
    fetch("/api/budget")
      .then((r) => r.json())
      .then((data: BudgetConfig) => {
        if (data.daily?.enabled && data.daily.amount) {
          setDailyBudget(data.daily.amount);
        }
      })
      .catch(() => {});
  }, []);

  // ─── Connect when config is ready ────────────────────────────────────────────
  useEffect(() => {
    if (configLoaded && gatewayToken) {
      connect();
    }
  }, [configLoaded, gatewayToken, connect]);

  // ─── Fetch cost data ─────────────────────────────────────────────────────────
  const fetchCost = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (dailyBudget !== null) params.set("dailyBudget", String(dailyBudget));
      const resp = await fetch(`/api/cost?${params}`);
      if (!resp.ok) return;
      const data: CostApiResponse = await resp.json();

      if (data.available && data.cost) {
        const snapshot = mapCostToSnapshot(data.cost, data.burnRate, dailyBudget);
        setCostSnapshot(snapshot);
        setCostLoaded(true);

        // Update heatmap from cost API
        if (data.heatmap) {
          setHeatmap({
            cells: data.heatmap.cells.map((c) => ({
              day: c.day,
              hour: c.hour,
              messages: c.messages,
              tokens: c.tokens,
            })),
            maxMessages: data.heatmap.maxMessages,
            days: data.heatmap.days,
            currentStreak: data.heatmap.currentStreak,
            longestStreak: data.heatmap.longestStreak,
          });
        }
      } else if (!data.available) {
        setCostLoaded(true);
      }
    } catch {
      // keep mock data on error
    }
  }, [dailyBudget]);

  useEffect(() => {
    fetchCost();
    const interval = setInterval(fetchCost, 30_000);
    return () => clearInterval(interval);
  }, [fetchCost]);

  // ─── Fetch sessions ──────────────────────────────────────────────────────────
  const fetchSessions = useCallback(async () => {
    try {
      const resp = await fetch("/api/sessions");
      if (!resp.ok) return;
      const data: SessionsApiResponse = await resp.json();
      if (data.available && data.sessions.length > 0) {
        setSessions(mapApiSessionsToSessions(data.sessions));
        setSessionsLoaded(true);
      }
    } catch {
      // keep mock data
    }
  }, []);

  useEffect(() => {
    fetchSessions();
    const interval = setInterval(fetchSessions, 30_000);
    return () => clearInterval(interval);
  }, [fetchSessions]);

  // ─── Fetch gateway data when connected ────────────────────────────────────────
  useEffect(() => {
    if (connectionState !== "connected") return;

    // Fetch skills
    rpc<{ skills?: GatewaySkill[] }>("skills.list").then((data) => {
      if (data?.skills && data.skills.length > 0) {
        setSkillsFull(mapGatewaySkills(data.skills));
      }
    });

    // Fetch cron jobs
    rpc<{ jobs?: GatewayCronJob[] }>("cron.list").then((data) => {
      if (data?.jobs && data.jobs.length > 0) {
        setCronJobs(mapGatewayCronJobs(data.jobs));
      }
    });

    // Fetch channel status
    rpc<{ channels?: GatewayChannel[] }>("channels.status").then((data) => {
      if (data?.channels && data.channels.length > 0) {
        setChannelHealth(mapGatewayChannels(data.channels));
      }
    });

    // Fetch models
    rpc<{ models?: GatewayModel[] }>("models.list").then((data) => {
      if (data?.models && data.models.length > 0) {
        const model = data.models[0];
        const modelId = model.modelId ?? model.id ?? model.name ?? mockAgent.model;
        setActiveModel(modelId);
        setActiveAgent((prev) => ({ ...prev, model: modelId }));
        setSettings((prev) => ({ ...prev, selectedModel: modelId }));
      }
    });
  }, [connectionState, rpc]);

  // ─── Process WebSocket events ────────────────────────────────────────────────
  useEffect(() => {
    if (!wsEvents || wsEvents.length === 0) return;

    // wsEvents is prepend-ordered (newest first), provided by useGatewayConnection
    // Switch from mock data to real data once we get real events
    if (!hadRealEventsRef.current) {
      hadRealEventsRef.current = true;
    }

    // Use live events directly (they are already ActivityEvent[], newest first)
    setActivityEvents(wsEvents);

    // Update agent state from most recent event
    const latestEvent = wsEvents[0];
    if (latestEvent) {
      if (latestEvent.type === "skill" || latestEvent.type === "session") {
        setAgentState("running");
      } else if (latestEvent.type === "message") {
        setAgentState("running");
        setTimeout(() => {
          setAgentState((current) => (current === "running" ? "idle" : current));
        }, 5000);
      }
    }
  }, [wsEvents]);

  // ─── Reset to idle when disconnected ────────────────────────────────────────
  useEffect(() => {
    if (connectionState === "disconnected") {
      setAgentState("idle");
    }
  }, [connectionState]);

  // ─── Actions ─────────────────────────────────────────────────────────────────

  const setConnectionStatus = useCallback((status: ConnectionStatus) => {
    setConnectionStatusState(status);
  }, []);

  const sendMessage = useCallback((content: string) => {
    const userMessage: ChatMessage = {
      id: `m-${Date.now()}`,
      role: "user",
      content,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setTimeout(() => {
      const agentMessage: ChatMessage = {
        id: `m-${Date.now() + 1}`,
        role: "agent",
        content: `Received: "${content}". Connect to OpenClaw gateway for live responses.`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, agentMessage]);
    }, 1200);
  }, []);

  const toggleAutoBuild = useCallback(() => {
    setAutoBuild((prev) => !prev);
  }, []);

  const selectAgent = useCallback(
    (agentId: string) => {
      const agent = agents.find((a) => a.id === agentId);
      if (agent) setActiveAgent(agent);
    },
    [agents]
  );

  const toggleChannel = useCallback((channelId: string) => {
    setChannels((prev) =>
      prev.map((ch) =>
        ch.id === channelId
          ? { ...ch, enabled: !ch.enabled, status: !ch.enabled ? "connected" : "disconnected" }
          : ch
      )
    );
  }, []);

  const toggleSkillFull = useCallback(
    (skillId: string) => {
      setSkillsFull((prev) =>
        prev.map((s) => (s.id === skillId ? { ...s, active: !s.active } : s))
      );
      // Also call gateway RPC
      const skill = skillsFull.find((s) => s.id === skillId);
      if (skill) {
        rpc(skill.active ? "skills.disable" : "skills.enable", { skillId });
      }
    },
    [skillsFull, rpc]
  );

  const toggleCronJob = useCallback(
    (jobId: string) => {
      const job = cronJobs.find((j) => j.id === jobId);
      // Optimistic update
      setCronJobs((prev) =>
        prev.map((j) => (j.id === jobId ? { ...j, enabled: !j.enabled } : j))
      );
      // Gateway RPC
      if (job) {
        rpc(job.enabled ? "cron.disable" : "cron.enable", { jobId });
      }
    },
    [cronJobs, rpc]
  );

  const runCronJob = useCallback(
    (jobId: string) => {
      // Gateway RPC
      rpc("cron.run", { jobId, force: true });

      setCronJobs((prev) =>
        prev.map((j) => {
          if (j.id !== jobId) return j;
          const newRun: CronRun = {
            id: `run-${Date.now()}`,
            startedAt: new Date(),
            status: "running",
          };
          setTimeout(() => {
            setCronJobs((prev2) =>
              prev2.map((j2) =>
                j2.id !== jobId
                  ? j2
                  : {
                      ...j2,
                      lastRun: new Date(),
                      runs: j2.runs.map((r) =>
                        r.id === newRun.id
                          ? { ...r, completedAt: new Date(), status: "success" as const, durationMs: 2000 }
                          : r
                      ),
                    }
              )
            );
          }, 2000);
          return { ...j, runs: [newRun, ...j.runs] };
        })
      );
    },
    [rpc]
  );

  const approveNode = useCallback((nodeId: string) => {
    setNodes((prev) => prev.map((n) => (n.id === nodeId ? { ...n, status: "online" } : n)));
  }, []);

  const rejectNode = useCallback((nodeId: string) => {
    setNodes((prev) => prev.filter((n) => n.id !== nodeId));
  }, []);

  const updateSettings = useCallback((patch: Partial<Settings>) => {
    setSettings((prev) => ({ ...prev, ...patch }));
  }, []);

  const deleteSession = useCallback((sessionId: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== sessionId));
  }, []);

  const updateSessionLabel = useCallback((sessionId: string, label: string) => {
    setSessions((prev) => prev.map((s) => (s.id === sessionId ? { ...s, label } : s)));
  }, []);

  const updateSessionThinking = useCallback((sessionId: string, level: ThinkingLevel) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === sessionId ? { ...s, thinkingLevel: level } : s))
    );
  }, []);

  const toggleAgentTool = useCallback((agentId: string, toolName: string) => {
    setAgentWorkspaces((prev) =>
      prev.map((a) => {
        if (a.id !== agentId) return a;
        return {
          ...a,
          tools: a.tools.map((t) => (t.name === toolName ? { ...t, allowed: !t.allowed } : t)),
        };
      })
    );
  }, []);

  const moveTask = useCallback((taskId: string, newStatus: TaskStatus) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus, updatedAt: new Date() } : t))
    );
  }, []);

  const updateConfigField = useCallback(
    (sectionKey: string, fieldKey: string, value: string | number | boolean) => {
      setConfigSections((prev) =>
        prev.map((section) =>
          section.key !== sectionKey
            ? section
            : {
                ...section,
                fields: section.fields.map((field) =>
                  field.key === fieldKey ? { ...field, value } : field
                ),
              }
        )
      );
    },
    []
  );

  // Suppress unused variable warning - costLoaded and sessionsLoaded are used for future indicators
  void costLoaded;
  void sessionsLoaded;
  void activeModel;

  return {
    connectionStatus,
    setConnectionStatus,
    activeAgent,
    agents,
    selectAgent,
    files,
    skills,
    messages,
    sendMessage,
    health,
    autoBuild,
    toggleAutoBuild,
    selectedFile,
    setSelectedFile,
    channels,
    toggleChannel,
    skillsFull,
    toggleSkillFull,
    cronJobs,
    toggleCronJob,
    runCronJob,
    nodes,
    approveNode,
    rejectNode,
    settings,
    updateSettings,
    instances,
    sessions,
    deleteSession,
    updateSessionLabel,
    updateSessionThinking,
    usageData,
    agentWorkspaces,
    toggleAgentTool,
    configSections,
    updateConfigField,
    debugSnapshot,
    debugEvents,
    logEntries,
    activityEvents,
    costSnapshot,
    channelHealth,
    agentState,
    heatmap,
    tasks,
    moveTask,
    memories,
    agentDesks,
  };
}
