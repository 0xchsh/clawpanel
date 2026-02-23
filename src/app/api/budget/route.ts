import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const CONFIG_PATH = path.join(process.env.HOME ?? "~", ".clawpanel", "config.json");

interface ClawPanelBudgetConfig {
  budgets?: {
    daily?: { enabled: boolean; amount: number };
    monthly?: { enabled: boolean; amount: number };
  };
}

async function readConfig(): Promise<ClawPanelBudgetConfig> {
  try {
    const content = await fs.readFile(CONFIG_PATH, "utf-8");
    return JSON.parse(content);
  } catch {
    return {};
  }
}

async function writeConfig(config: ClawPanelBudgetConfig): Promise<void> {
  const dir = path.dirname(CONFIG_PATH);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(CONFIG_PATH, JSON.stringify(config, null, 2));
}

export async function GET() {
  const config = await readConfig();
  return NextResponse.json(config.budgets ?? { daily: null, monthly: null });
}

export async function POST(request: Request) {
  const body = await request.json();
  const config = await readConfig();
  config.budgets = body;
  await writeConfig(config);
  return NextResponse.json({ ok: true, budgets: config.budgets });
}
