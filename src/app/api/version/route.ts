import { NextResponse } from "next/server";

const NPM_URL = "https://registry.npmjs.org/openclaw/latest";
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

let cached: { version: string; fetchedAt: number } | null = null;

export async function GET() {
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL) {
    return NextResponse.json({ latest: cached.version });
  }

  try {
    const res = await fetch(NPM_URL, {
      headers: { Accept: "application/json" },
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      return NextResponse.json({ latest: null }, { status: 502 });
    }

    const data = (await res.json()) as { version: string };
    cached = { version: data.version, fetchedAt: Date.now() };

    return NextResponse.json({ latest: data.version });
  } catch {
    return NextResponse.json({ latest: null }, { status: 502 });
  }
}
