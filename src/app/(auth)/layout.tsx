import type { ReactNode } from "react";
import { AnswerSheet } from "@/components/layout/answer-sheet";
import { LogoMark, Wordmark } from "@/components/layout/brand";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-rail p-12 text-white lg:flex">
        <Wordmark />
        <div className="mx-auto w-full max-w-sm">
          <AnswerSheet className="w-full -rotate-2 drop-shadow-[0_24px_40px_rgb(0_0_0/0.45)]" />
        </div>
        <p className="max-w-sm font-display text-2xl font-semibold leading-snug tracking-tight">
          Schedule the test after the first call, then see where each candidate stands.
        </p>
      </aside>

      <main className="flex flex-col justify-center px-6 py-10 sm:px-12">
        <div className="mx-auto w-full max-w-sm">
          <div className="mb-10 flex items-center gap-2.5 lg:hidden">
            <LogoMark />
            <span className="font-display text-lg font-semibold tracking-tight">InterviewCall</span>
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}
