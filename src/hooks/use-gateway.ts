"use client";

import { useState, useCallback } from "react";
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
} from "@/types";
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
} from "@/lib/mock-data";
import type { GatewayContextValue } from "@/contexts/gateway-context";

/**
 * Gateway connection hook.
 * In v0.1, this returns mock data. In production, it will manage
 * a real WebSocket connection to the OpenClaw gateway.
 */
export function useGateway(): GatewayContextValue {
  // --- Existing state ---
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>("connected");
  const [activeAgent, setActiveAgent] = useState<Agent>(mockAgent);
  const [agents] = useState<Agent[]>(mockAgents);
  const [files] = useState<AgentFile[]>(mockFiles);
  const [skills] = useState<Skill[]>(mockSkills);
  const [messages, setMessages] = useState<ChatMessage[]>(mockMessages);
  const [health] = useState<GatewayHealth>(mockHealth);
  const [autoBuild, setAutoBuild] = useState(mockAgent.autoBuild);
  const [selectedFile, setSelectedFile] = useState<AgentFile | null>(null);

  // --- Feature state ---
  const [channels, setChannels] = useState<Channel[]>(mockChannels);
  const [skillsFull, setSkillsFull] = useState<SkillFull[]>(mockSkillsFull);
  const [cronJobs, setCronJobs] = useState<CronJob[]>(mockCronJobs);
  const [nodes, setNodes] = useState<Node[]>(mockNodes);
  const [settings, setSettings] = useState<Settings>(mockSettings);

  // --- New state ---
  const [instances] = useState<Instance[]>(mockInstances);
  const [sessions, setSessions] = useState<Session[]>(mockSessions);
  const [usageData] = useState<UsageData>(mockUsageData);
  const [agentWorkspaces, setAgentWorkspaces] = useState<AgentWorkspace[]>(mockAgentWorkspaces);
  const [configSections, setConfigSections] = useState<ConfigSection[]>(mockConfigSections);
  const [debugSnapshot] = useState<DebugSnapshot>(mockDebugSnapshot);
  const [debugEvents] = useState<DebugEvent[]>(mockDebugEvents);
  const [logEntries] = useState<LogEntry[]>(mockLogEntries);
  const [activityEvents] = useState<ActivityEvent[]>(mockActivityEvents);
  const [costSnapshot] = useState<CostSnapshot>(mockCostSnapshot);
  const [channelHealth] = useState<ChannelHealth[]>(mockChannelHealth);
  const [agentState] = useState<AgentState>(mockAgentState);

  // --- Existing actions ---
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
        content: `I received your message: "${content}". This is a simulated response — connect to a real OpenClaw gateway for live agent interaction.`,
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

  // --- Channel actions ---
  const toggleChannel = useCallback((channelId: string) => {
    setChannels((prev) =>
      prev.map((ch) =>
        ch.id === channelId
          ? {
              ...ch,
              enabled: !ch.enabled,
              status: !ch.enabled ? "connected" : "disconnected",
            }
          : ch
      )
    );
  }, []);

  // --- Skill actions ---
  const toggleSkillFull = useCallback((skillId: string) => {
    setSkillsFull((prev) =>
      prev.map((s) =>
        s.id === skillId ? { ...s, active: !s.active } : s
      )
    );
  }, []);

  // --- Cron actions ---
  const toggleCronJob = useCallback((jobId: string) => {
    setCronJobs((prev) =>
      prev.map((j) => (j.id === jobId ? { ...j, enabled: !j.enabled } : j))
    );
  }, []);

  const runCronJob = useCallback((jobId: string) => {
    setCronJobs((prev) =>
      prev.map((j) => {
        if (j.id !== jobId) return j;
        const newRun = {
          id: `run-${Date.now()}`,
          startedAt: new Date(),
          completedAt: undefined as Date | undefined,
          status: "running" as const,
          durationMs: undefined as number | undefined,
          output: undefined as string | undefined,
        };
        setTimeout(() => {
          setCronJobs((prev2) =>
            prev2.map((j2) => {
              if (j2.id !== jobId) return j2;
              return {
                ...j2,
                lastRun: new Date(),
                runs: j2.runs.map((r) =>
                  r.id === newRun.id
                    ? {
                        ...r,
                        completedAt: new Date(),
                        status: "success" as const,
                        durationMs: 2000,
                        output: "Manual run completed successfully.",
                      }
                    : r
                ),
              };
            })
          );
        }, 2000);
        return { ...j, runs: [newRun, ...j.runs] };
      })
    );
  }, []);

  // --- Node actions ---
  const approveNode = useCallback((nodeId: string) => {
    setNodes((prev) =>
      prev.map((n) =>
        n.id === nodeId ? { ...n, status: "online" } : n
      )
    );
  }, []);

  const rejectNode = useCallback((nodeId: string) => {
    setNodes((prev) => prev.filter((n) => n.id !== nodeId));
  }, []);

  // --- Settings actions ---
  const updateSettings = useCallback((patch: Partial<Settings>) => {
    setSettings((prev) => ({ ...prev, ...patch }));
  }, []);

  // --- Session actions ---
  const deleteSession = useCallback((sessionId: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== sessionId));
  }, []);

  const updateSessionLabel = useCallback((sessionId: string, label: string) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === sessionId ? { ...s, label } : s))
    );
  }, []);

  const updateSessionThinking = useCallback((sessionId: string, level: ThinkingLevel) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === sessionId ? { ...s, thinkingLevel: level } : s))
    );
  }, []);

  // --- Agent workspace actions ---
  const toggleAgentTool = useCallback((agentId: string, toolName: string) => {
    setAgentWorkspaces((prev) =>
      prev.map((a) => {
        if (a.id !== agentId) return a;
        return {
          ...a,
          tools: a.tools.map((t) =>
            t.name === toolName ? { ...t, allowed: !t.allowed } : t
          ),
        };
      })
    );
  }, []);

  // --- Config actions ---
  const updateConfigField = useCallback(
    (sectionKey: string, fieldKey: string, value: string | number | boolean) => {
      setConfigSections((prev) =>
        prev.map((section) => {
          if (section.key !== sectionKey) return section;
          return {
            ...section,
            fields: section.fields.map((field) =>
              field.key === fieldKey ? { ...field, value } : field
            ),
          };
        })
      );
    },
    []
  );

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
  };
}
