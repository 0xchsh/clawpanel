/**
 * OpenClaw config reader.
 * Reads ~/.openclaw/openclaw.json for gateway token and model pricing.
 */

import { promises as fs } from "fs";
import path from "path";
import type { ModelPricing } from "./pricing";

const DEFAULT_CONFIG_PATH = path.join(
  process.env.HOME ?? "~",
  ".openclaw",
  "openclaw.json"
);

export interface OpenClawConfig {
  gateway?: {
    auth?: {
      token?: string;
    };
    port?: number;
  };
  models?: {
    providers?: Record<
      string,
      {
        pricing?: ModelPricing;
      }
    >;
  };
}

export async function readOpenClawConfig(configPath?: string): Promise<OpenClawConfig | null> {
  const filePath = configPath ?? DEFAULT_CONFIG_PATH;
  try {
    const content = await fs.readFile(filePath, "utf-8");
    return JSON.parse(content) as OpenClawConfig;
  } catch {
    return null;
  }
}

export function extractGatewayToken(config: OpenClawConfig): string | null {
  return config.gateway?.auth?.token ?? null;
}

export function extractModelPricing(config: OpenClawConfig): Record<string, ModelPricing> {
  const result: Record<string, ModelPricing> = {};
  const providers = config.models?.providers;
  if (!providers) return result;

  for (const [key, provider] of Object.entries(providers)) {
    if (provider.pricing) {
      result[key] = provider.pricing;
    }
  }
  return result;
}

export function getGatewayUrl(config: OpenClawConfig): string {
  const port = config.gateway?.port ?? 18789;
  return `ws://127.0.0.1:${port}`;
}
