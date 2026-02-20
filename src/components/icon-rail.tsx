"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, MessageSquare, Zap, Clock, KanbanSquare, Brain, Building2, Settings2 } from "lucide-react";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/sessions", label: "Sessions", icon: MessageSquare },
  { href: "/skills", label: "Skills", icon: Zap },
  { href: "/cron", label: "Cron", icon: Clock },
  { href: "/tasks", label: "Tasks", icon: KanbanSquare },
  { href: "/memory", label: "Memory", icon: Brain },
  { href: "/office", label: "Office", icon: Building2 },
  { href: "/settings", label: "Settings", icon: Settings2 },
];

export function NavLinks() {
  const pathname = usePathname();

  function isActive(href: string) {
    return href === "/" ? pathname === "/" : pathname.startsWith(href);
  }

  return (
    <nav className="flex items-center gap-0.5 shrink-0">
      {navItems.map(({ href, label, icon: Icon }) => {
        const active = isActive(href);
        return (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-1.5 rounded-full px-2.5 sm:px-3 py-1.5 text-[12px] sm:text-[13px] transition-colors duration-150 ${
              active
                ? "font-medium text-foreground"
                : "text-muted hover:text-foreground"
            }`}
            style={active ? { boxShadow: "0 0 0 1px var(--card-border)" } : undefined}
          >
            <Icon size={13} strokeWidth={active ? 2.2 : 1.8} />
            <span className="hidden sm:inline">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
