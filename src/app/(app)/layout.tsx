import type { ReactNode } from "react";
import { AppGate } from "@/features/shell/app-gate";
import { AppShell } from "@/features/shell/app-shell";

// Everything here depends on the signed-in user, which the browser learns from /auth/me.
// There is no server-rendered content to make instant, so Next shouldn't validate it as such.
export const instant = false;

export default function ConsoleLayout({ children }: { children: ReactNode }) {
  return (
    <AppGate>
      <AppShell>{children}</AppShell>
    </AppGate>
  );
}
