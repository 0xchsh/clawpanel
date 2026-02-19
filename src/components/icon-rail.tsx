"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

const navItems = [
  { href: "/", label: "Dashboard" },
  { href: "/sessions", label: "Sessions" },
  { href: "/skills", label: "Skills" },
  { href: "/cron", label: "Cron" },
  { href: "/settings", label: "Settings" },
] as const;

export function NavLinks() {
  const pathname = usePathname();

  function isActive(href: string) {
    return href === "/" ? pathname === "/" : pathname.startsWith(href);
  }

  return (
    <nav className="flex items-center gap-0.5">
      {navItems.map(({ href, label }) => {
        const active = isActive(href);
        return (
          <Link
            key={href}
            href={href}
            className={`rounded-full px-3.5 py-1.5 text-[13px] transition-colors duration-150 ${
              active
                ? "font-medium text-foreground"
                : "text-muted hover:text-foreground"
            }`}
            style={active ? { boxShadow: "0 0 0 1px var(--card-border)" } : undefined}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
