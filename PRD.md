# ClawPanel — Product Spec v1.0

**A better dashboard for OpenClaw.**

`npx clawpanel` or `npm install -g clawpanel` → `clawpanel start` → `http://localhost:7070`

---

## Philosophy

ClawPanel is a **monitor, not a config editor.** The existing OpenClaw Control UI tries to be everything — chat interface, settings panel, debug tool, admin console — and does all of it poorly. ClawPanel takes the opposite approach:

- **Watch** what your agent is doing
- **Understand** what it's costing you
- **Verify** it's healthy and connected
- **If you need to change something, message your agent.** That's the whole point of having one.

The design principle: **first-class the things people check daily, second-class the things they set once, and omit the things the agent handles better than a GUI.**

---

## Why This Exists

Based on community research (GitHub issues, Discord, Reddit, blog posts):

1. **Cost is the #1 pain.** Users report surprise bills of $200/day, $3,600/month. The built-in cost tracking is minimal. People are manually running jq commands against session JSONL files to figure out what happened.

2. **"Is my agent working?" is the #2 question.** The Control UI has literal bugs — unresponsive buttons, WebSocket drops, auth failures (#10132: chat doesn't re-render on incoming messages, #1690: token auth failures, #2672: PWA background kills WS). Users fall back to CLI commands (`openclaw status`, `openclaw gateway status`) to check health.

3. **Session visibility is #3.** People want to see what their agent did overnight, what tools it called, what it said on their behalf across channels. The current UI makes this hard to browse.

4. **The existing dashboard is fragile.** #11836: Discord gateway infinite reconnect loop starving the event loop. #11329: WebSocket doesn't bind to LAN. #8901: tool events suppressed when verbose is off — users building dashboards can't get data without spamming channels.

---

## Distribution

**Hybrid: npm package + OpenClaw skill shim**

- **Primary:** `npx clawpanel` (zero-install) or `npm install -g clawpanel` — standalone Node.js process, serves web UI
- **Secondary:** OpenClaw skill on ClawHub that detects/links to ClawPanel, can bootstrap install
- The npm package is the product. The skill is a discovery channel.

### Build Order

- **Weeks 1–3:** Ship npm package (full v1)
- **Week 4:** Write SKILL.md, publish to ClawHub (~30 min work)

---

## Architecture

```
┌─────────────────────────────┐
│  Browser (Next.js app)      │
│  http://localhost:7070      │
└──────────┬──────────────────┘
           │ HTTP + WS
┌──────────▼──────────────────┐
│  ClawPanel Server           │
│  (Next.js API routes)       │
│                             │
│  - WS proxy to gateway      │
│  - Session file reader      │
│  - Cost aggregator          │
│  - Cron/skills proxy        │
└──────────┬──────────────────┘
           │ WebSocket + filesystem
┌──────────▼──────────────────┐
│  OpenClaw Gateway           │
│  ws://127.0.0.1:18789       │
│                             │
│  ~/.openclaw/               │
│    ├─ openclaw.json         │
│    ├─ agents/<id>/sessions/ │
│    │    └─ *.jsonl          │
│    └─ cron/                 │
└─────────────────────────────┘
```

ClawPanel is a **read-mostly client**. It connects to the gateway as an `operator` role via WebSocket (same protocol as Control UI, CLI, and macOS app) and reads session JSONL files from disk for cost aggregation.

### Stack

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui (heavily styled)
- Recharts (cost charts)
- WebSocket (native, matching gateway protocol)

---

## Gateway WebSocket Protocol Reference

All communication with OpenClaw goes through a single WebSocket connection. The protocol is JSON over text frames.

### Connection Handshake

1. Client opens WebSocket to `ws://127.0.0.1:18789`
2. Gateway sends a challenge:
```json
{
  "type": "event",
  "event": "connect.challenge",
  "payload": { "nonce": "...", "ts": 1737264000000 }
}
```
3. Client responds with `connect` frame:
```json
{
  "type": "connect",
  "params": {
    "role": "operator",
    "scope": ["operator.admin"],
    "auth": { "token": "<gateway-token>" }
  }
}
```
4. Gateway responds with `hello-ok` snapshot:
```json
{
  "type": "event",
  "event": "hello-ok",
  "payload": {
    "presence": [...],
    "health": {...},
    "stateVersion": 42,
    "uptimeMs": 86400000,
    "limits": {...},
    "policy": {...}
  }
}
```

### Message Types

**Request → Response (RPC):**
```
Client:  { "type": "req", "id": "uuid", "method": "...", "params": {...} }
Gateway: { "type": "res", "id": "uuid", "ok": true, "payload": {...} }
         { "type": "res", "id": "uuid", "ok": false, "error": {...} }
```

**Events (Gateway → Client):**
```
{ "type": "event", "event": "...", "payload": {...}, "seq": 42, "stateVersion": 43 }
```

Side-effecting methods require `idempotencyKey`. The gateway keeps a short-lived dedupe cache.

### Events We Subscribe To

| Event | Purpose in ClawPanel |
|---|---|
| `agent` | Activity feed — tool calls, run progress, streaming |
| `chat` | Activity feed — messages sent/received across channels |
| `presence` | Health bar — connected instances, devices |
| `health` | Health bar — gateway & channel health changes |
| `tick` | Heartbeat liveness indicator |
| `heartbeat` | Heartbeat execution events |
| `shutdown` | Show gateway stopping gracefully |

Note: Events are **not replayed**. On sequence gaps (e.g., after reconnect), refresh state via `health` and `system-presence` RPC calls before continuing. This is a known issue (#2672) — ClawPanel must handle reconnection gracefully with `visibilitychange` listener.

### RPC Methods We Call

**Health & Status:**
| Method | Returns | Used For |
|---|---|---|
| `status` | Gateway status snapshot | Health bar |
| `health` | Full health including channel probes | Health bar, channel status |
| `models.list` | Configured models + auth status | Health bar (active model) |
| `system-presence` | Connected devices/clients | Health bar (instances) |

**Sessions:**
| Method | Returns | Used For |
|---|---|---|
| `sessions.list` | Session rows (key, kind, updated, messages) | Session browser |
| `chat.history` | Message history for a session | Session detail view |

`sessions.list` params: `{ kinds?: string[], limit?: number, activeMinutes?: number, messageLimit?: number }`. Kinds: `"main"`, `"group"`, `"cron"`, `"hook"`, `"node"`, `"other"`.

**Skills:**
| Method | Returns | Used For |
|---|---|---|
| `skills.*` | Installed skills, status, enabled state | Skills overview |

**Cron:**
| Method | Returns | Used For |
|---|---|---|
| `cron.list` | All cron jobs with schedule/status | Cron overview |
| `cron.runs` | Run history for a specific job | Cron detail |
| `cron.enable` | Enable a job | Cron toggle |
| `cron.disable` | Disable a job | Cron toggle |
| `cron.run` | Trigger manual run | Cron manual trigger |

**Channels:**
| Method | Returns | Used For |
|---|---|---|
| `channels.status` | Per-channel connection state | Health bar |

**Chat (non-blocking):**
| Method | Returns | Used For |
|---|---|---|
| `chat.send` | `{ runId, status: "started" }` — response streams via `chat` events | N/A (v1 is read-only) |
| `chat.abort` | Abort active run | Emergency stop button |

### Auth Flow

1. **Local (loopback):** Auto-approved device pairing. Read token from `~/.openclaw/openclaw.json` at `gateway.auth.token`.
2. **Remote/LAN:** Requires device pairing approval via `openclaw devices approve <id>` plus token.
3. **Tailscale:** Can authenticate via identity headers when `gateway.auth.allowTailscale` is true.

ClawPanel auto-detects local token on startup. For remote connections, provides a token paste field.

---

## Cost Tracking (Hero Feature)

### Data Sources

**Primary: Session JSONL files**
- Location: `~/.openclaw/agents/<agentId>/sessions/*.jsonl`
- Each line is a JSON object representing a message/event in the session
- Contains token usage per message: input tokens, output tokens, cache read/write tokens
- ClawPanel reads these files directly from disk (no gateway RPC needed)

**Secondary: Model pricing config**
- Location: `~/.openclaw/openclaw.json` → `models.providers.*.pricing`
- Format: USD per 1M tokens for `input`, `output`, `cacheRead`, `cacheWrite`
- If pricing is missing, ClawPanel shows tokens only (same behavior as OpenClaw)

**Tertiary: /usage cost equivalent**
- OpenClaw's `/usage cost` command aggregates from session logs
- ClawPanel replicates this logic client-side for real-time updates

### Cost Calculation

```
cost = (inputTokens × pricing.input / 1_000_000)
     + (outputTokens × pricing.output / 1_000_000)
     + (cacheReadTokens × pricing.cacheRead / 1_000_000)
     + (cacheWriteTokens × pricing.cacheWrite / 1_000_000)
```

OAuth sessions never show dollar cost (tokens only) — same as OpenClaw behavior.

### Cost UI Components

1. **Today's Spend** — Large, prominent number. The first thing you see. Shows both dollar cost and token count. Includes a progress ring toward the daily budget limit (if set).
2. **Burn Rate** — Live calculation: tokens/minute, cost/hour. Updates every 30 seconds based on the active session's recent activity. When the agent is idle, shows "Idle" instead of $0.00/hr.
3. **Time to Limit** — If a budget is set, extrapolate from burn rate: "At this rate, you'll hit your daily limit in ~3.2 hours." Shows a `safe` / `warning` / `critical` state based on remaining headroom. If no budget is set, this shows projected daily spend instead.
4. **7-Day Trend** — Sparkline or area chart showing daily spend. Highlights anomalies. Clicking a day drills into that day's session breakdown.
5. **Per-Session Breakdown** — Table: session name, model, tokens in/out, cost. Sortable.
6. **Per-Model Split** — Donut or bar chart showing cost distribution across models (e.g., Opus vs. Sonnet vs. Haiku).
7. **Projected Monthly** — Simple extrapolation: `(today × days_remaining) + spent_so_far`. Not a forecast, just math.
8. **Token Breakdown** — Input vs. output vs. cache read vs. cache write. Shows cache efficiency.
9. **Lifetime Stats** — All-time totals since first session: total tokens, total messages, total cost. Calculated from all JSONL files. Cached and incrementally updated (only re-read new/modified files).

### Budget Limits

Users configure budget limits in ClawPanel settings. These are stored in `~/.clawpanel/config.json` — purely ClawPanel-side, no gateway involvement.

```json
{
  "budgets": {
    "daily": { "enabled": true, "amount": 10.00, "currency": "USD" },
    "monthly": { "enabled": true, "amount": 150.00, "currency": "USD" }
  }
}
```

**How limits display:**

- **Progress ring** around today's spend: green (< 60%), yellow (60–85%), red (> 85%)
- **Budget bar** on the dashboard: thin horizontal bar showing spend vs. limit with color transitions
- **Burn rate context**: "At current rate, you'll exhaust today's budget by 4:30 PM" or "You're on pace to spend $187 this month (limit: $150)"
- **Browser notification** when crossing 80% of daily or monthly limit (if notifications are permitted)
- **Health bar indicator**: subtle cost icon turns yellow/red when approaching limits

ClawPanel does not pause or stop the agent. It's a monitor, not a governor. The limit is informational — it tells you what's happening, not what to do about it.

**Burn rate calculation:**

```
recentWindow = last 15 minutes of token activity (from active session JSONL)
tokensPerMinute = totalTokensInWindow / windowMinutes
costPerHour = (tokensPerMinute × 60 × weightedPricePerToken)
timeToLimit = (dailyBudget - todaySpend) / costPerHour
```

When multiple models are used within the window, cost/hour uses a weighted average based on actual model distribution. When the agent is idle (no tokens in the last 5 minutes), burn rate displays "Idle" and time-to-limit is hidden.

### Cost Alerts (v1)

- User sets daily/monthly budget threshold in ClawPanel settings
- ClawPanel checks on each cost recalculation (every 30 seconds)
- Visual indicators: progress ring, budget bar, health bar icon color
- **Browser notifications** (via Notification API) when crossing 80% and 100% of any active budget. Notification includes current spend and burn rate. Requires user permission grant — prompted on first budget configuration, never nagged.
- Notification example: *"⚠️ Daily budget 80% used — $8.12 of $10.00. Burning ~$2.40/hr."*

---

## Feature Specifications

### 1. Dashboard (Home)

The single-page overview. Everything glanceable in 3 seconds.

#### Health Bar (top strip)

A persistent status bar showing:
- **Gateway status:** Connected / Disconnected / Reconnecting (with uptime)
- **Active model:** Current primary model name (from `models.list`)
- **Connected channels:** Icons for each channel with green/yellow/red status (from `channels.status`)
- **Agent state:** Idle / Running / Error

Data source: `hello-ok` snapshot on connect, then `health` + `presence` events for live updates.

#### Cost Tracker (hero section)

See "Cost Tracking" section above. This is the centerpiece of the dashboard.

#### Activity Feed (live stream)

Real-time stream of agent actions, powered by `agent` and `chat` events over WebSocket.

Each entry shows:
- Timestamp
- Event type icon (message, tool call, cron run, skill invocation)
- Channel badge (WhatsApp, Telegram, Discord, etc.)
- Summary text (e.g., "Sent reply in WhatsApp DM", "Ran `exec` tool: git status")
- Expandable detail for tool calls (input/output)

Filterable by: channel, event type, time range.

**Important:** Issue #8901 documents that tool events are suppressed when `verboseDefault: "off"`. ClawPanel should work regardless of verbose setting. If tool events are not streaming, show a notice: *"Tool events are hidden. Set `verboseDefault: 'tools'` in your config to see tool activity here, or message your agent: 'turn on tool streaming'."*

Long-term, ClawPanel should advocate for the upstream fix proposed in #8901 (decouple WS event broadcasting from channel verbose mode).

#### Session Summary (compact list)

Most recent 10 sessions with:
- Session key/name
- Channel origin
- Last active timestamp
- Message count
- Cost (if calculable)

Click to navigate to full session view.

#### Activity Heatmap

A 30-day grid (GitHub contribution graph style) showing agent activity intensity by hour of day.

- **Data source:** Session JSONL timestamps, aggregated into hourly buckets
- **Visualization:** 24 rows (hours) × 30 columns (days), cells colored by message/token volume
- **Color scale:** Empty → light → medium → dark (4 levels), using the accent color
- **Hover:** Shows exact count and cost for that hour-block
- **Purpose:** Reveals patterns — when is the agent busiest? Are cron jobs firing on schedule? Is there unexpected 3 AM activity?
- **Streak counter:** Below the heatmap, show current daily activity streak ("12-day streak") and longest streak. Small motivational touch for users who run agents daily.

### 2. Session Browser

Full-page session explorer.

#### Session List (left panel or top)

- All sessions from `sessions.list` with `kinds: ["main", "group", "cron", "hook", "other"]`
- Each row: session key, kind badge, channel, last active, message count, cost
- Sortable by: last active, cost, message count
- Filterable by: kind, channel, date range, model, status (active/idle/aborted)
- **Live search** across session keys and content (searches JSONL files, debounced 300ms)
- **Filter bar** persists across navigation — selecting filters updates the URL query string so filter state is bookmarkable

#### Session Detail (main area)

When a session is selected, load full conversation via `chat.history`:
- Full message thread rendered as a conversation (user messages, agent responses)
- Tool calls shown inline with collapsible detail (input params, output, duration)
- System events shown as subtle inline markers
- Per-message token count shown on hover or in margin
- Running cost accumulator as you scroll down the conversation
- Session metadata header: model used, total tokens, total cost, duration, channel

### 3. Skills Overview

Read-only view of installed skills with limited management actions.

Data source: `skills.*` gateway RPC methods.

#### Skills List

- All installed skills with: name, description, enabled/disabled state, emoji
- Toggle to enable/disable individual skills (calls `skills.enable` / `skills.disable`)
- "Installed via" indicator (ClawHub, manual, bundled)

#### Skill Detail

- SKILL.md content rendered as markdown (if accessible from filesystem)
- Required binaries and their install status
- API key status (configured / missing — no key display, just boolean)

**Omitted from ClawPanel:** Skill installation, skill search, ClawHub browsing. These are agent tasks. If a user wants to install a skill, the contextual hint reads: *"To install a skill, message your agent: 'install the weather skill from ClawHub'"*

### 4. Cron & Automations

View and lightly manage cron jobs and heartbeat status.

Data source: `cron.*` gateway RPC methods.

#### Cron Jobs List

- All jobs from `cron.list` with: name, schedule (cron expression or one-shot time), enabled/disabled, next run, last run status
- Toggle enable/disable (calls `cron.enable` / `cron.disable`)
- Manual trigger button (calls `cron.run` with `--force`)
- Kind indicator: recurring vs. one-shot

#### Run History

- Per-job run history from `cron.runs` with: timestamp, status (ok/error/skipped), duration
- Expand for run output/error details
- Visual indicator for retry backoff (30s → 1m → 5m → 15m → 60m pattern)

#### Heartbeat Status

- Last heartbeat timestamp
- Heartbeat interval (from config)
- Active hours window (from `agents.defaults.heartbeat.activeHours`)
- Skip reasons if applicable (quiet-hours, requests-in-flight)

**Omitted from ClawPanel:** Creating/editing cron jobs. The CLI and agent are better at this. Contextual hint: *"To add a cron job, run `openclaw cron add --name 'Daily report' --cron '0 9 * * *' --message '...'` or message your agent: 'set up a daily morning briefing at 9am'"*

### 5. Channels (via Health Bar expansion)

Not a separate page — expanding the channel status in the health bar shows:
- Each connected channel with: platform, account/bot name, connection status, last message time
- Message volume (messages in/out over last 24h, from session data)
- Known issues indicator (e.g., Discord reconnect loop from #11836)

### 6. Settings

Minimal settings page for ClawPanel itself (not OpenClaw config):
- **Theme toggle:** Light (default) / Dark
- **Gateway connection:** URL, token (editable for remote setups)
- **Budget limits:** Daily budget, monthly budget (in USD). Enable/disable individually. Set to `null` for no limit.
- **Notification preferences:** Enable/disable browser notifications for budget alerts
- **Refresh intervals:** Activity feed poll rate, cost recalculation interval
- **Session data path override:** For non-standard OpenClaw installations

---

## What ClawPanel Does NOT Do

These are intentionally omitted. The agent or CLI handles them better than a GUI.

| Category | Why Not | What to Do Instead |
|---|---|---|
| Model configuration/routing | Complex, rare changes | Message agent: *"Switch to Haiku for simple tasks"* |
| SOUL.md / AGENTS.md editing | Text files, version controlled | Edit directly or message agent: *"Update your personality to be more concise"* |
| Webhook setup | One-time config | `openclaw configure` or edit config |
| Gateway config | Dangerous, restart required | `openclaw config set ...` or edit `openclaw.json` |
| Auth token management | Security-sensitive | `openclaw doctor --generate-gateway-token` |
| Skill installation | Agent handles discovery + deps | Message agent: *"Install the spotify skill"* |
| Channel setup/pairing | One-time, platform-specific | `openclaw onboard` or channel-specific setup |
| Chat interface | That's what the channels are for | Use WhatsApp/Telegram/Discord/Slack |
| Config editor | Footgun potential, restart needed | CLI: `openclaw config set/get` |

For every omitted item, ClawPanel shows a contextual hint with the exact command or agent message to use. This teaches users the "agent-first" mental model.

---

## CLI Interface

```bash
# Zero-install (runs directly)
npx clawpanel

# Or install globally
npm install -g clawpanel
clawpanel start

# Start with options
clawpanel start --port 8080
clawpanel start --gateway ws://192.168.1.100:18789
clawpanel start --token <gateway-token>
clawpanel start --no-open  # don't auto-open browser

# Connection profiles (for multiple gateways)
clawpanel start --profile home-server
clawpanel start --profile vps

# Status
clawpanel status  # show if running, gateway connection, port

# Stop
clawpanel stop

# Reset saved config
clawpanel --reset

# Diagnose connection issues
clawpanel doctor

# Version
clawpanel --version
```

### CLI Flags

| Flag | Short | Description | Default |
|------|-------|-------------|---------|
| `--gateway <url>` | `-g` | Gateway WebSocket URL | Auto-detect or saved config |
| `--token <token>` | `-t` | Gateway token | Auto-detect or saved config |
| `--port <number>` | `-p` | Local server port | `7070` (auto-finds if taken) |
| `--profile <name>` | — | Use a named connection profile | `default` |
| `--no-open` | — | Don't auto-open browser | `false` |
| `--reset` | — | Clear saved config and re-prompt | — |
| `--version` | `-v` | Print version | — |

### Config Persistence

ClawPanel saves connection details at `~/.clawpanel/config.json` so subsequent launches connect automatically:

```json
{
  "profiles": {
    "default": {
      "gateway": "ws://127.0.0.1:18789",
      "token": "auto-detected-or-pasted"
    },
    "vps": {
      "gateway": "ws://203.0.113.50:18789",
      "token": "remote-token"
    }
  },
  "activeProfile": "default",
  "preferences": {
    "port": 7070,
    "theme": "light"
  }
}
```

### First-Run Experience

```
$ npx clawpanel

  ClawPanel — A better dashboard for OpenClaw

  ✓ Found local gateway at ws://127.0.0.1:18789
  ✓ Read token from ~/.openclaw/openclaw.json

  Dashboard running at http://localhost:7070
  Press Ctrl+C to stop.
```

If no local gateway is found, ClawPanel prompts interactively:

```
$ npx clawpanel

  ClawPanel — A better dashboard for OpenClaw

  ✗ No local gateway detected.

  Gateway URL: ws://203.0.113.50:18789
  Gateway Token: ••••••••••••••••••••••

  Connecting... Connected.
  Configuration saved to ~/.clawpanel/config.json

  Dashboard running at http://localhost:7070
  Press Ctrl+C to stop.
```

### Connection Resolution Order

1. CLI flags (`--gateway`, `--token`) — highest priority
2. Saved profile (`~/.clawpanel/config.json`)
3. Auto-detect local gateway on `:18789` + read token from `~/.openclaw/openclaw.json`
4. Interactive prompt (if nothing else works)

### `clawpanel doctor`

Self-diagnostic command that checks the entire connection chain and reports actionable results:

```
$ clawpanel doctor

  ClawPanel Doctor

  ✓ Config file found at ~/.clawpanel/config.json
  ✓ Gateway reachable at ws://127.0.0.1:18789
  ✓ Token valid (authenticated as operator)
  ✓ Protocol version: 3 (compatible)
  ✓ Session files accessible at ~/.openclaw/agents/main/sessions/
  ✓ 47 session files, 12.3 MB total
  ✓ Pricing config found for 3 models
  ✗ Port 7070 is in use by another process

  1 issue found. Run with --fix to resolve:
    → clawpanel doctor --fix (will auto-select available port)
```

Checks performed:
1. Config file exists and is valid JSON
2. Gateway URL resolves and accepts WebSocket connection
3. Auth token is accepted (completes challenge handshake)
4. Protocol version is compatible
5. Session JSONL files are readable on disk
6. Model pricing config is present
7. Default port is available
8. OpenClaw process is running (via gateway health check)

`--fix` flag auto-resolves what it can (port conflicts, stale config entries). For issues requiring user action (bad token, gateway down), it prints the exact resolution command.

### Structured Error Codes

All ClawPanel errors use a namespaced code for debugging and issue reporting:

| Code | Meaning |
|---|---|
| `clawpanel.gateway_unreachable` | Cannot connect to gateway URL |
| `clawpanel.gateway_token_invalid` | Token rejected during auth handshake |
| `clawpanel.gateway_token_missing` | No token found (auto-detect or config) |
| `clawpanel.protocol_incompatible` | Gateway protocol version mismatch |
| `clawpanel.sessions_unreadable` | Cannot read JSONL files from disk |
| `clawpanel.port_in_use` | Default port occupied |
| `clawpanel.config_corrupt` | Config file exists but is invalid JSON |
| `clawpanel.wss_required` | Browser requires `wss://` but gateway URL is `ws://` |

These codes appear in CLI output, browser console, and the health bar error state. They make bug reports actionable.

---

## File Structure

```
clawpanel/
├── package.json
├── bin/
│   └── clawpanel.js              # CLI entry point
├── src/
│   ├── app/
│   │   ├── layout.tsx            # Root layout (health bar lives here)
│   │   ├── page.tsx              # Dashboard (cost + feed + sessions)
│   │   ├── sessions/
│   │   │   ├── page.tsx          # Session browser list
│   │   │   └── [key]/page.tsx    # Session detail view
│   │   ├── skills/
│   │   │   └── page.tsx          # Skills overview
│   │   ├── cron/
│   │   │   └── page.tsx          # Cron & automations
│   │   └── settings/
│   │       └── page.tsx          # ClawPanel settings
│   ├── components/
│   │   ├── layout/
│   │   │   ├── health-bar.tsx    # Top status strip
│   │   │   ├── sidebar.tsx       # Navigation
│   │   │   └── theme-toggle.tsx  # Light/dark switch
│   │   ├── dashboard/
│   │   │   ├── cost-tracker.tsx  # Hero cost display
│   │   │   ├── cost-chart.tsx    # 7-day trend chart
│   │   │   ├── burn-rate.tsx     # Live burn rate + time-to-limit
│   │   │   ├── budget-ring.tsx   # Progress ring toward daily budget
│   │   │   ├── activity-feed.tsx # Live event stream
│   │   │   ├── activity-heatmap.tsx # 30-day hourly activity grid
│   │   │   └── session-summary.tsx
│   │   ├── sessions/
│   │   │   ├── session-list.tsx
│   │   │   ├── session-detail.tsx
│   │   │   ├── message-thread.tsx
│   │   │   └── tool-call-card.tsx
│   │   ├── skills/
│   │   │   ├── skill-list.tsx
│   │   │   └── skill-card.tsx
│   │   ├── cron/
│   │   │   ├── cron-list.tsx
│   │   │   ├── cron-card.tsx
│   │   │   └── run-history.tsx
│   │   └── shared/
│   │       ├── channel-badge.tsx
│   │       ├── status-dot.tsx
│   │       ├── cost-display.tsx
│   │       └── empty-state.tsx
│   ├── lib/
│   │   ├── gateway/
│   │   │   ├── connection.ts     # WebSocket connection manager
│   │   │   ├── protocol.ts       # Message types, serialization
│   │   │   ├── auth.ts           # Token detection, handshake
│   │   │   ├── reconnect.ts      # Reconnection with backoff
│   │   │   ├── event-bridge.ts   # Single event classifier + dispatch
│   │   │   └── errors.ts         # Structured error codes (clawpanel.*)
│   │   ├── data/
│   │   │   ├── sessions.ts       # JSONL file reader
│   │   │   ├── cost.ts           # Cost calculation engine
│   │   │   ├── burn-rate.ts      # Burn rate + time-to-limit calculator
│   │   │   ├── budget.ts         # Budget limit checker + notifications
│   │   │   ├── lifetime.ts       # All-time stats aggregator
│   │   │   ├── heatmap.ts        # Activity heatmap data builder
│   │   │   ├── config.ts         # OpenClaw config reader
│   │   │   └── pricing.ts        # Model pricing lookups
│   │   └── utils/
│   │       ├── tokens.ts         # Token formatting helpers
│   │       └── time.ts           # Relative time, durations
│   ├── hooks/
│   │   ├── use-gateway.ts        # WebSocket connection hook
│   │   ├── use-rpc.ts            # RPC method caller
│   │   ├── use-events.ts         # Event subscription hook
│   │   ├── use-sessions.ts       # Session data hook
│   │   ├── use-cost.ts           # Cost aggregation hook
│   │   ├── use-health.ts         # Health status hook
│   │   ├── use-cron.ts           # Cron data hook
│   │   └── use-skills.ts         # Skills data hook
│   └── types/
│       ├── gateway.ts            # Protocol type definitions
│       ├── session.ts            # Session/message types
│       ├── cost.ts               # Cost calculation types
│       └── config.ts             # OpenClaw config types
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── README.md
```

---

## WebSocket Connection Manager

The connection manager is the critical infrastructure layer. It must be more reliable than the Control UI.

### Connection Lifecycle

```
DISCONNECTED → CONNECTING → CHALLENGED → AUTHENTICATING → CONNECTED
                                                              ↓
                                                         RECONNECTING
                                                         (on close/error)
```

### Reconnection Strategy

- Exponential backoff: 1s → 2s → 4s → 8s → 16s → 30s (max)
- Jitter: ±20% to avoid thundering herd
- On `visibilitychange` (tab becomes visible): attempt immediate reconnect
- On sequence gap detection: refresh full state before resuming event processing
- Show clear reconnection status in health bar with countdown

### Sequence Gap Handling

Events carry `seq` and `stateVersion`. If a gap is detected:
1. Pause event processing
2. Call `health`, `system-presence`, `sessions.list` to rebuild state
3. Resume event processing from new baseline
4. Show brief "resynced" indicator in UI

### Single Event Bridge

All gateway events flow through one intake path — a classifier function (`classifyGatewayEvent`) that sorts every incoming event into one of two pipelines:

1. **Summary refresh** — `presence`, `health`, `heartbeat` events update the health bar and agent state
2. **Runtime stream** — `chat`, `agent` events feed the activity feed and session browser

This avoids multiple independent WebSocket listeners with divergent lifecycle/cleanup logic. One subscription, one classifier, dispatch to feature-specific handlers. Trade-off: denser bridge contract, but eliminates an entire class of "stale listener" bugs.

### WSS/HTTPS Requirement

**Critical gotcha:** Browsers block `ws://` connections from pages served over `https://`. If anyone serves ClawPanel behind HTTPS (Tailscale Serve, nginx reverse proxy, Cloudflare Tunnel), the gateway URL must use `wss://`.

ClawPanel detects this mismatch and surfaces error code `clawpanel.wss_required` with a clear message: *"Your browser requires a secure WebSocket connection. Change your gateway URL from ws:// to wss://, or access ClawPanel over http://."*

Additionally: `ws://127.0.0.1` means "connect to the gateway on *the browser's machine*", not the server's. If ClawPanel's web UI is opened from a phone while the server runs on a laptop, `localhost` won't reach the gateway. Document this in the connection troubleshooting section of the README.

---

## Design Direction

### Theme

- **Default: Light mode** with dark mode toggle in settings
- Both themes must be fully designed — not an afterthought inversion
- Light default differentiates ClawPanel visually from the built-in dashboard and makes it feel like a different product, not a reskin

### Visual Specifics

- **Background:** Light warm gray (`#f0eef2` range) — not stark white
- **Cards:** Slightly lighter with soft rounded corners (`~16px` border-radius)
- **Text:** Dark gray/near-black, no pure black
- **Accent:** Minimal — green/yellow/red for status, otherwise monochrome
- **Typography:** System sans-serif (Geist) for UI, monospace (Geist Mono) for data/numbers/costs
- **Density:** Spacious. Generous padding. This is a dashboard you check quickly, not a workbench you stare at.
- **Shadows:** Subtle, layered. Cards have depth but don't float aggressively.
- **Cost numbers:** Big, bold, impossible to ignore
- **Activity feed:** Subtle entrance animations — feels alive
- **Charts:** Minimal and readable, not decorative

This is not a dark hacker terminal. It's a calm, confident tool interface.

### UX Principles

1. **Glanceable** — Everything meaningful visible within 3 seconds
2. **Honest** — If something is broken, say it plainly. No euphemisms.
3. **Opinionated** — We decided what matters. Cost is #1. Health is #2.
4. **No raw data** — Tool calls become cards. JSON becomes tables. Timestamps become relative ("2m ago"). Never show WebSocket frames, heartbeat payloads, or raw API responses.
5. **Fast** — WebSocket-first, no polling for real-time data. Filesystem reads for cost.
6. **Respectful** — Agent is the interface for changes. ClawPanel is the interface for understanding.
7. **Resilient** — Robust reconnection. Never show a blank screen.

### Keyboard Shortcuts

For a tool people check 10+ times a day, keyboard navigation matters.

| Key | Action |
|---|---|
| `1` | Go to Dashboard |
| `2` | Go to Sessions |
| `3` | Go to Skills |
| `4` | Go to Cron |
| `5` | Go to Settings |
| `/` | Focus search/filter input |
| `Space` | Pause/resume activity feed (when on dashboard) |
| `Esc` | Close modals, clear search, deselect |
| `?` | Show keyboard shortcuts help overlay |
| `r` | Refresh current view data |
| `t` | Toggle theme (light/dark) |

Shortcuts are displayed in a `?` overlay accessible from the health bar. Keep the set small and memorable — don't try to be Vim.

---

## Mobile Responsiveness

**v1: Functional but not optimized.** The dashboard should be usable on mobile Safari/Chrome — no horizontal scroll, readable text, tappable targets. But the primary target is desktop. Many OpenClaw users check agent status from their phone (they're already in Telegram/WhatsApp), so basic mobile usability matters.

Post-v1: Consider a dedicated mobile layout with cost at top, activity feed below, and a simplified health indicator.

---

---

## Open Questions & Risks

### Technical

1. **Session JSONL format specifics:** Need to confirm exact schema of JSONL entries — which fields carry token counts, how are tool calls structured? May need to reverse-engineer from actual files during build.

2. **Docker/remote session access:** When OpenClaw runs in Docker, session files are inside the container. ClawPanel running on the host can't read them directly. Options: mount volume, add gateway RPC for cost data, or accept this limitation in v1 and document it.

3. **Multi-provider cost calculation:** Different providers (Anthropic, OpenAI, Google, OpenRouter, local) may structure usage data differently. Need to handle gracefully — show tokens when pricing is unknown.

4. **Gateway protocol version:** Protocol schema lives in `src/gateway/protocol/schema.ts` with a `PROTOCOL_VERSION`. We should check version on connect and warn if incompatible.

5. **Tool event visibility (#8901):** If the upstream issue isn't resolved, our activity feed will be limited when `verboseDefault: "off"`. This is a meaningful gap — most users run with verbose off.

6. **Packaging strategy:** Should ClawPanel ship as a pre-built static export (faster startup, larger package ~10-20MB) or build on first run (slower first start, smaller package)? Pre-built is better UX for the `npx clawpanel` zero-install story.

7. **Port conflicts:** If port 7070 is taken, auto-find an available port and print the actual URL. Don't fail.

### Product

8. **Scope creep pressure:** Users will ask for chat, config editing, skill installation. Must resist — the "message your agent" pattern is the product thesis.

9. **Naming collision:** Verify `clawpanel` npm package name is available before starting. Have `clawpanel-app` as fallback.

10. **Update story:** How does `npm update -g clawpanel` interact with a running instance? Should `clawpanel start` check for updates on boot?

---

## Success Metrics

| Timeline | Metric |
|---|---|
| Week 1 | Gateway connection working, health bar rendering, cost calculation from JSONL |
| Week 2 | Activity feed streaming, session browser functional |
| Week 3 | Full v1 feature-complete: skills, cron, polish |
| Month 1 | 500+ npm installs |
| Month 2 | Featured in OpenClaw community (Discord, GitHub discussions) |
| Month 3 | Recognized as "the dashboard" for OpenClaw |
| Month 6 | Considered for official integration or de facto recommended dashboard |

### UX Targets

| Metric | Target |
|---|---|
| Time from `npx clawpanel` to connected dashboard | < 30 seconds (first run), < 5 seconds (subsequent) |
| npm weekly downloads (3 months) | 500 |
| GitHub stars (3 months) | 200 |

---

## Milestone Plan

### Week 1: Foundation + Cost

- [ ] Project setup: Next.js 15, TypeScript, Tailwind, shadcn/ui
- [ ] CLI: `clawpanel start` with auto-detection, `clawpanel doctor`
- [ ] Gateway WebSocket connection manager with auth
- [ ] Single event bridge (classifier + dispatch)
- [ ] Reconnection with exponential backoff
- [ ] Structured error codes (`clawpanel.*`)
- [ ] Health bar: gateway status, channels, active model
- [ ] Cost engine: JSONL reader, pricing lookup, calculation
- [ ] Dashboard: today's spend (hero number), burn rate, 7-day chart
- [ ] Budget limits: config, progress ring, budget bar

### Week 2: Sessions + Activity

- [ ] Activity feed: real-time event stream from gateway
- [ ] Activity heatmap: 30-day hourly grid with streak counter
- [ ] Session browser: list all sessions with metadata
- [ ] Session filtering: model, status, date range, live search
- [ ] Session detail: full conversation thread view
- [ ] Tool call cards: inline expandable detail
- [ ] Per-session cost breakdown
- [ ] Per-model cost distribution chart
- [ ] Lifetime stats: all-time totals
- [ ] Browser notifications for budget alerts
- [ ] Keyboard shortcuts (number keys, `/`, `?`, `Space`)

### Week 3: Skills + Cron + Polish

- [ ] Skills overview: list, enable/disable toggle
- [ ] Cron overview: list, enable/disable, manual trigger
- [ ] Cron run history with status
- [ ] Heartbeat status display
- [ ] Theme toggle (light/dark)
- [ ] Settings page
- [ ] Empty states for all views
- [ ] Error states and offline handling
- [ ] Mobile responsive pass
- [ ] README, npm package metadata, publish

### Week 4: Distribution

- [ ] ClawHub skill shim (SKILL.md + metadata)
- [ ] Publish to npm
- [ ] Post to OpenClaw Discord
- [ ] GitHub repo with screenshots
- [ ] Blog post / launch thread

---

## Appendix: OpenClaw Ecosystem Context

- **Stars:** 196k+ GitHub stars (Feb 2026)
- **History:** Formerly Clawdbot → Moltbot → OpenClaw (trademark changes)
- **Gateway port:** `18789` (default)
- **Config path:** `~/.openclaw/openclaw.json`
- **Session path:** `~/.openclaw/agents/<agentId>/sessions/*.jsonl`
- **Cron path:** `~/.openclaw/cron/`
- **Built-in UI:** Vite + Lit SPA served at gateway port (limited, buggy)
- **Mascot:** Molty, a space lobster 🦞
- **ClawHub:** Public skills registry (5,700+ skills)
- **Channels:** WhatsApp, Telegram, Discord, Slack, Google Chat, Signal, iMessage, Microsoft Teams, Matrix, Zalo, WebChat

---