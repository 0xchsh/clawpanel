import { NextResponse } from "next/server";

/**
 * Simple health check endpoint.
 * Returns ClawPanel server status and gateway connection info.
 */
export async function GET() {
  const gatewayUrl = process.env.CLAWPANEL_GATEWAY_URL ?? "ws://127.0.0.1:18789";
  const hasToken = !!process.env.CLAWPANEL_GATEWAY_TOKEN;

  return NextResponse.json({
    status: "ok",
    version: process.env.npm_package_version ?? "0.1.0",
    gateway: {
      url: gatewayUrl,
      hasToken,
    },
    uptime: process.uptime(),
  });
}
