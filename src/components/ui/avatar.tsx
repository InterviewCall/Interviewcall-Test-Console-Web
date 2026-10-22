import { cn } from "@/lib/cn";
import { initials } from "@/lib/format";

const tints = [
  "bg-primary-tint text-primary",
  "bg-success-tint text-success",
  "bg-warning-tint text-warning",
  "bg-sunken text-ink-muted ring-1 ring-inset ring-line",
];

export function Avatar({
  name,
  seed,
  size = 36,
  tone = "varied",
  className,
}: {
  name: string;
  seed: number;
  size?: number;
  /** "varied" picks a tint from the seed; "cream" is the logo's cream, for the dark sidebar. */
  tone?: "varied" | "cream";
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      style={{ width: size, height: size, fontSize: Math.round(size * 0.36) }}
      className={cn(
        "inline-flex shrink-0 select-none items-center justify-center rounded-full font-display font-semibold",
        tone === "cream" ? "bg-highlighter text-on-highlighter" : tints[seed % tints.length],
        className,
      )}
    >
      {initials(name)}
    </span>
  );
}
