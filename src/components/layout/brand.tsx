import Image from "next/image";
import { cn } from "@/lib/cn";

/**
 * The InterviewCall mark. Its frame is near-black indigo, so it always sits on a cream tile:
 * that keeps it readable on the indigo sidebar, in dark mode and on the page alike.
 */
export function LogoMark({ size = 40, className }: { size?: number; className?: string }) {
  const height = Math.round(size * 0.68);
  return (
    <span
      style={{ width: size, height: size }}
      className={cn("inline-flex shrink-0 items-center justify-center rounded-[28%] bg-highlighter shadow-[0_1px_0_rgb(255_255_255/0.6)_inset,0_6px_16px_-6px_rgb(0_0_0/0.55)]", className)}
    >
      <Image src="/images/ic-logo.png" alt="" width={Math.round(height * 0.875)} height={height} priority />
    </span>
  );
}

export function Wordmark({ className, size = 40 }: { className?: string; size?: number }) {
  return (
    <span className={cn("flex items-center gap-3", className)}>
      <LogoMark size={size} />
      <span className="flex flex-col leading-none">
        <span className="font-display text-[18px] font-semibold tracking-tight">InterviewCall</span>
        <span className="mt-1.5 text-xs font-normal opacity-70">Entrance tests console</span>
      </span>
    </span>
  );
}
