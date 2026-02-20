import type {
  Agent,
  AgentFile,
  Skill,
  ChatMessage,
  GatewayHealth,
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
  ActivityEvent,
  CostSnapshot,
  ChannelHealth,
  AgentState,
  Task,
  Memory,
  AgentDesk,
} from "@/types";

export const mockAgent: Agent = {
  id: "agent-1",
  name: "Atlas",
  emoji: "🦊",
  model: "claude-sonnet-4-5-20250929",
  status: "connected",
  autoBuild: true,
};

export const mockAgents: Agent[] = [
  mockAgent,
  {
    id: "agent-2",
    name: "Scout",
    emoji: "🐦",
    model: "claude-haiku-4-5-20251001",
    status: "disconnected",
    autoBuild: false,
  },
];

export const mockFiles: AgentFile[] = [
  {
    id: "f1",
    name: "system-prompt.md",
    type: "markdown",
    extension: "md",
    size: 4200,
    content:
      "# System Prompt\n\nYou are Atlas, a helpful AI assistant...\n\n## Guidelines\n- Be concise and direct\n- Always cite sources\n- Use tools when appropriate",
  },
  {
    id: "f2",
    name: "knowledge-base.txt",
    type: "text",
    extension: "txt",
    size: 12800,
    content: "Product documentation and FAQ entries...",
  },
  {
    id: "f3",
    name: "config.yml",
    type: "config",
    extension: "yml",
    size: 890,
    content:
      "model: claude-sonnet-4-5\ntemperature: 0.7\nmax_tokens: 4096\nauto_build: true",
  },
  {
    id: "f4",
    name: "tools.json",
    type: "code",
    extension: "json",
    size: 2100,
  },
  {
    id: "f5",
    name: "README.md",
    type: "markdown",
    extension: "md",
    size: 1500,
  },
];

export const mockSkills: Skill[] = [
  {
    id: "s1",
    name: "web-search",
    description: "Search the web for current information",
    active: true,
  },
  {
    id: "s2",
    name: "code-interpreter",
    description: "Execute Python code in a sandbox",
    active: true,
  },
  {
    id: "s3",
    name: "file-manager",
    description: "Read and write files in the workspace",
    active: true,
  },
  {
    id: "s4",
    name: "image-gen",
    description: "Generate images from text descriptions",
    active: false,
  },
];

export const mockMessages: ChatMessage[] = [
  {
    id: "m1",
    role: "user",
    content: "Can you summarize the knowledge base document?",
    timestamp: new Date(Date.now() - 1000 * 60 * 12),
  },
  {
    id: "m2",
    role: "agent",
    content:
      "Here's a summary of the knowledge base:\n\nThe document contains **42 FAQ entries** organized into 5 categories:\n\n1. **Getting Started** (8 entries) — Installation, setup, and first-run guidance\n2. **Configuration** (10 entries) — Environment variables, model selection, and tuning\n3. **Troubleshooting** (12 entries) — Common errors and their solutions\n4. **API Reference** (7 entries) — Endpoint documentation and examples\n5. **Best Practices** (5 entries) — Recommended patterns and workflows\n\nThe most frequently referenced entries are about API rate limits and token management.",
    timestamp: new Date(Date.now() - 1000 * 60 * 11),
    toolCalls: [
      {
        id: "tc1",
        name: "file-manager.read",
        status: "completed",
        result: "Read knowledge-base.txt (12.8 KB)",
      },
    ],
  },
  {
    id: "m3",
    role: "user",
    content: "What model am I currently using?",
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
  },
  {
    id: "m4",
    role: "agent",
    content:
      "You're currently using **Claude Sonnet 4.5** (`claude-sonnet-4-5-20250929`). This is configured in your `config.yml` file with a temperature of 0.7 and a max token limit of 4,096.",
    timestamp: new Date(Date.now() - 1000 * 60 * 4),
  },
];

export const mockHealth: GatewayHealth = {
  status: "connected",
  tokenCount: 20247,
  sessions: {
    active: 2,
    total: 2,
  },
};

// --- Channels ---

export const mockChannels: Channel[] = [
  {
    id: "ch-1",
    name: "WhatsApp Business",
    provider: "whatsapp",
    enabled: true,
    status: "connected",
    unreadCount: 3,
    dmPolicy: "allowlist",
    allowlist: ["+1-555-0100", "+1-555-0101", "+1-555-0102"],
    groupEnabled: true,
    groupAllowlist: ["Product Team", "Engineering"],
    lastActivity: new Date(Date.now() - 1000 * 60 * 2),
  },
  {
    id: "ch-2",
    name: "Telegram Bot",
    provider: "telegram",
    enabled: true,
    status: "connected",
    unreadCount: 0,
    dmPolicy: "allow",
    allowlist: [],
    groupEnabled: true,
    groupAllowlist: [],
    lastActivity: new Date(Date.now() - 1000 * 60 * 15),
  },
  {
    id: "ch-3",
    name: "Discord Server",
    provider: "discord",
    enabled: true,
    status: "connected",
    unreadCount: 7,
    dmPolicy: "deny",
    allowlist: [],
    groupEnabled: true,
    groupAllowlist: ["#general", "#support", "#dev"],
    lastActivity: new Date(Date.now() - 1000 * 60 * 1),
  },
  {
    id: "ch-4",
    name: "Slack Workspace",
    provider: "slack",
    enabled: true,
    status: "degraded",
    unreadCount: 1,
    dmPolicy: "allow",
    allowlist: [],
    groupEnabled: true,
    groupAllowlist: [],
    lastActivity: new Date(Date.now() - 1000 * 60 * 30),
  },
  {
    id: "ch-5",
    name: "Signal",
    provider: "signal",
    enabled: false,
    status: "disconnected",
    unreadCount: 0,
    dmPolicy: "allow",
    allowlist: [],
    groupEnabled: false,
    groupAllowlist: [],
  },
  {
    id: "ch-6",
    name: "iMessage",
    provider: "imessage",
    enabled: false,
    status: "disconnected",
    unreadCount: 0,
    dmPolicy: "allowlist",
    allowlist: [],
    groupEnabled: false,
    groupAllowlist: [],
  },
  {
    id: "ch-7",
    name: "Microsoft Teams",
    provider: "teams",
    enabled: true,
    status: "connected",
    unreadCount: 2,
    dmPolicy: "allow",
    allowlist: [],
    groupEnabled: true,
    groupAllowlist: ["General", "Engineering"],
    lastActivity: new Date(Date.now() - 1000 * 60 * 8),
  },
  {
    id: "ch-8",
    name: "Matrix",
    provider: "matrix",
    enabled: false,
    status: "disconnected",
    unreadCount: 0,
    dmPolicy: "allow",
    allowlist: [],
    groupEnabled: false,
    groupAllowlist: [],
  },
  {
    id: "ch-9",
    name: "Google Chat",
    provider: "google-chat",
    enabled: true,
    status: "connected",
    unreadCount: 0,
    dmPolicy: "allow",
    allowlist: [],
    groupEnabled: true,
    groupAllowlist: [],
    lastActivity: new Date(Date.now() - 1000 * 60 * 45),
  },
  {
    id: "ch-10",
    name: "Mattermost",
    provider: "mattermost",
    enabled: false,
    status: "disconnected",
    unreadCount: 0,
    dmPolicy: "allow",
    allowlist: [],
    groupEnabled: false,
    groupAllowlist: [],
  },
  {
    id: "ch-11",
    name: "WebChat Widget",
    provider: "webchat",
    enabled: true,
    status: "connected",
    unreadCount: 5,
    dmPolicy: "allow",
    allowlist: [],
    groupEnabled: false,
    groupAllowlist: [],
    lastActivity: new Date(Date.now() - 1000 * 60 * 3),
  },
];

// --- Full Skills ---

export const mockSkillsFull: SkillFull[] = [
  {
    id: "sf-1",
    name: "web-search",
    description:
      "Search the web for current information using Google, Bing, or DuckDuckGo. Supports query filtering, date ranges, and result summarization.",
    active: true,
    type: "bundled",
    version: "1.2.0",
    dependencies: [
      { name: "httpx", met: true, version: "0.27.0" },
      { name: "beautifulsoup4", met: true, version: "4.12.3" },
    ],
    documentation:
      "## Usage\n\n```\nweb-search <query> [--engine google|bing|ddg] [--max-results 10]\n```\n\nSearches the web and returns summarized results.",
    author: "OpenClaw",
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
  },
  {
    id: "sf-2",
    name: "code-interpreter",
    description:
      "Execute Python code in a sandboxed environment. Supports data analysis, visualization, and file processing.",
    active: true,
    type: "bundled",
    version: "2.0.1",
    dependencies: [
      { name: "python3", met: true, version: "3.12.0" },
      { name: "numpy", met: true, version: "1.26.4" },
      { name: "pandas", met: true, version: "2.2.0" },
      { name: "matplotlib", met: true, version: "3.8.2" },
    ],
    documentation:
      "## Usage\n\nExecutes Python code in an isolated sandbox with access to common data science libraries.",
    author: "OpenClaw",
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
  },
  {
    id: "sf-3",
    name: "file-manager",
    description:
      "Read, write, and manage files in the agent workspace. Supports text, binary, and structured data formats.",
    active: true,
    type: "bundled",
    version: "1.0.4",
    dependencies: [
      { name: "pathlib", met: true },
      { name: "chardet", met: true, version: "5.2.0" },
    ],
    author: "OpenClaw",
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14),
  },
  {
    id: "sf-4",
    name: "image-gen",
    description:
      "Generate images from text descriptions using DALL-E or Stable Diffusion APIs.",
    active: false,
    type: "managed",
    version: "0.9.0",
    dependencies: [
      { name: "openai", met: true, version: "1.12.0" },
      { name: "pillow", met: false, version: "10.2.0" },
    ],
    documentation:
      "## Usage\n\n```\nimage-gen <prompt> [--model dall-e-3|sd-xl] [--size 1024x1024]\n```",
    author: "Community",
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30),
  },
  {
    id: "sf-5",
    name: "database-query",
    description:
      "Execute SQL queries against configured databases. Supports PostgreSQL, MySQL, and SQLite.",
    active: true,
    type: "managed",
    version: "1.1.0",
    dependencies: [
      { name: "sqlalchemy", met: true, version: "2.0.25" },
      { name: "psycopg2", met: true, version: "2.9.9" },
    ],
    author: "Community",
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
  },
  {
    id: "sf-6",
    name: "custom-api",
    description:
      "Call custom REST APIs with configurable authentication, headers, and payload templates.",
    active: true,
    type: "workspace",
    version: "0.3.0",
    dependencies: [
      { name: "httpx", met: true, version: "0.27.0" },
      { name: "jsonschema", met: false },
    ],
    documentation:
      "## Usage\n\nDefine API endpoints in `apis.yml` and call them by name.\n\n```\ncustom-api <endpoint-name> [--params key=value]\n```",
    author: "Local",
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1),
  },
  {
    id: "sf-7",
    name: "email-sender",
    description:
      "Send emails via SMTP or API-based providers. Supports templates and attachments.",
    active: false,
    type: "workspace",
    version: "0.1.0",
    dependencies: [
      { name: "smtplib", met: true },
      { name: "jinja2", met: false, version: "3.1.3" },
    ],
    author: "Local",
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10),
  },
];

// --- Cron Jobs ---

export const mockCronJobs: CronJob[] = [
  {
    id: "cron-1",
    name: "Daily Report",
    description: "Generate and send a daily activity summary to all connected channels.",
    enabled: true,
    schedule: {
      type: "at",
      expression: "0 9 * * *",
      readable: "Every day at 9:00 AM",
    },
    nextRun: new Date(Date.now() + 1000 * 60 * 60 * 4),
    lastRun: new Date(Date.now() - 1000 * 60 * 60 * 20),
    payload: '{"type": "daily_summary", "include_metrics": true}',
    deliveryChannel: "Slack Workspace",
    runs: [
      {
        id: "run-1a",
        startedAt: new Date(Date.now() - 1000 * 60 * 60 * 20),
        completedAt: new Date(Date.now() - 1000 * 60 * 60 * 20 + 1000 * 45),
        status: "success",
        durationMs: 45000,
        output: "Report generated and delivered to 3 channels.",
      },
      {
        id: "run-1b",
        startedAt: new Date(Date.now() - 1000 * 60 * 60 * 44),
        completedAt: new Date(Date.now() - 1000 * 60 * 60 * 44 + 1000 * 52),
        status: "success",
        durationMs: 52000,
        output: "Report generated and delivered to 3 channels.",
      },
      {
        id: "run-1c",
        startedAt: new Date(Date.now() - 1000 * 60 * 60 * 68),
        completedAt: new Date(Date.now() - 1000 * 60 * 60 * 68 + 1000 * 12),
        status: "failure",
        durationMs: 12000,
        error: "Slack API rate limit exceeded. Retrying in 60s.",
      },
    ],
  },
  {
    id: "cron-2",
    name: "Health Check",
    description: "Ping all connected channels and nodes to verify connectivity.",
    enabled: true,
    schedule: {
      type: "every",
      expression: "*/15 * * * *",
      readable: "Every 15 minutes",
    },
    nextRun: new Date(Date.now() + 1000 * 60 * 7),
    lastRun: new Date(Date.now() - 1000 * 60 * 8),
    runs: [
      {
        id: "run-2a",
        startedAt: new Date(Date.now() - 1000 * 60 * 8),
        completedAt: new Date(Date.now() - 1000 * 60 * 8 + 1000 * 3),
        status: "success",
        durationMs: 3000,
        output: "All 7 channels healthy. 3/4 nodes responding.",
      },
    ],
  },
  {
    id: "cron-3",
    name: "Knowledge Sync",
    description: "Sync knowledge base from external sources and update embeddings.",
    enabled: true,
    schedule: {
      type: "cron",
      expression: "0 */6 * * *",
      readable: "Every 6 hours",
    },
    nextRun: new Date(Date.now() + 1000 * 60 * 60 * 2),
    lastRun: new Date(Date.now() - 1000 * 60 * 60 * 4),
    payload: '{"sources": ["docs", "wiki", "confluence"]}',
    runs: [
      {
        id: "run-3a",
        startedAt: new Date(Date.now() - 1000 * 60 * 60 * 4),
        completedAt: new Date(Date.now() - 1000 * 60 * 60 * 4 + 1000 * 120),
        status: "success",
        durationMs: 120000,
        output: "Synced 156 documents. Updated 12 embeddings.",
      },
    ],
  },
  {
    id: "cron-4",
    name: "Token Cleanup",
    description: "Expire stale session tokens and clean up orphaned sessions.",
    enabled: false,
    schedule: {
      type: "at",
      expression: "0 2 * * *",
      readable: "Every day at 2:00 AM",
    },
    lastRun: new Date(Date.now() - 1000 * 60 * 60 * 48),
    runs: [
      {
        id: "run-4a",
        startedAt: new Date(Date.now() - 1000 * 60 * 60 * 48),
        completedAt: new Date(Date.now() - 1000 * 60 * 60 * 48 + 1000 * 8),
        status: "success",
        durationMs: 8000,
        output: "Cleaned 5 expired tokens. Removed 2 orphaned sessions.",
      },
    ],
  },
  {
    id: "cron-5",
    name: "Backup Config",
    description: "Backup gateway configuration and skill definitions to external storage.",
    enabled: true,
    schedule: {
      type: "every",
      expression: "0 0 * * *",
      readable: "Every day at midnight",
    },
    nextRun: new Date(Date.now() + 1000 * 60 * 60 * 8),
    lastRun: new Date(Date.now() - 1000 * 60 * 60 * 16),
    runs: [
      {
        id: "run-5a",
        startedAt: new Date(Date.now() - 1000 * 60 * 60 * 16),
        completedAt: new Date(Date.now() - 1000 * 60 * 60 * 16 + 1000 * 5),
        status: "success",
        durationMs: 5000,
        output: "Backup completed. Size: 2.4 MB.",
      },
    ],
  },
];

// --- Nodes ---

export const mockNodes: Node[] = [
  {
    id: "node-1",
    name: "MacBook Pro",
    platform: "macos",
    os: "macOS 15.2 Sequoia",
    status: "online",
    capabilities: ["shell", "browser", "files", "clipboard"],
    lastSeen: new Date(Date.now() - 1000 * 30),
    ipAddress: "192.168.1.10",
  },
  {
    id: "node-2",
    name: "iPhone 16",
    platform: "ios",
    os: "iOS 18.2",
    status: "online",
    capabilities: ["notifications", "shortcuts", "location"],
    lastSeen: new Date(Date.now() - 1000 * 60 * 2),
    ipAddress: "192.168.1.15",
  },
  {
    id: "node-3",
    name: "Pixel 9",
    platform: "android",
    os: "Android 15",
    status: "offline",
    capabilities: ["notifications", "shell", "location"],
    lastSeen: new Date(Date.now() - 1000 * 60 * 60 * 3),
    ipAddress: "192.168.1.22",
  },
  {
    id: "node-4",
    name: "Home Server",
    platform: "linux",
    os: "Ubuntu 24.04 LTS",
    status: "online",
    capabilities: ["shell", "docker", "files", "cron"],
    lastSeen: new Date(Date.now() - 1000 * 15),
    ipAddress: "192.168.1.100",
  },
  {
    id: "node-5",
    name: "iPad Pro",
    platform: "ios",
    os: "iPadOS 18.2",
    status: "pending",
    capabilities: ["notifications", "shortcuts"],
    lastSeen: new Date(Date.now() - 1000 * 60),
  },
  {
    id: "node-6",
    name: "Galaxy Tab",
    platform: "android",
    os: "Android 14",
    status: "pending",
    capabilities: ["notifications"],
    lastSeen: new Date(Date.now() - 1000 * 120),
  },
];

// --- Settings ---

export const mockSettings: Settings = {
  gatewayUrl: "http://localhost:4400",
  gatewayVersion: "0.8.2",
  uptime: 86400 * 3 + 3600 * 7 + 60 * 23,
  bindMode: "localhost",
  authMode: "token",
  selectedModel: "claude-sonnet-4-5-20250929",
  availableModels: [
    { id: "claude-opus-4-6", name: "Claude Opus 4.6", provider: "Anthropic" },
    {
      id: "claude-sonnet-4-5-20250929",
      name: "Claude Sonnet 4.5",
      provider: "Anthropic",
    },
    {
      id: "claude-haiku-4-5-20251001",
      name: "Claude Haiku 4.5",
      provider: "Anthropic",
    },
    { id: "gpt-4o", name: "GPT-4o", provider: "OpenAI" },
    { id: "gpt-4o-mini", name: "GPT-4o Mini", provider: "OpenAI" },
    {
      id: "gemini-2.0-flash",
      name: "Gemini 2.0 Flash",
      provider: "Google",
    },
  ],
  thinkingLevel: "medium",
  sandboxMode: true,
  verbose: false,
  debugLogs: [
    {
      id: "log-1",
      timestamp: new Date(Date.now() - 1000 * 60 * 5),
      level: "info",
      message: "Gateway started on http://localhost:4400",
    },
    {
      id: "log-2",
      timestamp: new Date(Date.now() - 1000 * 60 * 4),
      level: "info",
      message: "WebSocket server listening on ws://localhost:4400/ws",
    },
    {
      id: "log-3",
      timestamp: new Date(Date.now() - 1000 * 60 * 3),
      level: "info",
      message: "Loaded 7 skills (5 active, 2 inactive)",
    },
    {
      id: "log-4",
      timestamp: new Date(Date.now() - 1000 * 60 * 3),
      level: "warn",
      message: "Skill 'image-gen' has unmet dependency: pillow>=10.2.0",
    },
    {
      id: "log-5",
      timestamp: new Date(Date.now() - 1000 * 60 * 2),
      level: "info",
      message: "Connected to 7 channels (4 providers)",
    },
    {
      id: "log-6",
      timestamp: new Date(Date.now() - 1000 * 60 * 1),
      level: "debug",
      message: "Health check: all services nominal",
    },
    {
      id: "log-7",
      timestamp: new Date(Date.now() - 1000 * 30),
      level: "error",
      message: "Slack webhook delivery failed: 429 Too Many Requests",
    },
    {
      id: "log-8",
      timestamp: new Date(Date.now() - 1000 * 15),
      level: "info",
      message: "Slack webhook retry succeeded",
    },
  ],
};

// --- Instances ---

export const mockInstances: Instance[] = [
  {
    id: "inst-1",
    host: "macbook-pro.local",
    platform: "darwin",
    deviceFamily: "desktop",
    mode: "interactive",
    roles: ["admin", "operator"],
    scopes: ["chat", "exec", "config"],
    version: "0.8.2",
    model: "claude-sonnet-4-5-20250929",
    presenceAge: 15,
    lastActivity: new Date(Date.now() - 1000 * 15),
  },
  {
    id: "inst-2",
    host: "iphone-16.local",
    platform: "ios",
    deviceFamily: "mobile",
    mode: "notify",
    roles: ["user"],
    scopes: ["chat", "notify"],
    version: "0.8.1",
    presenceAge: 120,
    lastActivity: new Date(Date.now() - 1000 * 120),
    statusReason: "Background mode",
  },
  {
    id: "inst-3",
    host: "home-server.local",
    platform: "linux",
    deviceFamily: "server",
    mode: "headless",
    roles: ["operator", "cron"],
    scopes: ["exec", "cron", "files"],
    version: "0.8.2",
    model: "claude-haiku-4-5-20251001",
    presenceAge: 5,
    lastActivity: new Date(Date.now() - 1000 * 5),
  },
  {
    id: "inst-4",
    host: "pixel-9.local",
    platform: "android",
    deviceFamily: "mobile",
    mode: "notify",
    roles: ["user"],
    scopes: ["chat", "notify"],
    version: "0.7.9",
    presenceAge: 10800,
    lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 3),
    statusReason: "Connection lost",
  },
];

// --- Sessions ---

export const mockSessions: Session[] = [
  {
    id: "sess-1",
    key: "main",
    label: "Main Chat",
    kind: "chat",
    updatedAt: new Date(Date.now() - 1000 * 60 * 2),
    tokens: 15420,
    thinkingLevel: "medium",
    verbose: false,
    reasoning: true,
  },
  {
    id: "sess-2",
    key: "daily-report",
    label: "Daily Report Cron",
    kind: "cron",
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 20),
    tokens: 8340,
    thinkingLevel: "low",
    verbose: false,
    reasoning: false,
  },
  {
    id: "sess-3",
    key: "api-webhook",
    label: "API Webhook Handler",
    kind: "api",
    updatedAt: new Date(Date.now() - 1000 * 60 * 30),
    tokens: 3210,
    thinkingLevel: "low",
    verbose: true,
    reasoning: false,
  },
  {
    id: "sess-4",
    key: "support-chat",
    label: "Support Chat",
    kind: "chat",
    updatedAt: new Date(Date.now() - 1000 * 60 * 5),
    tokens: 22100,
    thinkingLevel: "high",
    verbose: false,
    reasoning: true,
  },
  {
    id: "sess-5",
    key: "health-check",
    label: "Health Check Cron",
    kind: "cron",
    updatedAt: new Date(Date.now() - 1000 * 60 * 8),
    tokens: 1250,
    thinkingLevel: "low",
    verbose: false,
    reasoning: false,
  },
  {
    id: "sess-6",
    key: "system",
    label: "System",
    kind: "system",
    updatedAt: new Date(Date.now() - 1000 * 60),
    tokens: 450,
    thinkingLevel: "low",
    verbose: true,
    reasoning: false,
  },
];

// --- Usage ---

export const mockUsageData: UsageData = {
  totalInputTokens: 245000,
  totalOutputTokens: 182000,
  totalCacheReadTokens: 98000,
  totalCacheWriteTokens: 12000,
  totalCost: 4.82,
  dailyData: [
    { date: "2025-01-30", inputTokens: 32000, outputTokens: 24000, cacheReadTokens: 12000, cacheWriteTokens: 1500, cost: 0.62 },
    { date: "2025-01-31", inputTokens: 28000, outputTokens: 21000, cacheReadTokens: 10000, cacheWriteTokens: 1200, cost: 0.54 },
    { date: "2025-02-01", inputTokens: 41000, outputTokens: 31000, cacheReadTokens: 16000, cacheWriteTokens: 2100, cost: 0.81 },
    { date: "2025-02-02", inputTokens: 35000, outputTokens: 26000, cacheReadTokens: 14000, cacheWriteTokens: 1800, cost: 0.68 },
    { date: "2025-02-03", inputTokens: 38000, outputTokens: 28000, cacheReadTokens: 15000, cacheWriteTokens: 1900, cost: 0.74 },
    { date: "2025-02-04", inputTokens: 42000, outputTokens: 32000, cacheReadTokens: 17000, cacheWriteTokens: 2000, cost: 0.84 },
    { date: "2025-02-05", inputTokens: 29000, outputTokens: 20000, cacheReadTokens: 14000, cacheWriteTokens: 1500, cost: 0.59 },
  ],
  toolStats: [
    { name: "web-search", calls: 142, avgDurationMs: 2300 },
    { name: "file-manager.read", calls: 98, avgDurationMs: 45 },
    { name: "file-manager.write", calls: 34, avgDurationMs: 52 },
    { name: "code-interpreter", calls: 67, avgDurationMs: 4500 },
    { name: "database-query", calls: 23, avgDurationMs: 180 },
    { name: "custom-api", calls: 15, avgDurationMs: 850 },
  ],
  sessionStats: [
    { sessionKey: "main", label: "Main Chat", tokens: 15420, cost: 1.24, messages: 48, errors: 0, lastActive: new Date(Date.now() - 1000 * 60 * 2) },
    { sessionKey: "support-chat", label: "Support Chat", tokens: 22100, cost: 1.78, messages: 86, errors: 2, lastActive: new Date(Date.now() - 1000 * 60 * 5) },
    { sessionKey: "daily-report", label: "Daily Report", tokens: 8340, cost: 0.67, messages: 14, errors: 1, lastActive: new Date(Date.now() - 1000 * 60 * 60 * 20) },
    { sessionKey: "api-webhook", label: "API Webhook", tokens: 3210, cost: 0.26, messages: 12, errors: 0, lastActive: new Date(Date.now() - 1000 * 60 * 30) },
    { sessionKey: "health-check", label: "Health Check", tokens: 1250, cost: 0.10, messages: 8, errors: 0, lastActive: new Date(Date.now() - 1000 * 60 * 8) },
  ],
  avgLatencyMs: 1850,
  p95LatencyMs: 4200,
  errorRate: 0.023,
};

// --- Agent Workspaces ---

export const mockAgentWorkspaces: AgentWorkspace[] = [
  {
    id: "agent-1",
    name: "Atlas",
    emoji: "🦊",
    model: "claude-sonnet-4-5-20250929",
    status: "connected",
    autoBuild: true,
    isDefault: true,
    workspacePath: "~/.openclaw/agents/atlas",
    identityFile: "identity.md",
    personaFile: "persona.md",
    toolGuidanceFile: "tool-guidance.md",
    tools: [
      { name: "web-search", allowed: true, profile: "default" },
      { name: "code-interpreter", allowed: true, profile: "default" },
      { name: "file-manager", allowed: true, profile: "default" },
      { name: "database-query", allowed: true, profile: "elevated" },
      { name: "custom-api", allowed: true, profile: "default" },
      { name: "exec", allowed: false },
    ],
    skillAllowlist: ["web-search", "code-interpreter", "file-manager", "database-query", "custom-api"],
    files: [
      { id: "af-1", name: "identity.md", type: "markdown", extension: "md", size: 2400, content: "# Atlas Identity\n\nYou are Atlas, a knowledgeable and resourceful AI assistant..." },
      { id: "af-2", name: "persona.md", type: "markdown", extension: "md", size: 1800, content: "# Persona\n\n- Friendly and professional\n- Concise responses\n- Proactive suggestions" },
      { id: "af-3", name: "tool-guidance.md", type: "markdown", extension: "md", size: 3200, content: "# Tool Guidance\n\n## web-search\nUse for current events and factual queries...\n\n## code-interpreter\nUse for data analysis and calculations..." },
    ],
  },
  {
    id: "agent-2",
    name: "Scout",
    emoji: "🐦",
    model: "claude-haiku-4-5-20251001",
    status: "disconnected",
    autoBuild: false,
    isDefault: false,
    workspacePath: "~/.openclaw/agents/scout",
    identityFile: "identity.md",
    tools: [
      { name: "web-search", allowed: true, profile: "default" },
      { name: "file-manager", allowed: true, profile: "default" },
    ],
    skillAllowlist: ["web-search", "file-manager"],
    files: [
      { id: "af-4", name: "identity.md", type: "markdown", extension: "md", size: 1200, content: "# Scout Identity\n\nYou are Scout, a lightweight assistant for quick lookups..." },
    ],
  },
];

// --- Config Sections ---

export const mockConfigSections: ConfigSection[] = [
  {
    key: "gateway",
    label: "Gateway",
    description: "Core gateway settings",
    fields: [
      { key: "port", label: "Port", type: "number", value: 4400, description: "Gateway listen port" },
      { key: "host", label: "Host", type: "string", value: "127.0.0.1", description: "Bind address" },
      { key: "tickInterval", label: "Tick Interval", type: "number", value: 30, description: "Heartbeat interval in seconds" },
    ],
  },
  {
    key: "auth",
    label: "Authentication",
    description: "Authentication and security settings",
    fields: [
      { key: "mode", label: "Auth Mode", type: "select", value: "token", options: ["none", "token", "password"], description: "Authentication method" },
      { key: "token", label: "Gateway Token", type: "string", value: "oc_live_xxxxxxxxxxxx", description: "API token for gateway access" },
    ],
  },
  {
    key: "models",
    label: "Models",
    description: "AI model configuration",
    fields: [
      { key: "default", label: "Default Model", type: "string", value: "claude-sonnet-4-5-20250929", description: "Default model for new sessions" },
      { key: "fallback", label: "Fallback Model", type: "string", value: "claude-haiku-4-5-20251001", description: "Fallback when primary is unavailable" },
    ],
  },
  {
    key: "session",
    label: "Session",
    description: "Session defaults and behavior",
    fields: [
      { key: "defaultThinking", label: "Default Thinking Level", type: "select", value: "medium", options: ["low", "medium", "high"], description: "Default thinking level for new sessions" },
      { key: "maxTokens", label: "Max Tokens", type: "number", value: 4096, description: "Maximum output tokens per turn" },
      { key: "sandbox", label: "Sandbox Mode", type: "boolean", value: true, description: "Run code in sandboxed environment" },
    ],
  },
  {
    key: "channels",
    label: "Channels",
    description: "Channel configuration",
    fields: [
      { key: "autoReconnect", label: "Auto Reconnect", type: "boolean", value: true, description: "Automatically reconnect dropped channels" },
      { key: "reconnectDelay", label: "Reconnect Delay", type: "number", value: 5, description: "Delay in seconds before reconnecting" },
    ],
  },
  {
    key: "skills",
    label: "Skills",
    description: "Skill loading and management",
    fields: [
      { key: "autoLoad", label: "Auto Load", type: "boolean", value: true, description: "Automatically load skills on startup" },
      { key: "workspacePath", label: "Workspace Path", type: "string", value: "~/.openclaw/skills", description: "Path to workspace skills directory" },
    ],
  },
  {
    key: "tools",
    label: "Tools",
    description: "Tool permissions and defaults",
    fields: [
      { key: "defaultProfile", label: "Default Profile", type: "select", value: "default", options: ["default", "elevated", "restricted"], description: "Default permission profile" },
      { key: "execApproval", label: "Exec Approval", type: "select", value: "ask", options: ["ask", "allow", "deny"], description: "Default exec command approval mode" },
    ],
  },
  {
    key: "logging",
    label: "Logging",
    description: "Log output settings",
    fields: [
      { key: "level", label: "Log Level", type: "select", value: "info", options: ["trace", "debug", "info", "warn", "error", "fatal"], description: "Minimum log level" },
      { key: "file", label: "Log File", type: "string", value: "~/.openclaw/gateway.log", description: "Log file path" },
      { key: "maxSize", label: "Max Size (MB)", type: "number", value: 50, description: "Maximum log file size before rotation" },
    ],
  },
  {
    key: "cron",
    label: "Cron",
    description: "Cron scheduler settings",
    fields: [
      { key: "enabled", label: "Enabled", type: "boolean", value: true, description: "Enable cron scheduler" },
      { key: "timezone", label: "Timezone", type: "string", value: "America/Los_Angeles", description: "Timezone for cron expressions" },
    ],
  },
  {
    key: "web",
    label: "Web",
    description: "Web UI and WebChat settings",
    fields: [
      { key: "enabled", label: "Web UI Enabled", type: "boolean", value: true, description: "Serve the web dashboard" },
      { key: "webChatEnabled", label: "WebChat Enabled", type: "boolean", value: true, description: "Enable WebChat widget" },
    ],
  },
  {
    key: "messages",
    label: "Messages",
    description: "Message handling settings",
    fields: [
      { key: "maxLength", label: "Max Message Length", type: "number", value: 32000, description: "Maximum characters per message" },
      { key: "rateLimit", label: "Rate Limit", type: "number", value: 30, description: "Max messages per minute per session" },
    ],
  },
  {
    key: "hooks",
    label: "Hooks",
    description: "Event hook configuration",
    fields: [
      { key: "onMessage", label: "On Message", type: "string", value: "", description: "Script to run on new message" },
      { key: "onSessionStart", label: "On Session Start", type: "string", value: "", description: "Script to run when session starts" },
    ],
  },
  {
    key: "browser",
    label: "Browser",
    description: "Browser automation settings",
    fields: [
      { key: "enabled", label: "Enabled", type: "boolean", value: false, description: "Enable browser automation" },
      { key: "headless", label: "Headless", type: "boolean", value: true, description: "Run browser in headless mode" },
    ],
  },
  {
    key: "audio",
    label: "Audio",
    description: "Voice and audio settings",
    fields: [
      { key: "enabled", label: "Enabled", type: "boolean", value: false, description: "Enable audio/voice features" },
      { key: "wakeWord", label: "Wake Word", type: "string", value: "", description: "Custom wake word" },
    ],
  },
  {
    key: "discovery",
    label: "Discovery",
    description: "Network discovery settings",
    fields: [
      { key: "enabled", label: "Enabled", type: "boolean", value: true, description: "Enable mDNS discovery" },
      { key: "serviceName", label: "Service Name", type: "string", value: "openclaw", description: "mDNS service name" },
    ],
  },
  {
    key: "plugins",
    label: "Plugins",
    description: "Plugin management",
    fields: [
      { key: "autoLoad", label: "Auto Load", type: "boolean", value: true, description: "Auto-load plugins on startup" },
      { key: "directory", label: "Plugin Directory", type: "string", value: "~/.openclaw/plugins", description: "Plugin directory path" },
    ],
  },
];

// --- Debug ---

export const mockDebugSnapshot: DebugSnapshot = {
  status: "healthy",
  uptime: 86400 * 3 + 3600 * 7 + 60 * 23,
  instanceCount: 4,
  sessionCount: 6,
  cronEnabled: true,
  cronNextWake: new Date(Date.now() + 1000 * 60 * 7),
  securityIssues: [
    { level: "warning", message: "Gateway token has not been rotated in 30 days" },
    { level: "info", message: "2 nodes using outdated client version (0.7.x)" },
    { level: "info", message: "WebChat widget exposed without auth gate" },
  ],
};

export const mockDebugEvents: DebugEvent[] = [
  { id: "evt-1", timestamp: new Date(Date.now() - 1000 * 30), type: "heartbeat", payload: '{"tick": 8642, "instances": 4, "sessions": 6}' },
  { id: "evt-2", timestamp: new Date(Date.now() - 1000 * 60), type: "channel.message", payload: '{"channel": "slack", "direction": "inbound", "size": 245}' },
  { id: "evt-3", timestamp: new Date(Date.now() - 1000 * 90), type: "session.created", payload: '{"key": "api-webhook", "kind": "api", "model": "claude-sonnet-4-5"}' },
  { id: "evt-4", timestamp: new Date(Date.now() - 1000 * 120), type: "skill.invoked", payload: '{"skill": "web-search", "agent": "atlas", "duration_ms": 2340}' },
  { id: "evt-5", timestamp: new Date(Date.now() - 1000 * 180), type: "cron.fired", payload: '{"job": "health-check", "status": "success", "duration_ms": 3000}' },
  { id: "evt-6", timestamp: new Date(Date.now() - 1000 * 240), type: "node.connected", payload: '{"node": "home-server", "platform": "linux", "version": "0.8.2"}' },
  { id: "evt-7", timestamp: new Date(Date.now() - 1000 * 300), type: "channel.error", payload: '{"channel": "slack", "error": "429 Too Many Requests", "retrying": true}' },
  { id: "evt-8", timestamp: new Date(Date.now() - 1000 * 360), type: "config.updated", payload: '{"section": "models", "field": "default", "old": "claude-haiku-4-5", "new": "claude-sonnet-4-5"}' },
];

// --- Logs ---

export const mockLogEntries: LogEntry[] = [
  { id: "log-01", timestamp: new Date(Date.now() - 1000 * 300), level: "info", subsystem: "gateway", message: "Gateway started on http://localhost:4400" },
  { id: "log-02", timestamp: new Date(Date.now() - 1000 * 295), level: "info", subsystem: "websocket", message: "WebSocket server listening on ws://localhost:4400/ws" },
  { id: "log-03", timestamp: new Date(Date.now() - 1000 * 290), level: "info", subsystem: "skills", message: "Loaded 7 skills (5 active, 2 inactive)" },
  { id: "log-04", timestamp: new Date(Date.now() - 1000 * 285), level: "warn", subsystem: "skills", message: "Skill 'image-gen' has unmet dependency: pillow>=10.2.0" },
  { id: "log-05", timestamp: new Date(Date.now() - 1000 * 280), level: "info", subsystem: "channels", message: "Connected to 7 channels (4 providers)" },
  { id: "log-06", timestamp: new Date(Date.now() - 1000 * 240), level: "debug", subsystem: "cron", message: "Cron scheduler started. 5 jobs registered, 4 enabled" },
  { id: "log-07", timestamp: new Date(Date.now() - 1000 * 200), level: "info", subsystem: "nodes", message: "Node 'macbook-pro' connected (darwin, v0.8.2)" },
  { id: "log-08", timestamp: new Date(Date.now() - 1000 * 180), level: "info", subsystem: "nodes", message: "Node 'home-server' connected (linux, v0.8.2)" },
  { id: "log-09", timestamp: new Date(Date.now() - 1000 * 150), level: "trace", subsystem: "heartbeat", message: "Tick #8640: 4 instances, 6 sessions" },
  { id: "log-10", timestamp: new Date(Date.now() - 1000 * 120), level: "info", subsystem: "session", message: "Session 'main' resumed (15.4K tokens)" },
  { id: "log-11", timestamp: new Date(Date.now() - 1000 * 90), level: "debug", subsystem: "channels", message: "Slack: processing inbound message (245 bytes)" },
  { id: "log-12", timestamp: new Date(Date.now() - 1000 * 60), level: "error", subsystem: "channels", message: "Slack webhook delivery failed: 429 Too Many Requests" },
  { id: "log-13", timestamp: new Date(Date.now() - 1000 * 45), level: "warn", subsystem: "channels", message: "Slack: rate limited, retrying in 5s" },
  { id: "log-14", timestamp: new Date(Date.now() - 1000 * 40), level: "info", subsystem: "channels", message: "Slack webhook retry succeeded" },
  { id: "log-15", timestamp: new Date(Date.now() - 1000 * 30), level: "debug", subsystem: "heartbeat", message: "Health check: all services nominal" },
  { id: "log-16", timestamp: new Date(Date.now() - 1000 * 15), level: "info", subsystem: "cron", message: "Job 'health-check' completed in 3.0s" },
  { id: "log-17", timestamp: new Date(Date.now() - 1000 * 5), level: "trace", subsystem: "heartbeat", message: "Tick #8641: 4 instances, 6 sessions" },
];

// --- Cost Snapshot ---

export const mockCostSnapshot: CostSnapshot = {
  todaySpend: 4.82,
  todayTokens: 427000,
  dailyBudget: 10.0,
  burnRatePerHour: 1.24,
  burnRateTokensPerMin: 185,
  timeToLimitHours: 4.2,
  isIdle: false,
  projectedMonthly: 142.0,
  dailyTrend: [
    { date: "Feb 12", cost: 3.62, tokens: 312000 },
    { date: "Feb 13", cost: 5.54, tokens: 478000 },
    { date: "Feb 14", cost: 7.81, tokens: 674000 },
    { date: "Feb 15", cost: 4.68, tokens: 404000 },
    { date: "Feb 16", cost: 5.74, tokens: 496000 },
    { date: "Feb 17", cost: 6.84, tokens: 590000 },
    { date: "Feb 18", cost: 4.82, tokens: 427000 },
  ],
  modelSplit: [
    { model: "Sonnet 4.5", cost: 3.18, percentage: 66, color: "#6366f1" },
    { model: "Haiku 4.5", cost: 1.22, percentage: 25, color: "#06b6d4" },
    { model: "Opus 4.6", cost: 0.42, percentage: 9, color: "#f59e0b" },
  ],
};

// --- Channel Health ---

export const mockChannelHealth: ChannelHealth[] = [
  { name: "WhatsApp", provider: "whatsapp", status: "connected" },
  { name: "Telegram", provider: "telegram", status: "connected" },
  { name: "Discord", provider: "discord", status: "connected" },
  { name: "Slack", provider: "slack", status: "degraded" },
  { name: "Teams", provider: "teams", status: "connected" },
];

export const mockAgentState: AgentState = "running";

// --- Activity Heatmap ---

export interface MockHeatmapCell {
  day: string;
  hour: number;
  messages: number;
  tokens: number;
}

// Simple seeded PRNG (mulberry32) — deterministic across server/client
function seededRandom(seed: number): () => number {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildMockHeatmap(): {
  cells: MockHeatmapCell[];
  maxMessages: number;
  days: string[];
  currentStreak: number;
  longestStreak: number;
} {
  const rand = seededRandom(42);
  const days: string[] = [];
  const cells: MockHeatmapCell[] = [];
  let maxMessages = 0;

  // Use a fixed reference date so the grid is stable across renders
  const ref = new Date("2025-02-18T00:00:00");

  for (let i = 29; i >= 0; i--) {
    const d = new Date(ref);
    d.setDate(d.getDate() - i);
    const day = d.toISOString().split("T")[0];
    days.push(day);

    for (let hour = 0; hour < 24; hour++) {
      const isActiveHour = hour >= 8 && hour <= 23;
      const isWeekday = d.getDay() >= 1 && d.getDay() <= 5;
      const baseProb = isActiveHour ? (isWeekday ? 0.6 : 0.3) : 0.05;
      const messages = rand() < baseProb
        ? Math.floor(rand() * (isActiveHour ? 15 : 3)) + 1
        : 0;
      const tokens = messages * (Math.floor(rand() * 2000) + 500);

      if (messages > maxMessages) maxMessages = messages;
      cells.push({ day, hour, messages, tokens });
    }
  }

  return { cells, maxMessages, days, currentStreak: 12, longestStreak: 23 };
}

export const mockHeatmap = buildMockHeatmap();

// --- Activity Feed ---

// --- Tasks ---

export const mockTasks: Task[] = [
  {
    id: "task-1",
    title: "Implement webhook retry logic",
    description: "Add exponential backoff for failed webhook deliveries. Max 3 retries with 1s, 5s, 25s delays.",
    status: "in_progress",
    priority: "high",
    assignee: { id: "agent-1", name: "Atlas", type: "agent", emoji: "🦊" },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48),
    updatedAt: new Date(Date.now() - 1000 * 60 * 30),
    dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24),
    tags: ["backend", "reliability"],
  },
  {
    id: "task-2",
    title: "Design settings page mockups",
    status: "done",
    priority: "medium",
    assignee: { id: "human-1", name: "Carlos", type: "human", emoji: "👤" },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 4),
    tags: ["design", "ui"],
  },
  {
    id: "task-3",
    title: "Add rate limiting to API endpoints",
    description: "Implement per-session rate limiting using a sliding window algorithm.",
    status: "backlog",
    priority: "urgent",
    assignee: { id: "agent-1", name: "Atlas", type: "agent", emoji: "🦊" },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
    tags: ["backend", "security"],
  },
  {
    id: "task-4",
    title: "Write unit tests for cron scheduler",
    status: "review",
    priority: "medium",
    assignee: { id: "agent-2", name: "Scout", type: "agent", emoji: "🐦" },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 36),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
    tags: ["testing"],
  },
  {
    id: "task-5",
    title: "Update knowledge base embeddings",
    description: "Re-index all documents after schema migration.",
    status: "in_progress",
    priority: "low",
    assignee: { id: "agent-3", name: "Forge", type: "agent", emoji: "🔨" },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12),
    updatedAt: new Date(Date.now() - 1000 * 60 * 45),
    tags: ["data", "embeddings"],
  },
  {
    id: "task-6",
    title: "Fix Discord message threading",
    status: "backlog",
    priority: "high",
    assignee: { id: "human-1", name: "Carlos", type: "human", emoji: "👤" },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 8),
    tags: ["channels", "bug"],
  },
  {
    id: "task-7",
    title: "Audit tool permission profiles",
    status: "review",
    priority: "high",
    assignee: { id: "agent-1", name: "Atlas", type: "agent", emoji: "🦊" },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 60),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 1),
    tags: ["security", "audit"],
  },
  {
    id: "task-8",
    title: "Add Mattermost channel adapter",
    status: "backlog",
    priority: "low",
    assignee: { id: "agent-4", name: "Whisper", type: "agent", emoji: "🌙" },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 96),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 96),
    tags: ["channels", "integration"],
  },
  {
    id: "task-9",
    title: "Optimize token counting pipeline",
    description: "Current implementation double-counts cache tokens. Reduce overhead by 40%.",
    status: "in_progress",
    priority: "medium",
    assignee: { id: "agent-1", name: "Atlas", type: "agent", emoji: "🦊" },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 18),
    updatedAt: new Date(Date.now() - 1000 * 60 * 15),
    tags: ["performance", "tokens"],
  },
  {
    id: "task-10",
    title: "Document API authentication flow",
    status: "done",
    priority: "low",
    assignee: { id: "human-1", name: "Carlos", type: "human", emoji: "👤" },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 120),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 48),
    tags: ["docs"],
  },
];

// --- Memories ---

export const mockMemories: Memory[] = [
  {
    id: "mem-1",
    title: "User prefers concise responses",
    content: "Based on multiple conversations, the user consistently asks for shorter, more direct answers. They prefer bullet points over paragraphs and dislike excessive caveats or hedging. When presenting options, limit to top 3 rather than exhaustive lists.\n\nExamples:\n- \"Just give me the answer\" (sess-main, Feb 12)\n- \"Too long, summarize in 3 bullets\" (sess-support, Feb 14)\n- Positive reaction to terse code reviews",
    summary: "User wants short, direct answers with bullet points — no hedging.",
    source: "observation",
    agentId: "agent-1",
    agentName: "Atlas",
    agentEmoji: "🦊",
    tags: ["preference", "communication"],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 12),
    tokenCount: 245,
  },
  {
    id: "mem-2",
    title: "Project uses Next.js 16 with App Router",
    content: "The ClawPanel project is built with:\n- Next.js 16.1.6 (App Router)\n- React 19.2.3\n- Tailwind CSS v4\n- TypeScript 5.x\n- lucide-react for icons\n\nKey patterns:\n- All pages use \"use client\" directive\n- State managed through React Context (GatewayContext)\n- Mock data in src/lib/mock-data.ts\n- Component structure: src/components/<feature>/<component>.tsx",
    summary: "Next.js 16 + React 19 + Tailwind v4, App Router, Context-based state.",
    source: "research",
    agentId: "agent-1",
    agentName: "Atlas",
    agentEmoji: "🦊",
    tags: ["tech-stack", "architecture"],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 96),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
    tokenCount: 312,
  },
  {
    id: "mem-3",
    title: "Competitor analysis: Rivet vs OpenClaw",
    content: "Rivet (by Ironclad) is the closest competitor to OpenClaw:\n\n**Rivet strengths:**\n- Visual node-based editor for AI workflows\n- Strong TypeScript SDK\n- Active open-source community (4.2k stars)\n\n**OpenClaw advantages:**\n- Multi-channel messaging (WhatsApp, Telegram, Discord, etc.)\n- Built-in cron scheduler\n- Node mesh for cross-device orchestration\n- Real-time dashboard (ClawPanel)\n\n**Key differentiator:** OpenClaw is the only platform with native multi-device orchestration and channel routing.",
    summary: "Rivet has visual editor; OpenClaw wins on multi-channel + device mesh.",
    source: "research",
    agentId: "agent-2",
    agentName: "Scout",
    agentEmoji: "🐦",
    tags: ["competitive", "strategy"],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 48),
    tokenCount: 489,
  },
  {
    id: "mem-4",
    title: "Webhook retry strategy decided",
    content: "After discussing with the user, we settled on exponential backoff for webhook retries:\n\n1. First retry: 1 second delay\n2. Second retry: 5 seconds delay\n3. Third retry: 25 seconds delay\n4. After 3 failures: mark as dead letter, notify via system channel\n\nThe user explicitly rejected circuit-breaker pattern as too complex for v0.8. Will revisit in v1.0.",
    summary: "Exponential backoff (1s, 5s, 25s), 3 max retries, then dead letter.",
    source: "conversation",
    agentId: "agent-1",
    agentName: "Atlas",
    agentEmoji: "🦊",
    tags: ["architecture", "webhooks", "decision"],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 36),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 36),
    tokenCount: 178,
  },
  {
    id: "mem-5",
    title: "Token costs are trending up",
    content: "Observed a 23% increase in daily token spend over the past week. Primary driver is the support-chat session which uses high thinking level.\n\nRecommendation: Switch support-chat to medium thinking level. Estimated savings: $0.40/day (~$12/month).\n\nThe user acknowledged but hasn't acted yet. Will remind again if spend exceeds $8/day.",
    summary: "Token spend up 23% — support-chat's high thinking is the main driver.",
    source: "reflection",
    agentId: "agent-1",
    agentName: "Atlas",
    agentEmoji: "🦊",
    tags: ["cost", "optimization"],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 18),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 18),
    tokenCount: 156,
  },
  {
    id: "mem-6",
    title: "Deploy process for ClawPanel",
    content: "Steps to deploy ClawPanel:\n1. Run `npm run build` to create production build\n2. Run `npm run start` to serve on localhost:3000\n3. For custom port: `PORT=3002 npm run start`\n4. For Tailscale: bind to 0.0.0.0 and use Tailscale hostname\n\nNote: The user runs dev on port 3002 locally to avoid conflicts with other projects.",
    summary: "Build with npm, serve on 3002 locally, Tailscale for remote access.",
    source: "user_note",
    agentId: "agent-1",
    agentName: "Atlas",
    agentEmoji: "🦊",
    tags: ["deploy", "process"],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 120),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
    tokenCount: 134,
  },
  {
    id: "mem-7",
    title: "Slack rate limit workaround",
    content: "Slack's API has aggressive rate limits (1 msg/sec for webhooks). When we hit 429 errors:\n\n1. Queue the message in an in-memory buffer\n2. Wait for Retry-After header value\n3. Drain queue with 1.1s spacing\n4. Log all rate limit events for monitoring\n\nThis was implemented in gateway v0.8.1. The webhook retry task (task-1) builds on top of this.",
    summary: "Queue + Retry-After + 1.1s spacing handles Slack 429s. In v0.8.1.",
    source: "observation",
    agentId: "agent-1",
    agentName: "Atlas",
    agentEmoji: "🦊",
    tags: ["slack", "rate-limit", "channels"],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 60),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 60),
    tokenCount: 203,
  },
  {
    id: "mem-8",
    title: "Security audit findings",
    content: "Last security review (Feb 10) found:\n\n**Critical:** None\n\n**Warnings:**\n- Gateway token hasn't been rotated in 30 days\n- WebChat widget exposed without auth gate\n\n**Info:**\n- 2 nodes running outdated client (0.7.x)\n- exec tool disabled by default (good)\n\nAction items:\n- [ ] Rotate gateway token (assigned to Carlos)\n- [ ] Add auth gate to WebChat (backlog)\n- [ ] Update node clients (reminder sent)",
    summary: "No critical issues. Token rotation overdue, WebChat needs auth gate.",
    source: "reflection",
    agentId: "agent-1",
    agentName: "Atlas",
    agentEmoji: "🦊",
    tags: ["security", "audit"],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 192),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
    tokenCount: 287,
  },
];

// --- Agent Desks (Office) ---

export const mockAgentDesks: AgentDesk[] = [
  {
    id: "desk-1",
    agentId: "agent-1",
    agentName: "Atlas",
    agentEmoji: "🦊",
    status: "working",
    currentTask: "Implementing webhook retry logic",
    model: "claude-sonnet-4-5",
    position: { row: 0, col: 0 },
    deskStyle: "modern",
    itemsOnDesk: ["☕", "🖥️", "📓", "🪴"],
    sessionCount: 3,
    uptimeMinutes: 247,
  },
  {
    id: "desk-2",
    agentId: "agent-2",
    agentName: "Scout",
    agentEmoji: "🐦",
    status: "idle",
    model: "claude-haiku-4-5",
    position: { row: 0, col: 1 },
    deskStyle: "minimal",
    itemsOnDesk: ["🖥️", "🎧"],
    sessionCount: 1,
    uptimeMinutes: 62,
  },
  {
    id: "desk-3",
    agentId: "agent-3",
    agentName: "Forge",
    agentEmoji: "🔨",
    status: "thinking",
    currentTask: "Optimizing embedding pipeline",
    model: "claude-opus-4-6",
    position: { row: 1, col: 0 },
    deskStyle: "workshop",
    itemsOnDesk: ["☕", "🖥️", "🔧", "📓", "⚡"],
    sessionCount: 2,
    uptimeMinutes: 184,
  },
  {
    id: "desk-4",
    agentId: "agent-4",
    agentName: "Whisper",
    agentEmoji: "🌙",
    status: "working",
    currentTask: "Drafting Mattermost adapter spec",
    model: "claude-sonnet-4-5",
    position: { row: 1, col: 1 },
    deskStyle: "cozy",
    itemsOnDesk: ["🖥️", "🪴", "🧋"],
    sessionCount: 1,
    uptimeMinutes: 95,
  },
];

// --- Activity Feed ---

export const mockActivityEvents: ActivityEvent[] = [
  {
    id: "act-1",
    agentName: "Atlas",
    agentEmoji: "🦊",
    type: "build",
    description: "Rebuilt workspace after config change",
    timestamp: new Date(Date.now() - 1000 * 30),
    detail: "3 files reprocessed",
  },
  {
    id: "act-2",
    agentName: "Atlas",
    agentEmoji: "🦊",
    type: "skill",
    description: "Ran web-search",
    timestamp: new Date(Date.now() - 1000 * 60 * 2),
    detail: "Query: 'OpenClaw v0.9 release notes'",
  },
  {
    id: "act-3",
    agentName: "Atlas",
    agentEmoji: "🦊",
    type: "file",
    description: "Updated knowledge-base.txt",
    timestamp: new Date(Date.now() - 1000 * 60 * 4),
    detail: "+12 entries added",
  },
  {
    id: "act-4",
    agentName: "Atlas",
    agentEmoji: "🦊",
    type: "git",
    description: "Created a repo",
    timestamp: new Date(Date.now() - 1000 * 60 * 8),
    detail: "atlas-workspace",
  },
  {
    id: "act-5",
    agentName: "Atlas",
    agentEmoji: "🦊",
    type: "message",
    description: "Responded to user in Main Chat",
    timestamp: new Date(Date.now() - 1000 * 60 * 11),
  },
  {
    id: "act-6",
    agentName: "Atlas",
    agentEmoji: "🦊",
    type: "cron",
    description: "Health Check completed",
    timestamp: new Date(Date.now() - 1000 * 60 * 15),
    detail: "All 7 channels healthy",
  },
  {
    id: "act-7",
    agentName: "Scout",
    agentEmoji: "🐦",
    type: "channel",
    description: "Received message on Discord",
    timestamp: new Date(Date.now() - 1000 * 60 * 18),
    detail: "#support",
  },
  {
    id: "act-8",
    agentName: "Atlas",
    agentEmoji: "🦊",
    type: "file",
    description: "Updated SOUL.md",
    timestamp: new Date(Date.now() - 1000 * 60 * 25),
    detail: "Persona refinements",
  },
  {
    id: "act-9",
    agentName: "Atlas",
    agentEmoji: "🦊",
    type: "skill",
    description: "Ran code-interpreter",
    timestamp: new Date(Date.now() - 1000 * 60 * 32),
    detail: "Data analysis completed in 4.2s",
  },
  {
    id: "act-10",
    agentName: "Atlas",
    agentEmoji: "🦊",
    type: "session",
    description: "Started new session",
    timestamp: new Date(Date.now() - 1000 * 60 * 45),
    detail: "Support Chat",
  },
  {
    id: "act-11",
    agentName: "Atlas",
    agentEmoji: "🦊",
    type: "node",
    description: "Home Server came online",
    timestamp: new Date(Date.now() - 1000 * 60 * 60),
    detail: "Ubuntu 24.04 LTS",
  },
  {
    id: "act-12",
    agentName: "Atlas",
    agentEmoji: "🦊",
    type: "cron",
    description: "Daily Report delivered",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3),
    detail: "Sent to 3 channels",
  },
];
