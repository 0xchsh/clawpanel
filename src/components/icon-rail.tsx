"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  SquaresFour,
  Robot,
  ShootingStar,
  Repeat,
  GearSix,
  Sparkle,
} from "@phosphor-icons/react";
import type { Icon as PhosphorIcon } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

/* ── Sidebar nav items (matches Figma 3-column layout) ── */
const sideNavItems: { href: string; label: string; icon: PhosphorIcon }[] = [
  { href: "/overview", label: "Overview", icon: SquaresFour },
  { href: "/agents", label: "Agents", icon: Robot },
  { href: "/skills", label: "Skills", icon: ShootingStar },
  { href: "/cron", label: "Jobs (CRON)", icon: Repeat },
  { href: "/settings", label: "Settings", icon: GearSix },
];

/* ── Mobile horizontal nav items ── */
const navItems: { href: string; label: string; icon: PhosphorIcon }[] = [
  { href: "/overview", label: "Overview", icon: SquaresFour },
  { href: "/agents", label: "Agents", icon: Robot },
  { href: "/skills", label: "Skills", icon: ShootingStar },
  { href: "/cron", label: "Jobs", icon: Repeat },
  { href: "/settings", label: "Settings", icon: GearSix },
];

export function NavLinks() {
  const pathname = usePathname();

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(href + "/");
  }

  return (
    <nav className="flex items-center gap-0.5 shrink-0 lg:hidden">
      {navItems.map(({ href, label, icon: Icon }) => {
        const active = isActive(href);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-2.5 sm:px-3 py-1.5 text-[12px] sm:text-[13px] transition-colors duration-150",
              active
                ? "font-medium text-foreground"
                : "text-muted hover:text-foreground"
            )}
            style={active ? { boxShadow: "0 0 0 1px var(--card-border)" } : undefined}
          >
            <Icon size={14} weight={active ? "bold" : "regular"} />
            <span className="hidden sm:inline">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export function SideNav() {
  const pathname = usePathname();

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(href + "/");
  }

  return (
    <aside className="hidden lg:flex flex-col gap-8 w-[200px] shrink-0">
      {/* Logo */}
      <div className="h-9 w-9 flex items-center justify-center rounded-lg bg-background text-muted">
        <Sparkle size={18} weight="fill" />
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-2">
        {sideNavItems.map(({ href, label, icon: Icon }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-2 py-1.5 text-base font-semibold transition-colors duration-150",
                active
                  ? "bg-background text-foreground"
                  : "text-foreground hover:bg-background"
              )}
            >
              <Icon size={20} weight={active ? "fill" : "regular"} />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
