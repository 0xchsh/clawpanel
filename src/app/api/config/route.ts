import { NextResponse } from "next/server";
import { readOpenClawConfig, extractGatewayToken, extractModelPricing, getGatewayUrl } from "@/lib/data/config";
import { readFile } from "fs/promises";
import { homedir } from "os";
import { join } from "path";

async function readClawPanelConfig() {
  try {
    const configPath = join(homedir(), ".clawpanel", "config.json");
    const raw = await readFile(configPath, "utf-8");
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export async function GET() {
  // Check ClawPanel config first (allows remote gateway URL override)
  const clawPanelConfig = await readClawPanelConfig();
  const activeProfile = clawPanelConfig?.activeProfile ?? "default";
  const profileConfig = clawPanelConfig?.profiles?.[activeProfile];

  const config = await readOpenClawConfig();
  const pricing = config ? extractModelPricing(config) : {};
  const fallbackToken = config ? extractGatewayToken(config) : null;

  return NextResponse.json({
    found: true,
    gatewayUrl: profileConfig?.gateway ?? (config ? getGatewayUrl(config) : "ws://127.0.0.1:18789"),
    token: profileConfig?.token ?? fallbackToken,
    pricing,
  });
}
