import { NextResponse } from "next/server";
import { readSessionFile, getSessionPath } from "@/lib/data/sessions";
import path from "path";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ key: string }> }
) {
  const { key } = await params;

  // key is the filename without .jsonl extension (e.g., a UUID)
  const sessionPath = getSessionPath();
  const filePath = path.join(sessionPath, `${key}.jsonl`);

  try {
    const sessionData = await readSessionFile(filePath);

    // Calculate session duration
    let duration = "—";
    if (sessionData.firstTimestamp && sessionData.lastTimestamp) {
      const start = new Date(sessionData.firstTimestamp).getTime();
      const end = new Date(sessionData.lastTimestamp).getTime();
      const ms = end - start;
      const seconds = Math.floor(ms / 1000);
      if (seconds < 60) {
        duration = `${seconds}s`;
      } else if (seconds < 3600) {
        duration = `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
      } else {
        duration = `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
      }
    }

    return NextResponse.json({
      found: true,
      messages: sessionData.messages,
      totalTokens:
        sessionData.totalInputTokens +
        sessionData.totalOutputTokens +
        sessionData.totalCacheReadTokens +
        sessionData.totalCacheWriteTokens,
      totalCost: sessionData.totalCost,
      model: Array.from(sessionData.models)[0] ?? "unknown",
      duration,
      messageCount: sessionData.messageCount,
    });
  } catch {
    return NextResponse.json({ found: false, messages: [], error: "Session not found" }, { status: 404 });
  }
}
