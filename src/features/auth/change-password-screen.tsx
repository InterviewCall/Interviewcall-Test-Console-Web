"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { homeFor } from "@/features/shell/session";
import { ApiError } from "@/lib/api/errors";
import { useLogout, useMe } from "./api";
import { ChangePasswordForm } from "./change-password-form";

/** Where someone lands after signing in with a temporary password. */
export function ChangePasswordScreen() {
  const router = useRouter();
  const toast = useToast();
  const me = useMe();
  const logout = useLogout();

  const signedOut = me.error instanceof ApiError && me.error.status === 401;
  const alreadyActive = me.data && me.data.status !== "UNACTIVATED";

  useEffect(() => {
    if (signedOut) router.replace("/login");
    else if (me.data && alreadyActive) router.replace(homeFor(me.data.role));
  }, [signedOut, alreadyActive, me.data, router]);

  if (!me.data || alreadyActive) {
    return (
      <div className="flex flex-col gap-4" role="status" aria-label="Loading">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-4 w-72" />
        <Skeleton className="mt-4 h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  return (
    <>
      <h1 className="font-display text-3xl font-semibold leading-tight tracking-tight">Choose your own password</h1>
      <p className="mt-2 text-sm text-ink-muted">
        {me.data.fullName.split(" ")[0]}, you signed in with a temporary password. Replace it to continue.
      </p>

      <div className="mt-8">
        <ChangePasswordForm
          currentLabel="Temporary password"
          submitLabel="Save password and continue"
          onDone={(user) => {
            toast({ title: "Password saved", description: "You're signed in." });
            router.replace(homeFor(user.role));
          }}
        />
      </div>

      <p className="mt-8 text-[13px] text-ink-muted">
        Not {me.data.fullName}?{" "}
        <button type="button" onClick={() => logout.mutate()} className="font-medium text-primary underline underline-offset-2">
          Sign out
        </button>
      </p>
    </>
  );
}
