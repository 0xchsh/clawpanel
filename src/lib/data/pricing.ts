/**
 * Model pricing lookups.
 * Reads pricing from OpenClaw config or uses known defaults.
 */

export interface ModelPricing {
  input: number;       // USD per 1M tokens
  output: number;      // USD per 1M tokens
  cacheRead: number;   // USD per 1M tokens
  cacheWrite: number;  // USD per 1M tokens
}

/** Known model pricing (fallback when config doesn't have pricing) */
const KNOWN_PRICING: Record<string, ModelPricing> = {
  "claude-opus-4-6": { input: 15, output: 75, cacheRead: 1.5, cacheWrite: 18.75 },
  "claude-sonnet-4-20250514": { input: 3, output: 15, cacheRead: 0.3, cacheWrite: 3.75 },
  "claude-opus-4-20250514": { input: 15, output: 75, cacheRead: 1.5, cacheWrite: 18.75 },
  "claude-haiku-3-5-20241022": { input: 0.8, output: 4, cacheRead: 0.08, cacheWrite: 1 },
  "gpt-4o": { input: 2.5, output: 10, cacheRead: 1.25, cacheWrite: 2.5 },
  "gpt-4o-mini": { input: 0.15, output: 0.6, cacheRead: 0.075, cacheWrite: 0.15 },
};

export function getPricing(modelId: string, configPricing?: Record<string, ModelPricing>): ModelPricing | null {
  // Check config pricing first
  if (configPricing?.[modelId]) return configPricing[modelId];

  // Check known pricing (fuzzy match on prefix)
  for (const [key, pricing] of Object.entries(KNOWN_PRICING)) {
    if (modelId.startsWith(key) || key.startsWith(modelId)) {
      return pricing;
    }
  }

  // Check partial matches (e.g., "sonnet" in model name)
  const lower = modelId.toLowerCase();
  if (lower.includes("opus")) return KNOWN_PRICING["claude-opus-4-20250514"];
  if (lower.includes("sonnet")) return KNOWN_PRICING["claude-sonnet-4-20250514"];
  if (lower.includes("haiku")) return KNOWN_PRICING["claude-haiku-3-5-20241022"];
  if (lower.includes("gpt-4o-mini")) return KNOWN_PRICING["gpt-4o-mini"];
  if (lower.includes("gpt-4o")) return KNOWN_PRICING["gpt-4o"];

  return null;
}

export function calculateCost(
  tokens: { input: number; output: number; cacheRead: number; cacheWrite: number },
  pricing: ModelPricing
): number {
  return (
    (tokens.input * pricing.input) / 1_000_000 +
    (tokens.output * pricing.output) / 1_000_000 +
    (tokens.cacheRead * pricing.cacheRead) / 1_000_000 +
    (tokens.cacheWrite * pricing.cacheWrite) / 1_000_000
  );
}
