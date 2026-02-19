"use client";

interface ToggleSwitchProps {
  enabled: boolean;
  onToggle: () => void;
  size?: "sm" | "md";
}

export function ToggleSwitch({ enabled, onToggle, size = "md" }: ToggleSwitchProps) {
  const trackSize = size === "sm" ? "h-5 w-9" : "h-6 w-11";
  const thumbSize = size === "sm" ? "h-4 w-4" : "h-5 w-5";
  const thumbTranslate = size === "sm" ? "translate-x-4" : "translate-x-5";

  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      onClick={onToggle}
      className={`relative inline-flex shrink-0 cursor-pointer rounded-full transition-colors duration-150 ${trackSize} ${
        enabled ? "bg-foreground" : "bg-card-border"
      }`}
    >
      <span
        className={`pointer-events-none inline-block transform rounded-full bg-white shadow-sm transition-transform duration-150 ${thumbSize} ${
          enabled ? thumbTranslate : "translate-x-0.5"
        } mt-[2px]`}
      />
    </button>
  );
}
