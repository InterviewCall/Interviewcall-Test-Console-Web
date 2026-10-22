import type { ReactNode } from "react";
import { LogoMark, Wordmark } from "@/components/layout/brand";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ui/theme-toggle";

/** A sample booking, so the sign-in panel shows what this console is for. It is illustration, not data. */
function SampleBooking() {
  return (
    <div
      aria-hidden="true"
      className="w-full max-w-sm rotate-[-2deg] rounded-panel bg-surface p-5 text-ink shadow-[0_30px_60px_-20px_rgb(0_0_0/0.6)]"
    >
      <div className="flex items-center gap-3">
        <span className="inline-flex size-10 items-center justify-center rounded-full bg-primary-tint font-display text-sm font-semibold text-primary">
          AR
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-medium">Ananya Rao</p>
          <p className="text-[13px] text-ink-muted">Advanced · 12 minutes</p>
        </div>
        <Badge tone="info" dot>
          Invited
        </Badge>
      </div>

      <div className="mt-5">
        <div className="flex h-2.5 overflow-hidden rounded-full bg-primary-tint">
          <span className="w-[80%] rounded-full bg-primary" />
        </div>
        <div className="mt-2 flex justify-between text-xs text-ink-muted">
          <span>11:00 AM</span>
          <span>Last start 11:48</span>
          <span>12:00 PM</span>
        </div>
      </div>
    </div>
  );
}

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-brand p-12 text-white lg:flex">
        <Wordmark size={44} />
        <div className="flex flex-col gap-12">
          <SampleBooking />
          <p className="max-w-md font-display text-[2.4rem] font-semibold leading-[1.1] tracking-tight">
            Schedule the test after the first call. See where each candidate stands.
          </p>
        </div>
        <p className="text-sm text-rail-ink">Staff access only.</p>
      </aside>

      <main className="relative flex flex-col justify-center px-6 py-10 sm:px-12">
        <ThemeToggle className="absolute right-4 top-4 sm:right-6 sm:top-6" />
        <div className="mx-auto w-full max-w-sm">
          <div className="mb-10 flex items-center gap-3 lg:hidden">
            <LogoMark size={40} />
            <span className="font-display text-lg font-semibold tracking-tight">InterviewCall</span>
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}
