"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  SquaresFour,
  Robot,
  ShootingStar,
  Repeat,
  GearSix,
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
    <aside className="hidden lg:flex flex-col gap-8 w-[200px] shrink-0 lg:sticky lg:top-0 lg:self-start">
      {/* Logo */}
      <div className="group h-9 w-9 flex items-center justify-center cursor-pointer overflow-visible">
        <svg width="20" height="24" viewBox="0 0 20 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="overflow-visible">
          <path
            className="transition-transform duration-300 ease-out origin-[50%_75%] group-hover:-rotate-[6deg] group-hover:-translate-x-[1px]"
            d="M12.6576 0.0342723C14.4661 -0.0535476 18.3453 -0.142151 16.8025 2.08701L16.7243 2.19475C15.7936 3.26463 14.8036 4.28779 14.0124 5.46005C11.8997 8.55815 12.3554 12.0926 13.7126 15.4395C14.4684 17.3898 14.4681 19.6848 13.5235 21.5356L13.4291 21.7133C13.4246 21.7159 13.4213 21.719 13.4187 21.7231L13.4122 21.7397C11.3893 25.4345 9.52997 20.358 6.67454 21.2511C4.03045 22.2917 3.86219 23.0213 2.15696 19.9972C-0.423855 15.527 -1.09661 9.42252 2.42454 5.30804L2.67747 5.04306C5.2368 2.42025 8.64812 0.596987 12.2927 0.0811473L12.6576 0.0342723Z"
            fill="currentColor"
          />
          <path
            className="transition-transform duration-300 ease-out origin-[70%_80%] group-hover:rotate-[10deg] group-hover:translate-x-[1.5px] group-hover:-translate-y-[1px]"
            d="M13.7807 11.7706C15.3501 6.27914 20.4391 3.37035 19.5238 11.2384L19.5287 11.2397C19.2733 12.9027 15.5164 21.717 15.2725 18.1075C15.2057 15.9996 14.1359 14.0843 13.7084 12.0343L13.7807 11.7706Z"
            fill="currentColor"
          />
        </svg>
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
