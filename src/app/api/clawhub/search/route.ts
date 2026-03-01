import { NextRequest, NextResponse } from "next/server";

const CLAWHUB_BASE = "https://clawhub.ai/api/v1";
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const cache = new Map<string, { data: unknown; fetchedAt: number }>();

/** Strip control characters and clamp length */
function sanitizeQuery(raw: string): string {
  return raw
    .trim()
    .replace(/[\x00-\x1f\x7f]/g, "")
    .slice(0, 100);
}

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q") ?? "";
  const sanitized = sanitizeQuery(q);

  if (!sanitized) {
    return NextResponse.json({ results: [] });
  }

  const cacheKey = sanitized.toLowerCase();
  const hit = cache.get(cacheKey);
  if (hit && Date.now() - hit.fetchedAt < CACHE_TTL) {
    return NextResponse.json(hit.data);
  }

  try {
    const url = `${CLAWHUB_BASE}/search?q=${encodeURIComponent(sanitized)}&highlightedOnly=true`;
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
    });

    if (res.status === 429) {
      const retry = res.headers.get("Retry-After") ?? "60";
      return NextResponse.json(
        { error: "Rate limited" },
        { status: 429, headers: { "Retry-After": retry } },
      );
    }

    if (!res.ok) {
      return NextResponse.json({ results: [] }, { status: 502 });
    }

    const body = await res.json();

    // Validate response shape: expect an array of result objects
    const raw = Array.isArray(body) ? body : body?.results ?? body?.data ?? [];
    const results = (raw as Record<string, unknown>[])
      .filter(
        (r) => typeof r === "object" && r !== null && typeof r.slug === "string",
      )
      .map((r) => ({
        slug: String(r.slug),
        displayName: typeof r.displayName === "string" ? r.displayName.slice(0, 200) : String(r.slug),
        summary: typeof r.summary === "string" ? r.summary.slice(0, 200) : null,
        version: typeof r.version === "string" ? r.version : null,
        score: typeof r.score === "number" ? r.score : 0,
        updatedAt: typeof r.updatedAt === "number" ? r.updatedAt : 0,
      }));

    const payload = { results };
    cache.set(cacheKey, { data: payload, fetchedAt: Date.now() });

    return NextResponse.json(payload);
  } catch {
    return NextResponse.json({ results: [] }, { status: 502 });
  }
}
