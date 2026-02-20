import { NextResponse } from "next/server";
import { readAllSessions, getSessionDirInfo } from "@/lib/data/sessions";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sessionPath = searchParams.get("path") ?? undefined;

  const [dirInfo, sessions] = await Promise.all([
    getSessionDirInfo(sessionPath),
    readAllSessions(sessionPath),
  ]);

  if (!dirInfo) {
    return NextResponse.json({
      available: false,
      path: sessionPath ?? "~/.openclaw/agents/main/sessions/",
      files: 0,
      sessions: [],
    });
  }

  // Return serializable session summaries (convert Sets to arrays)
  const summaries = sessions.map((s) => ({
    filename: s.filename,
    messageCount: s.messageCount,
    totalInputTokens: s.totalInputTokens,
    totalOutputTokens: s.totalOutputTokens,
    totalCacheReadTokens: s.totalCacheReadTokens,
    totalCacheWriteTokens: s.totalCacheWriteTokens,
    firstTimestamp: s.firstTimestamp,
    lastTimestamp: s.lastTimestamp,
    models: Array.from(s.models),
  }));

  return NextResponse.json({
    available: true,
    path: dirInfo.path,
    files: dirInfo.fileCount,
    totalSizeBytes: dirInfo.totalSizeBytes,
    sessions: summaries,
  });
}
