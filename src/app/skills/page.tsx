"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useGatewayContext } from "@/contexts/gateway-context";
import {
  ShootingStar,
  Package,
  Folder,
  Wrench,
  CaretDown,
  MagnifyingGlass,
  ArrowLeft,
  CircleNotch,
  DownloadSimple,
  Star,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import type { ClawhubSearchResult, ClawhubSkillDetail } from "@/types";

/* ── Toggle ── */

function Toggle({
  enabled,
  onToggle,
}: {
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      onClick={onToggle}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors duration-150",
        enabled ? "bg-foreground" : "bg-card-border",
      )}
    >
      <span
        className={cn(
          "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform duration-150 mt-[2px]",
          enabled ? "translate-x-5" : "translate-x-0.5",
        )}
      />
    </button>
  );
}

/* ── Helpers ── */

const typeIcon: Record<string, typeof Package> = {
  bundled: Package,
  managed: ShootingStar,
  workspace: Folder,
};

function timeAgo(date: Date): string {
  const now = Date.now();
  const diff = now - new Date(date).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

function epochAgo(epoch: number): string {
  if (!epoch) return "";
  const days = Math.floor((Date.now() - epoch) / (1000 * 60 * 60 * 24));
  if (days === 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

/* ── ClawhHub Search Hook ── */

function useClawhubSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ClawhubSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    const trimmed = query.trim();
    if (!trimmed) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    timerRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/clawhub/search?q=${encodeURIComponent(trimmed)}`,
        );
        if (!res.ok) {
          setResults([]);
          return;
        }
        const data = (await res.json()) as { results: ClawhubSearchResult[] };
        setResults(data.results ?? []);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [query]);

  return { query, setQuery, results, loading };
}

/* ── Skill Preview Panel ── */

function SkillPreview({
  slug,
  onBack,
}: {
  slug: string;
  onBack: () => void;
}) {
  const [detail, setDetail] = useState<ClawhubSkillDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);

    fetch(`/api/clawhub/skills/${encodeURIComponent(slug)}`)
      .then(async (res) => {
        if (!res.ok) throw new Error("fetch failed");
        return res.json() as Promise<ClawhubSkillDetail>;
      })
      .then((data) => {
        if (!cancelled) setDetail(data);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  return (
    <div className="bg-card border border-card-border rounded-lg animate-fade-up">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-card-border/50">
        <button
          type="button"
          onClick={onBack}
          className="p-1 rounded-md text-muted hover:text-foreground transition-colors duration-150 cursor-pointer"
        >
          <ArrowLeft size={16} weight="bold" />
        </button>
        <span className="text-sm font-semibold text-foreground">
          Skill Preview
        </span>
      </div>

      <div className="px-4 py-4">
        {loading && (
          <div className="flex items-center justify-center py-8">
            <CircleNotch
              size={20}
              weight="bold"
              className="text-muted animate-spin"
            />
          </div>
        )}

        {error && !loading && (
          <p className="text-sm text-accent-red text-center py-8">
            Failed to load skill details.
          </p>
        )}

        {!loading && !error && detail && (
          <div className="flex flex-col gap-4">
            {/* Title + version */}
            <div>
              <h2 className="text-base font-semibold text-foreground">
                {detail.skill?.displayName ?? slug}
              </h2>
              {detail.latestVersion?.version && (
                <span className="text-xs text-muted">
                  v{detail.latestVersion.version}
                </span>
              )}
            </div>

            {/* Author */}
            {detail.owner && (detail.owner.displayName || detail.owner.handle) && (
              <Row label="Author">
                <span className="text-sm text-foreground">
                  {detail.owner.displayName ?? detail.owner.handle}
                </span>
              </Row>
            )}

            {/* Summary */}
            {detail.skill?.summary && (
              <div>
                <p className="text-xs font-semibold text-muted mb-1">
                  Summary
                </p>
                <p className="text-sm text-foreground leading-relaxed">
                  {detail.skill.summary.slice(0, 200)}
                </p>
              </div>
            )}

            {/* Changelog */}
            {detail.latestVersion?.changelog && (
              <div>
                <p className="text-xs font-semibold text-muted mb-1">
                  Changelog
                </p>
                <p className="text-xs text-muted leading-relaxed whitespace-pre-line">
                  {detail.latestVersion.changelog.slice(0, 500)}
                </p>
              </div>
            )}

            {/* Updated */}
            {detail.latestVersion?.createdAt ? (
              <Row label="Published">
                <span className="text-sm text-foreground">
                  {epochAgo(detail.latestVersion.createdAt)}
                </span>
              </Row>
            ) : null}

            {/* Install button */}
            <button
              type="button"
              className="mt-2 flex items-center justify-center gap-2 w-full h-9 rounded-lg bg-foreground text-background text-sm font-semibold transition-opacity duration-150 hover:opacity-90 cursor-pointer"
            >
              <DownloadSimple size={16} weight="bold" />
              Install
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Main Page ── */

export default function SkillsPage() {
  const { skillsFull, toggleSkillFull } = useGatewayContext();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const { query, setQuery, results, loading } = useClawhubSearch();
  const [previewSlug, setPreviewSlug] = useState<string | null>(null);

  const activeCount = skillsFull.filter((s) => s.active).length;
  const inactiveCount = skillsFull.filter((s) => !s.active).length;

  const handleResultClick = useCallback((slug: string) => {
    setPreviewSlug(slug);
  }, []);

  return (
    <div className="flex flex-col px-4 py-8 lg:px-0 lg:py-0">
      {/* Page title */}
      <div className="flex items-center justify-between h-9">
        <h1 className="text-xl font-semibold text-foreground">Skills</h1>
        <span className="text-base font-semibold text-muted">
          {activeCount} active, {inactiveCount} inactive
        </span>
      </div>

      {/* ── ClawhHub Search ── */}
      <div className="mt-6 flex flex-col gap-2">
        <div className="relative">
          <MagnifyingGlass
            size={16}
            weight="bold"
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPreviewSlug(null);
            }}
            placeholder="Search ClawhHub for verified skills…"
            className="settings-input !pl-9"
            style={{ lineHeight: "40px" }}
          />
          {loading && (
            <CircleNotch
              size={14}
              weight="bold"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted animate-spin"
            />
          )}
        </div>

        {/* Search results or preview */}
        {query.trim() && !previewSlug && (
          <div className="flex flex-col gap-1">
            {!loading && results.length === 0 && (
              <p className="text-xs text-muted py-3 text-center">
                No verified skills found for &ldquo;{query.trim()}&rdquo;
              </p>
            )}

            {results.map((r) => (
              <button
                key={r.slug}
                type="button"
                onClick={() => handleResultClick(r.slug)}
                className="flex items-center gap-3 px-4 py-3 bg-card border border-card-border rounded-lg text-left transition-colors duration-150 hover:bg-card-hover cursor-pointer"
              >
                <ShootingStar
                  size={18}
                  weight="regular"
                  className="text-muted shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-foreground truncate">
                      {r.displayName}
                    </span>
                    {r.version && (
                      <span className="text-[10px] text-muted shrink-0">
                        v{r.version}
                      </span>
                    )}
                  </div>
                  {r.summary && (
                    <p className="text-xs text-muted truncate mt-0.5">
                      {r.summary.slice(0, 200)}
                    </p>
                  )}
                </div>
                {r.score > 0 && (
                  <div className="flex items-center gap-1 shrink-0">
                    <Star size={12} weight="fill" className="text-accent-yellow" />
                    <span className="text-[10px] font-semibold text-muted">
                      {r.score}
                    </span>
                  </div>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Preview panel */}
        {previewSlug && (
          <SkillPreview
            slug={previewSlug}
            onBack={() => setPreviewSlug(null)}
          />
        )}
      </div>

      {/* ── Installed Skills ── */}
      <div className="flex flex-col gap-2 mt-8">
        {skillsFull.length === 0 && (
          <div className="bg-card border border-card-border rounded-lg p-8 text-center">
            <ShootingStar
              size={32}
              weight="regular"
              className="text-muted mx-auto mb-3"
            />
            <p className="text-sm font-semibold text-foreground">
              No skills installed
            </p>
            <p className="text-xs text-muted mt-1">
              Skills extend your agent&apos;s capabilities.
            </p>
          </div>
        )}

        {skillsFull.map((skill) => {
          const expanded = expandedId === skill.id;
          const TypeIcon = typeIcon[skill.type] || Wrench;

          return (
            <div key={skill.id} className="bg-card border border-card-border rounded-lg">
              {/* Skill row */}
              <div className="flex items-center gap-3 px-4 py-3">
                <button
                  type="button"
                  onClick={() => setExpandedId(expanded ? null : skill.id)}
                  className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer text-left"
                >
                  <TypeIcon
                    size={18}
                    weight="regular"
                    className="text-muted shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-base font-semibold text-foreground truncate">
                        {skill.name}
                      </span>
                      <span className="text-xs font-semibold text-muted rounded-md bg-card px-1.5 py-0.5 shrink-0">
                        {skill.type}
                      </span>
                      <span className="text-xs text-muted shrink-0">
                        v{skill.version}
                      </span>
                    </div>
                    <p className="text-sm text-muted truncate mt-0.5">
                      {skill.description}
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  aria-label={expanded ? "Collapse details" : "Expand details"}
                  onClick={() => setExpandedId(expanded ? null : skill.id)}
                  className="p-1 rounded-md text-muted hover:text-foreground transition-colors duration-150 cursor-pointer shrink-0"
                >
                  <CaretDown
                    size={14}
                    weight="bold"
                    className={cn(
                      "transition-transform duration-200",
                      expanded && "rotate-180",
                    )}
                    style={{ transitionTimingFunction: "var(--ease-out)" }}
                  />
                </button>

                <Toggle
                  enabled={skill.active}
                  onToggle={() => toggleSkillFull(skill.id)}
                />
              </div>

              {/* Expanded detail */}
              {expanded && (
                <div className="px-4 pb-4 pt-1 border-t border-card-border/50">
                  <div className="flex flex-col gap-2 mt-3">
                    {skill.author && (
                      <Row label="Author">
                        <span className="text-base text-foreground">
                          {skill.author}
                        </span>
                      </Row>
                    )}
                    <Row label="Updated">
                      <span className="text-base text-foreground">
                        {timeAgo(skill.updatedAt)}
                      </span>
                    </Row>
                    {skill.dependencies.length > 0 && (
                      <div className="mt-2">
                        <p className="text-sm font-semibold text-muted mb-1.5">
                          Dependencies
                        </p>
                        <div className="flex flex-col gap-1">
                          {skill.dependencies.map((dep) => (
                            <div
                              key={dep.name}
                              className="flex items-center gap-2"
                            >
                              <span
                                className={cn(
                                  "h-1.5 w-1.5 rounded-full shrink-0",
                                  dep.met
                                    ? "bg-accent-green"
                                    : "bg-accent-red",
                                )}
                              />
                              <span className="font-mono text-sm text-muted">
                                {dep.name}
                                {dep.version && ` (${dep.version})`}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {skill.documentation && (
                      <div className="mt-2">
                        <p className="text-sm font-semibold text-muted mb-1.5">
                          Documentation
                        </p>
                        <p className="text-sm text-muted leading-relaxed">
                          {skill.documentation}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted">{label}</span>
      {children}
    </div>
  );
}
