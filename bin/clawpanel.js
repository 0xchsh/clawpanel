#!/usr/bin/env node

/**
 * ClawPanel CLI — A better dashboard for OpenClaw.
 *
 * Usage:
 *   clawpanel start [options]   Start the dashboard server
 *   clawpanel stop              Stop a running instance
 *   clawpanel status            Show current status
 *   clawpanel doctor            Diagnose connection issues
 *   clawpanel --version         Print version
 *   clawpanel --reset           Clear saved config
 */

const { execSync, spawn } = require("child_process");
const fs = require("fs");
const path = require("path");
const net = require("net");
const http = require("http");

const PKG = require("../package.json");

const CONFIG_DIR = path.join(process.env.HOME || "~", ".clawpanel");
const CONFIG_PATH = path.join(CONFIG_DIR, "config.json");
const PID_PATH = path.join(CONFIG_DIR, "clawpanel.pid");

const OPENCLAW_CONFIG_PATH = path.join(
  process.env.HOME || "~",
  ".openclaw",
  "openclaw.json"
);

const DEFAULT_PORT = 7070;
const DEFAULT_GATEWAY = "ws://127.0.0.1:18789";

// --- Config ---

function readConfig() {
  try {
    return JSON.parse(fs.readFileSync(CONFIG_PATH, "utf-8"));
  } catch {
    return {
      profiles: {},
      activeProfile: "default",
      preferences: { port: DEFAULT_PORT, theme: "light" },
    };
  }
}

function writeConfig(config) {
  fs.mkdirSync(CONFIG_DIR, { recursive: true });
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
}

function readOpenClawConfig() {
  try {
    return JSON.parse(fs.readFileSync(OPENCLAW_CONFIG_PATH, "utf-8"));
  } catch {
    return null;
  }
}

function autoDetectGateway() {
  const config = readOpenClawConfig();
  const port = config?.gateway?.port ?? 18789;
  return `ws://127.0.0.1:${port}`;
}

function autoDetectToken() {
  const config = readOpenClawConfig();
  return config?.gateway?.auth?.token ?? null;
}

// --- Port check ---

function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.listen(port, "127.0.0.1");
    server.on("listening", () => {
      server.close();
      resolve(true);
    });
    server.on("error", () => {
      resolve(false);
    });
  });
}

async function findAvailablePort(startPort) {
  for (let port = startPort; port < startPort + 100; port++) {
    if (await isPortAvailable(port)) return port;
  }
  return null;
}

// --- Gateway check ---

function checkGateway(url) {
  return new Promise((resolve) => {
    const httpUrl = url.replace("ws://", "http://").replace("wss://", "https://");
    const req = http.get(httpUrl, { timeout: 3000 }, (res) => {
      resolve(true);
    });
    req.on("error", () => resolve(false));
    req.on("timeout", () => {
      req.destroy();
      resolve(false);
    });
  });
}

// --- Colors ---

const green = (s) => `\x1b[32m${s}\x1b[0m`;
const red = (s) => `\x1b[31m${s}\x1b[0m`;
const yellow = (s) => `\x1b[33m${s}\x1b[0m`;
const dim = (s) => `\x1b[2m${s}\x1b[0m`;
const bold = (s) => `\x1b[1m${s}\x1b[0m`;

// --- Commands ---

async function cmdStart(args) {
  console.log("");
  console.log(`  ${bold("ClawPanel")} — A better dashboard for OpenClaw`);
  console.log("");

  const config = readConfig();
  const profileName = args.profile ?? config.activeProfile ?? "default";
  const profile = config.profiles?.[profileName] ?? {};

  // Resolve gateway URL
  let gateway = args.gateway ?? profile.gateway;
  if (!gateway) {
    gateway = autoDetectGateway();
    console.log(`  ${green("✓")} Found local gateway at ${gateway}`);
  }

  // Resolve token
  let token = args.token ?? profile.token;
  if (!token) {
    token = autoDetectToken();
    if (token) {
      console.log(`  ${green("✓")} Read token from ~/.openclaw/openclaw.json`);
    } else {
      console.log(`  ${yellow("!")} No gateway token found. Paste it in Settings after launch.`);
    }
  }

  // Resolve port
  let port = args.port ? parseInt(args.port, 10) : config.preferences?.port ?? DEFAULT_PORT;
  if (!(await isPortAvailable(port))) {
    const newPort = await findAvailablePort(port + 1);
    if (!newPort) {
      console.log(`  ${red("✗")} No available ports found near ${port}`);
      process.exit(1);
    }
    console.log(`  ${yellow("!")} Port ${port} in use, using ${newPort}`);
    port = newPort;
  }

  // Save config
  config.profiles = config.profiles ?? {};
  config.profiles[profileName] = { gateway, token: token ?? "" };
  config.activeProfile = profileName;
  config.preferences = { ...config.preferences, port };
  writeConfig(config);

  // Set env vars for Next.js
  process.env.CLAWPANEL_GATEWAY_URL = gateway;
  process.env.CLAWPANEL_GATEWAY_TOKEN = token ?? "";
  process.env.PORT = String(port);

  console.log("");
  console.log(`  Dashboard running at ${bold(`http://localhost:${port}`)}`);
  console.log(`  Press ${dim("Ctrl+C")} to stop.`);
  console.log("");

  // Save PID
  fs.mkdirSync(CONFIG_DIR, { recursive: true });
  fs.writeFileSync(PID_PATH, String(process.pid));

  // Auto-open browser
  if (!args["no-open"]) {
    const url = `http://localhost:${port}`;
    try {
      if (process.platform === "darwin") {
        execSync(`open "${url}"`, { stdio: "ignore" });
      } else if (process.platform === "linux") {
        execSync(`xdg-open "${url}"`, { stdio: "ignore" });
      }
    } catch {
      // Silently fail — browser open is best-effort
    }
  }

  // Start Next.js
  const nextBin = path.resolve(__dirname, "..", "node_modules", ".bin", "next");
  const child = spawn(nextBin, ["start", "-p", String(port)], {
    cwd: path.resolve(__dirname, ".."),
    stdio: "inherit",
    env: { ...process.env },
  });

  child.on("exit", (code) => {
    try { fs.unlinkSync(PID_PATH); } catch {}
    process.exit(code ?? 0);
  });

  process.on("SIGINT", () => {
    child.kill("SIGINT");
  });
  process.on("SIGTERM", () => {
    child.kill("SIGTERM");
  });
}

function cmdStop() {
  try {
    const pid = parseInt(fs.readFileSync(PID_PATH, "utf-8").trim(), 10);
    process.kill(pid, "SIGTERM");
    fs.unlinkSync(PID_PATH);
    console.log(`  ${green("✓")} ClawPanel stopped (PID ${pid})`);
  } catch {
    console.log(`  ${dim("No running ClawPanel instance found.")}`);
  }
}

function cmdStatus() {
  const config = readConfig();
  const profile = config.profiles?.[config.activeProfile] ?? {};

  let running = false;
  try {
    const pid = parseInt(fs.readFileSync(PID_PATH, "utf-8").trim(), 10);
    process.kill(pid, 0); // Check if alive
    running = true;
    console.log(`  ${green("●")} Running (PID ${pid})`);
  } catch {
    console.log(`  ${dim("○")} Not running`);
  }

  console.log(`  Profile:  ${config.activeProfile ?? "default"}`);
  console.log(`  Gateway:  ${profile.gateway ?? "not configured"}`);
  console.log(`  Port:     ${config.preferences?.port ?? DEFAULT_PORT}`);
}

async function cmdDoctor() {
  console.log("");
  console.log(`  ${bold("ClawPanel Doctor")}`);
  console.log("");

  let issues = 0;

  // 1. Config file
  try {
    const config = readConfig();
    console.log(`  ${green("✓")} Config file found at ${CONFIG_PATH}`);
  } catch {
    console.log(`  ${yellow("!")} No config file — will use defaults`);
  }

  // 2. OpenClaw config
  const ocConfig = readOpenClawConfig();
  if (ocConfig) {
    console.log(`  ${green("✓")} OpenClaw config found at ${OPENCLAW_CONFIG_PATH}`);
  } else {
    console.log(`  ${red("✗")} OpenClaw config not found at ${OPENCLAW_CONFIG_PATH}`);
    issues++;
  }

  // 3. Gateway reachable
  const gateway = autoDetectGateway();
  const reachable = await checkGateway(gateway);
  if (reachable) {
    console.log(`  ${green("✓")} Gateway reachable at ${gateway}`);
  } else {
    console.log(`  ${red("✗")} Gateway unreachable at ${gateway}`);
    issues++;
  }

  // 4. Token
  const token = autoDetectToken();
  if (token) {
    console.log(`  ${green("✓")} Gateway token found`);
  } else {
    console.log(`  ${red("✗")} No gateway token found`);
    issues++;
  }

  // 5. Session files
  const sessionsPath = path.join(
    process.env.HOME || "~",
    ".openclaw",
    "agents",
    "main",
    "sessions"
  );
  try {
    const files = fs.readdirSync(sessionsPath).filter((f) => f.endsWith(".jsonl"));
    const totalSize = files.reduce((sum, f) => {
      return sum + fs.statSync(path.join(sessionsPath, f)).size;
    }, 0);
    const sizeMB = (totalSize / 1024 / 1024).toFixed(1);
    console.log(`  ${green("✓")} Session files accessible: ${files.length} files, ${sizeMB} MB`);
  } catch {
    console.log(`  ${yellow("!")} Session files not accessible at ${sessionsPath}`);
  }

  // 6. Pricing config
  if (ocConfig?.models?.providers) {
    const providerCount = Object.keys(ocConfig.models.providers).length;
    console.log(`  ${green("✓")} Pricing config found for ${providerCount} providers`);
  } else {
    console.log(`  ${yellow("!")} No model pricing config — will use built-in defaults`);
  }

  // 7. Port
  const port = readConfig().preferences?.port ?? DEFAULT_PORT;
  if (await isPortAvailable(port)) {
    console.log(`  ${green("✓")} Port ${port} is available`);
  } else {
    console.log(`  ${red("✗")} Port ${port} is in use`);
    issues++;
  }

  console.log("");
  if (issues === 0) {
    console.log(`  ${green("All checks passed.")}`);
  } else {
    console.log(`  ${red(`${issues} issue${issues > 1 ? "s" : ""} found.`)}`);
  }
  console.log("");
}

// --- CLI Parser ---

function parseArgs(argv) {
  const args = {};
  const positional = [];

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg.startsWith("--")) {
      const key = arg.slice(2);
      const next = argv[i + 1];
      if (next && !next.startsWith("-")) {
        args[key] = next;
        i++;
      } else {
        args[key] = true;
      }
    } else if (arg.startsWith("-") && arg.length === 2) {
      const shortMap = { g: "gateway", t: "token", p: "port", v: "version" };
      const key = shortMap[arg[1]] || arg[1];
      const next = argv[i + 1];
      if (next && !next.startsWith("-")) {
        args[key] = next;
        i++;
      } else {
        args[key] = true;
      }
    } else {
      positional.push(arg);
    }
  }

  return { args, positional };
}

// --- Main ---

async function main() {
  const { args, positional } = parseArgs(process.argv.slice(2));
  const command = positional[0] || "start";

  if (args.version) {
    console.log(`clawpanel v${PKG.version}`);
    return;
  }

  if (args.reset) {
    try {
      fs.unlinkSync(CONFIG_PATH);
      console.log(`  ${green("✓")} Config reset.`);
    } catch {
      console.log(`  ${dim("No config to reset.")}`);
    }
    return;
  }

  switch (command) {
    case "start":
      await cmdStart(args);
      break;
    case "stop":
      cmdStop();
      break;
    case "status":
      cmdStatus();
      break;
    case "doctor":
      await cmdDoctor();
      break;
    default:
      console.log(`  Unknown command: ${command}`);
      console.log(`  Usage: clawpanel [start|stop|status|doctor]`);
      process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
