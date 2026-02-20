import { NextResponse } from "next/server";
import { readOpenClawConfig, extractGatewayToken, extractModelPricing, getGatewayUrl } from "@/lib/data/config";

export async function GET() {
  const config = await readOpenClawConfig();

  if (!config) {
    return NextResponse.json({
      found: false,
      gatewayUrl: "ws://127.0.0.1:18789",
      token: null,
      pricing: {},
    });
  }

  return NextResponse.json({
    found: true,
    gatewayUrl: getGatewayUrl(config),
    token: extractGatewayToken(config),
    pricing: extractModelPricing(config),
  });
}
