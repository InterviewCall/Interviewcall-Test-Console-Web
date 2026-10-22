"use client";

import { cn } from "@/lib/cn";
import { setThemeMode, THEME_MODES, useThemeMode } from "@/lib/theme/theme";
import type { ThemeMode } from "@/lib/theme/theme";
import { Icon } from "./icon";
import type { IconName } from "./icon";

const OPTIONS: Record<ThemeMode, { label: string; icon: IconName }> = {
  system: { label: "Match my device", icon: "monitor" },
  light: { label: "Light", icon: "sun" },
  dark: { label: "Dark", icon: "moon" },
};

/**
 * Light, dark, or follow the device. `tone="rail"` is for the always-dark sidebar,
 * `tone="page"` for the page itself (the sign-in screen).
 */
export function ThemeToggle({ tone = "page", className }: { tone?: "rail" | "page"; className?: string }) {
  const mode = useThemeMode();
  const rail = tone === "rail";

  return (
    <div
      role="radiogroup"
      aria-label="Colour theme"
      className={cn(
        "inline-flex items-center gap-0.5 rounded-control p-0.5",
        rail ? "bg-white/10" : "border border-line-strong bg-surface",
        className,
      )}
    >
      {THEME_MODES.map((value) => {
        const selected = mode === value;
        const option = OPTIONS[value];
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={option.label}
            title={option.label}
            onClick={() => setThemeMode(value)}
            className={cn(
              "inline-flex size-8 items-center justify-center rounded-[calc(var(--radius-control)-2px)] transition-colors focus-visible:outline-offset-1",
              rail ? "focus-visible:outline-highlighter" : "",
              selected
                ? rail
                  ? "bg-highlighter text-on-highlighter"
                  : "bg-action text-on-action"
                : rail
                  ? "text-rail-ink hover:text-white"
                  : "text-ink-muted hover:bg-sunken hover:text-ink",
            )}
          >
            <Icon name={option.icon} size={16} />
          </button>
        );
      })}
    </div>
  );
}
