"use client";

import { Zap } from "lucide-react";

interface AutoBuildToggleProps {
  enabled: boolean;
  onToggle: () => void;
}

export function AutoBuildToggle({ enabled, onToggle }: AutoBuildToggleProps) {
  return (
    <button
      onClick={onToggle}
      className={`fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold shadow-lg shadow-black/30 transition-all cursor-pointer ${
        enabled
          ? "border border-gold-dim/50 bg-gold/10 text-gold-light"
          : "border border-card-border bg-card text-muted"
      }`}
    >
      <Zap size={14} className={enabled ? "text-gold" : ""} />
      Auto Build: {enabled ? "on" : "off"}
    </button>
  );
}
