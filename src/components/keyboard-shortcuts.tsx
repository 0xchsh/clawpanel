"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";

const shortcuts = [
  { key: "1", label: "Dashboard", action: "navigate", target: "/" },
  { key: "2", label: "Sessions", action: "navigate", target: "/sessions" },
  { key: "3", label: "Skills", action: "navigate", target: "/skills" },
  { key: "4", label: "Cron", action: "navigate", target: "/cron" },
  { key: "5", label: "Settings", action: "navigate", target: "/settings" },
  { key: "/", label: "Focus search", action: "focus-search" },
  { key: "?", label: "Show shortcuts", action: "toggle-help" },
  { key: "r", label: "Refresh data", action: "refresh" },
  { key: "Esc", label: "Close / Clear", action: "escape" },
] as const;

interface ShortcutsOverlayProps {
  open: boolean;
  onClose: () => void;
}

function ShortcutsOverlay({ open, onClose }: ShortcutsOverlayProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center"
      style={{ zIndex: "var(--z-modal)" }}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-foreground/20"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="relative w-full max-w-md rounded-2xl bg-card p-6"
        style={{
          boxShadow: "0 0 0 1px rgba(0, 0, 0, 0.06), 0 24px 48px rgba(0, 0, 0, 0.12)",
        }}
      >
        <h2 className="text-[14px] font-semibold text-foreground mb-4">
          Keyboard Shortcuts
        </h2>

        <div className="space-y-1.5">
          {shortcuts.map((s) => (
            <div
              key={s.key}
              className="flex items-center justify-between py-1.5"
            >
              <span className="text-[13px] text-muted">{s.label}</span>
              <kbd className="inline-flex h-6 min-w-[28px] items-center justify-center rounded-md bg-background-deep px-2 font-mono text-[11px] font-medium text-foreground">
                {s.key}
              </kbd>
            </div>
          ))}
        </div>

        <p className="mt-4 text-[11px] text-muted/50">
          Press <kbd className="rounded bg-background-deep px-1 py-0.5 font-mono text-[10px]">Esc</kbd> to close
        </p>
      </div>
    </div>
  );
}

export function useKeyboardShortcuts() {
  const router = useRouter();
  const pathname = usePathname();
  const [helpOpen, setHelpOpen] = useState(false);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Don't trigger when typing in inputs
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT" ||
        target.isContentEditable
      ) {
        // Only handle Escape in inputs
        if (e.key === "Escape") {
          (target as HTMLInputElement).blur();
        }
        return;
      }

      switch (e.key) {
        case "1":
          router.push("/");
          break;
        case "2":
          router.push("/sessions");
          break;
        case "3":
          router.push("/skills");
          break;
        case "4":
          router.push("/cron");
          break;
        case "5":
          router.push("/settings");
          break;
        case "/":
          e.preventDefault();
          // Focus the first search/filter input on the page
          const input = document.querySelector<HTMLInputElement>(
            'input[type="text"], input[type="search"]'
          );
          input?.focus();
          break;
        case "?":
          setHelpOpen((prev) => !prev);
          break;
        case "r":
          // Trigger a client-side refresh (re-render)
          router.refresh();
          break;
        case "Escape":
          setHelpOpen(false);
          break;
      }
    },
    [router]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return {
    helpOpen,
    setHelpOpen,
    ShortcutsOverlay,
  };
}
