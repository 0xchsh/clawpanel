"use client";

import { createContext, useContext } from "react";
import type {
  Agent,
  AgentFile,
  Skill,
  ChatMessage,
  GatewayHealth,
  ConnectionStatus,
  Channel,
  SkillFull,
  CronJob,
  Node,
  Settings,
  Instance,
  Session,
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
} from "@/types";

export interface GatewayContextValue {
  // Existing
  connectionStatus: ConnectionStatus;
  setConnectionStatus: (status: ConnectionStatus) => void;
  activeAgent: Agent;
  agents: Agent[];
  selectAgent: (agentId: string) => void;
  files: AgentFile[];
  skills: Skill[];
  messages: ChatMessage[];
  sendMessage: (content: string) => void;
  health: GatewayHealth;
  autoBuild: boolean;
  toggleAutoBuild: () => void;
  selectedFile: AgentFile | null;
  setSelectedFile: (file: AgentFile | null) => void;

  // Channels
  channels: Channel[];
  toggleChannel: (channelId: string) => void;

  // Full Skills
  skillsFull: SkillFull[];
  toggleSkillFull: (skillId: string) => void;

  // Cron
  cronJobs: CronJob[];
  toggleCronJob: (jobId: string) => void;
  runCronJob: (jobId: string) => void;

  // Nodes
  nodes: Node[];
  approveNode: (nodeId: string) => void;
  rejectNode: (nodeId: string) => void;

  // Settings
  settings: Settings;
  updateSettings: (patch: Partial<Settings>) => void;

  // Instances
  instances: Instance[];

  // Sessions
  sessions: Session[];
  deleteSession: (sessionId: string) => void;
  updateSessionLabel: (sessionId: string, label: string) => void;
  updateSessionThinking: (sessionId: string, level: ThinkingLevel) => void;

  // Usage
  usageData: UsageData;

  // Agent Workspaces
  agentWorkspaces: AgentWorkspace[];
  toggleAgentTool: (agentId: string, toolName: string) => void;

  // Config
  configSections: ConfigSection[];
  updateConfigField: (sectionKey: string, fieldKey: string, value: string | number | boolean) => void;

  // Debug
  debugSnapshot: DebugSnapshot;
  debugEvents: DebugEvent[];

  // Logs
  logEntries: LogEntry[];

  // Activity Feed
  activityEvents: ActivityEvent[];

  // Cost
  costSnapshot: CostSnapshot;

  // Enhanced health
  channelHealth: ChannelHealth[];
  agentState: AgentState;

  // Heatmap
  heatmap: {
    cells: { day: string; hour: number; messages: number; tokens: number }[];
    maxMessages: number;
    days: string[];
    currentStreak: number;
    longestStreak: number;
  };

  // Tasks
  tasks: Task[];
  moveTask: (taskId: string, newStatus: TaskStatus) => void;

  // Memories
  memories: Memory[];

  // Agent Desks (Office)
  agentDesks: AgentDesk[];
}

export const GatewayContext = createContext<GatewayContextValue | null>(null);

export function useGatewayContext(): GatewayContextValue {
  const ctx = useContext(GatewayContext);
  if (!ctx) {
    throw new Error("useGatewayContext must be used within a GatewayContext.Provider");
  }
  return ctx;
}
