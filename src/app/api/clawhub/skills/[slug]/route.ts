import { NextRequest, NextResponse } from "next/server";

const CLAWHUB_BASE = "https://clawhub.ai/api/v1";
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes
const SLUG_RE = /^[a-z0-9][a-z0-9-]*[a-z0-9]$/;

const cache = new Map<string, { data: unknown; fetchedAt: number }>();

function clamp(val: unknown, max: number): string | null {
  if (typeof val !== "string") return null;
  return val.slice(0, max);
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  if (!slug || !SLUG_RE.test(slug)) {
    return NextResponse.json({ error: "Invalid slug" }, { status: 400 });
  }

  const hit = cache.get(slug);
  if (hit && Date.now() - hit.fetchedAt < CACHE_TTL) {
    return NextResponse.json(hit.data);
  }

  try {
    const res = await fetch(`${CLAWHUB_BASE}/skills/${encodeURIComponent(slug)}`, {
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
      return NextResponse.json({ skill: null }, { status: 502 });
    }

    const body = (await res.json()) as Record<string, unknown>;

    // Validate & reshape — only forward safe fields
    const skill = body.skill as Record<string, unknown> | undefined;
    const latestVersion = body.latestVersion as Record<string, unknown> | undefined;
    const owner = body.owner as Record<string, unknown> | undefined;

    const payload = {
      skill: skill
        ? {
            slug: String(skill.slug ?? slug),
            displayName: clamp(skill.displayName, 200) ?? slug,
            summary: clamp(skill.summary, 500),
          }
        : null,
      latestVersion: latestVersion
        ? {
            version: String(latestVersion.version ?? ""),
            changelog: clamp(latestVersion.changelog, 500) ?? "",
            createdAt:
              typeof latestVersion.createdAt === "number"
                ? latestVersion.createdAt
                : 0,
          }
        : null,
      owner: owner
        ? {
            handle: clamp(owner.handle, 100),
            displayName: clamp(owner.displayName, 100),
          }
        : null,
    };

    cache.set(slug, { data: payload, fetchedAt: Date.now() });

    return NextResponse.json(payload);
  } catch {
    return NextResponse.json({ skill: null }, { status: 502 });
  }
}
