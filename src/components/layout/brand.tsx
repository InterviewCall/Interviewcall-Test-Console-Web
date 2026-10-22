import { cn } from "@/lib/cn";

/** An answer-sheet bubble, filled in with the highlighter. */
export function LogoMark({ size = 32, className }: { size?: number; className?: string }) {
  return (
    <svg viewBox="0 0 32 32" width={size} height={size} aria-hidden="true" className={cn("shrink-0", className)}>
      <rect width="32" height="32" rx="9" fill="#14213d" />
      <circle cx="16" cy="16" r="8.5" fill="none" stroke="#c8d2e4" strokeWidth="1.8" />
      <circle cx="16" cy="16" r="4.6" fill="#ffd84d" />
    </svg>
  );
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <LogoMark />
      <span className="flex flex-col leading-none">
        <span className="font-display text-[17px] font-semibold tracking-tight">InterviewCall</span>
        <span className="mt-1 text-xs font-normal opacity-70">Entrance tests console</span>
      </span>
    </span>
  );
}
