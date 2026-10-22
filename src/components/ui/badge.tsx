import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type Tone = "neutral" | "ink" | "success" | "warning" | "danger" | "info";

const tones: Record<Tone, string> = {
  neutral: "bg-sunken text-ink-muted ring-line",
  ink: "bg-ink text-paper ring-ink",
  success: "bg-success-tint text-success ring-transparent",
  warning: "bg-warning-tint text-warning ring-transparent",
  danger: "bg-danger-tint text-danger ring-transparent",
  info: "bg-primary-tint text-primary ring-transparent",
};

export function Badge({ tone = "neutral", children, className }: { tone?: Tone; children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
