"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import type { ReactNode } from "react";
import { useMe } from "@/features/auth/api";
import { ApiError } from "@/lib/api/errors";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { SessionProvider } from "./session";
import { ShellSkeleton } from "./shell-skeleton";

/**
 * Everything under the console needs a signed-in user. This checks /auth/me once,
 * sends signed-out visitors to the login page and people with a temporary password
 * to the change-password page.
 */
export function AppGate({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { data: user, error, refetch, isFetching } = useMe();

  const signedOut = error instanceof ApiError && error.status === 401;
  const mustChangePassword = user?.status === "UNACTIVATED";

  useEffect(() => {
    if (signedOut) {
      const here = window.location.pathname + window.location.search;
      router.replace(here === "/" ? "/login" : `/login?next=${encodeURIComponent(here)}`);
    } else if (mustChangePassword) {
      router.replace("/change-password");
    }
  }, [signedOut, mustChangePassword, router]);

  if (user && !mustChangePassword) {
    return <SessionProvider user={user}>{children}</SessionProvider>;
  }

  if (error && !signedOut) {
    return (
      <div className="grid min-h-dvh place-items-center bg-paper px-4">
        <EmptyState
          icon="alert"
          title="The console can't load right now"
          action={
            <Button loading={isFetching} onClick={() => void refetch()}>
              Try again
            </Button>
          }
        >
          {error instanceof ApiError ? error.message : "Check your connection and try again."}
        </EmptyState>
      </div>
    );
  }

  return <ShellSkeleton />;
}
