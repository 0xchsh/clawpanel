// ClawPanel type definitions

export type ActivityEventType =
  | "message"
  | "skill"
  | "file"
  | "cron"
  | "channel"
  | "node"
  | "session"
  | "build"
  | "git";

export interface ActivityEvent {
  id: string;
  agentName: string;
  agentEmoji: string;
  type: ActivityEventType;
  description: string;
  timestamp: Date;
  detail?: string;
}

// --- Cost tracking types ---

export interface CostSnapshot {
  todaySpend: number;
  todayTokens: number;
  dailyBudget: number | null;
  burnRatePerHour: number;
  burnRateTokensPerMin: number;
  timeToLimitHours: number | null;
  isIdle: boolean;
  projectedMonthly: number;
  dailyTrend: DailySpend[];
  modelSplit: ModelCost[];
}

export interface DailySpend {
  date: string;
  cost: number;
  tokens: number;
}

export interface ModelCost {
  model: string;
  cost: number;
  percentage: number;
  color: string;
}

// --- Gateway health (enhanced) ---

export type AgentState = "idle" | "running" | "error";

export interface ChannelHealth {
  name: string;
  provider: string;
  status: ConnectionStatus;
}

export interface GatewayConfig {
  url: string;
  token: string;
}

export interface ConnectionProfile {
  gateway: string;
  token: string;
}

export interface ClawPanelConfig {
  profiles: Record<string, ConnectionProfile>;
  activeProfile: string;
  preferences: {
    port: number;
    theme: "light" | "dark" | "system";
  };
}

export type ConnectionStatus = "connected" | "degraded" | "disconnected";

export interface Agent {
  id: string;
  name: string;
  emoji: string;
  model: string;
  status: ConnectionStatus;
  autoBuild: boolean;
}

export interface AgentFile {
  id: string;
  name: string;
  type: "markdown" | "text" | "code" | "config" | "image";
  extension: string;
  size: number;
  content?: string;
}

export interface Skill {
  id: string;
  name: string;
  description: string;
  active: boolean;
}

export interface ChatMessage {
  id: string;
  role: "user" | "agent";
  content: string;
  timestamp: Date;
  toolCalls?: ToolCall[];
}

export interface ToolCall {
  id: string;
  name: string;
  status: "running" | "completed" | "failed";
  result?: string;
}

export interface SessionInfo {
  active: number;
  total: number;
}

export interface GatewayHealth {
  status: ConnectionStatus;
  tokenCount: number;
  sessions: SessionInfo;
}

// --- Channel types ---

export type ChannelProvider =
  | "whatsapp"
  | "telegram"
  | "discord"
  | "slack"
  | "signal"
  | "imessage"
  | "teams"
  | "matrix"
  | "google-chat"
  | "mattermost"
  | "webchat";

export type DmPolicy = "allow" | "deny" | "allowlist";

export interface Channel {
  id: string;
  name: string;
  provider: ChannelProvider;
  enabled: boolean;
  status: ConnectionStatus;
  unreadCount: number;
  dmPolicy: DmPolicy;
  allowlist: string[];
  groupEnabled: boolean;
  groupAllowlist: string[];
  lastActivity?: Date;
}

// --- Full skill types (extends basic Skill) ---

export type SkillType = "bundled" | "managed" | "workspace";

export interface SkillDependency {
  name: string;
  met: boolean;
  version?: string;
}

export interface SkillFull {
  id: string;
  name: string;
  description: string;
  active: boolean;
  type: SkillType;
  version: string;
  dependencies: SkillDependency[];
  documentation?: string;
  author?: string;
  updatedAt: Date;
}

// --- Cron job types ---

export type CronScheduleType = "at" | "every" | "cron";

export interface CronSchedule {
  type: CronScheduleType;
  expression: string;
  readable: string;
}

export type CronRunStatus = "success" | "failure" | "running";

export interface CronRun {
  id: string;
  startedAt: Date;
  completedAt?: Date;
  status: CronRunStatus;
  durationMs?: number;
  output?: string;
  error?: string;
}

export interface CronJob {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  schedule: CronSchedule;
  nextRun?: Date;
  lastRun?: Date;
  payload?: string;
  deliveryChannel?: string;
  runs: CronRun[];
}

// --- Node types ---

export type NodePlatform = "macos" | "ios" | "android" | "linux";
export type NodeStatus = "online" | "offline" | "pending";

export interface Node {
  id: string;
  name: string;
  platform: NodePlatform;
  os: string;
  status: NodeStatus;
  capabilities: string[];
  lastSeen?: Date;
  ipAddress?: string;
}

// --- Instance types ---

export interface Instance {
  id: string;
  host: string;
  platform: string;
  deviceFamily: string;
  mode: string;
  roles: string[];
  scopes: string[];
  version: string;
  model?: string;
  presenceAge: number; // seconds since last heartbeat
  lastActivity: Date;
  statusReason?: string;
}

// --- Session types ---

export type SessionKind = "chat" | "cron" | "api" | "system";

export interface Session {
  id: string;
  key: string;
  label: string;
  kind: SessionKind;
  updatedAt: Date;
  tokens: number;
  thinkingLevel: ThinkingLevel;
  verbose: boolean;
  reasoning: boolean;
}

// --- Usage types ---

export interface UsageDayData {
  date: string;
  inputTokens: number;
  outputTokens: number;
  cacheReadTokens: number;
  cacheWriteTokens: number;
  cost: number;
}

export interface UsageToolStat {
  name: string;
  calls: number;
  avgDurationMs: number;
}

export interface UsageSessionStat {
  sessionKey: string;
  label: string;
  tokens: number;
  cost: number;
  messages: number;
  errors: number;
  lastActive: Date;
}

export interface UsageData {
  totalInputTokens: number;
  totalOutputTokens: number;
  totalCacheReadTokens: number;
  totalCacheWriteTokens: number;
  totalCost: number;
  dailyData: UsageDayData[];
  toolStats: UsageToolStat[];
  sessionStats: UsageSessionStat[];
  avgLatencyMs: number;
  p95LatencyMs: number;
  errorRate: number;
}

// --- Agent workspace types (expanded) ---

export interface AgentToolPermission {
  name: string;
  allowed: boolean;
  profile?: string;
}

export interface AgentWorkspace {
  id: string;
  name: string;
  emoji: string;
  model: string;
  status: ConnectionStatus;
  autoBuild: boolean;
  isDefault: boolean;
  workspacePath: string;
  identityFile?: string;
  personaFile?: string;
  toolGuidanceFile?: string;
  tools: AgentToolPermission[];
  skillAllowlist: string[];
  files: AgentFile[];
}

// --- Config types ---

export interface ConfigSection {
  key: string;
  label: string;
  description: string;
  fields: ConfigField[];
}

export interface ConfigField {
  key: string;
  label: string;
  type: "string" | "number" | "boolean" | "select" | "textarea" | "json";
  value: string | number | boolean;
  options?: string[];
  description?: string;
}

// --- Debug types ---

export interface DebugSnapshot {
  status: string;
  uptime: number;
  instanceCount: number;
  sessionCount: number;
  cronEnabled: boolean;
  cronNextWake?: Date;
  securityIssues: DebugSecurityIssue[];
}

export interface DebugSecurityIssue {
  level: "critical" | "warning" | "info";
  message: string;
}

export interface DebugEvent {
  id: string;
  timestamp: Date;
  type: string;
  payload: string;
}

// --- Log types ---

export type LogLevel = "trace" | "debug" | "info" | "warn" | "error" | "fatal";

export interface LogEntry {
  id: string;
  timestamp: Date;
  level: LogLevel;
  subsystem: string;
  message: string;
}

// --- Settings types ---

// --- Task Board types ---

export type TaskStatus = "backlog" | "in_progress" | "review" | "done";
export type TaskPriority = "low" | "medium" | "high" | "urgent";
export type TaskAssigneeType = "human" | "agent";

export interface TaskAssignee {
  id: string;
  name: string;
  type: TaskAssigneeType;
  emoji: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee: TaskAssignee;
  createdAt: Date;
  updatedAt: Date;
  dueDate?: Date;
  tags: string[];
}

// --- Memory types ---

export type MemorySource = "conversation" | "research" | "observation" | "reflection" | "user_note";

export interface Memory {
  id: string;
  title: string;
  content: string;
  summary: string;
  source: MemorySource;
  agentId: string;
  agentName: string;
  agentEmoji: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  tokenCount: number;
}

// --- ClawhHub types ---

export interface ClawhubSearchResult {
  slug: string;
  displayName: string;
  summary: string | null;
  version: string | null;
  score: number;
  updatedAt: number;
}

export interface ClawhubSkillDetail {
  skill: {
    slug: string;
    displayName: string;
    summary: string | null;
  } | null;
  latestVersion: {
    version: string;
    changelog: string;
    createdAt: number;
  } | null;
  owner: {
    handle: string | null;
    displayName: string | null;
  } | null;
}

// --- Office types ---

export type AgentWorkStatus = "idle" | "working" | "thinking" | "away";

export interface AgentDesk {
  id: string;
  agentId: string;
  agentName: string;
  agentEmoji: string;
  status: AgentWorkStatus;
  currentTask?: string;
  model: string;
  position: { row: number; col: number };
  deskStyle: string;
  itemsOnDesk: string[];
  sessionCount: number;
  uptimeMinutes: number;
}

// --- Settings types ---

export type BindMode = "localhost" | "tailscale";
export type ThinkingLevel = "low" | "medium" | "high";
export type AuthMode = "none" | "token";

export interface ModelOption {
  id: string;
  name: string;
  provider: string;
}

export interface DebugLogEntry {
  id: string;
  timestamp: Date;
  level: "info" | "warn" | "error" | "debug";
  message: string;
}

export interface Settings {
  gatewayUrl: string;
  gatewayVersion: string;
  uptime: number;
  bindMode: BindMode;
  authMode: AuthMode;
  selectedModel: string;
  availableModels: ModelOption[];
  thinkingLevel: ThinkingLevel;
  sandboxMode: boolean;
  verbose: boolean;
  debugLogs: DebugLogEntry[];
}
