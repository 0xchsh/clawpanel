import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const CONFIG_PATH = path.join(process.env.HOME ?? "~", ".clawpanel", "config.json");

interface ClawPanelSettings {
  gatewayUrl?: string;
  gatewayToken?: string;
  budgets?: {
    daily?: { enabled: boolean; amount: number } | null;
    monthly?: { enabled: boolean; amount: number } | null;
  };
  notificationsEnabled?: boolean;
  activityPollRate?: number;
  costRecalcInterval?: number;
  sessionDataPath?: string;
  theme?: "light" | "dark" | "system";
}

async function readConfig(): Promise<ClawPanelSettings> {
  try {
    const content = await fs.readFile(CONFIG_PATH, "utf-8");
    return JSON.parse(content) as ClawPanelSettings;
  } catch {
    return {};
  }
}

async function writeConfig(config: ClawPanelSettings): Promise<void> {
  const dir = path.dirname(CONFIG_PATH);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(CONFIG_PATH, JSON.stringify(config, null, 2));
}

export async function GET() {
  const config = await readConfig();
  return NextResponse.json(config);
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ClawPanelSettings;
    const existing = await readConfig();
    const merged = { ...existing, ...body };
    await writeConfig(merged);
    return NextResponse.json({ ok: true, settings: merged });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
