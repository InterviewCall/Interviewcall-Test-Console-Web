"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { FormError } from "@/components/ui/form-error";
import { useToast } from "@/components/ui/toast";
import { toApiError } from "@/lib/api/errors";
import type { User, UserWithTemporaryPassword } from "@/lib/api/types";
import { useDeactivateUser, useReactivateUser, useResetPassword } from "./api";
import { TemporaryPasswordPanel } from "./temporary-password-panel";

export type UserAction = { kind: "deactivate" | "reactivate" | "reset"; user: User };

/**
 * Confirm dialog for the three account actions. Reset and reactivate both end by
 * revealing a one-time temporary password.
 */
export function UserActionDialog({ action, onClose }: { action: UserAction | null; onClose: () => void }) {
  const toast = useToast();
  const deactivate = useDeactivateUser();
  const reactivate = useReactivateUser();
  const reset = useResetPassword();
  const [error, setError] = useState<string | null>(null);
  const [revealed, setRevealed] = useState<{ result: UserWithTemporaryPassword; kind: "reactivate" | "reset" } | null>(null);

  function close() {
    setError(null);
    setRevealed(null);
    onClose();
  }

  if (revealed) {
    const { result, kind } = revealed;
    return (
      <Dialog
        open
        onClose={close}
        dismissible={false}
        title={kind === "reset" ? "Password reset" : "Account reactivated"}
        footer={<Button onClick={close}>I&apos;ve copied it</Button>}
      >
        <TemporaryPasswordPanel
          name={result.user.fullName}
          email={result.user.email}
          password={result.temporaryPassword}
          intro={
            kind === "reset"
              ? "Their old password and all their sessions no longer work."
              : "They can sign in again with this temporary password."
          }
        />
      </Dialog>
    );
  }

  const user = action?.user;
  const pending = deactivate.isPending || reactivate.isPending || reset.isPending;

  async function confirm() {
    if (!action) return;
    setError(null);
    try {
      if (action.kind === "deactivate") {
        await deactivate.mutateAsync(action.user.id);
        toast({ title: "Account deactivated", description: `${action.user.fullName} can no longer sign in.` });
        close();
      } else if (action.kind === "reactivate") {
        setRevealed({ result: await reactivate.mutateAsync(action.user.id), kind: "reactivate" });
      } else {
        setRevealed({ result: await reset.mutateAsync(action.user.id), kind: "reset" });
      }
    } catch (caught) {
      setError(toApiError(caught).message);
    }
  }

  const copy = {
    deactivate: {
      title: "Deactivate this account?",
      body: "They'll be signed out everywhere and can't sign in until you reactivate them.",
      cta: "Deactivate",
      danger: true,
    },
    reactivate: {
      title: "Reactivate this account?",
      body: "They'll get a new temporary password and must choose their own at first sign-in.",
      cta: "Reactivate",
      danger: false,
    },
    reset: {
      title: "Reset this password?",
      body: "Their current password stops working and they're signed out everywhere. You'll get a temporary one to share.",
      cta: "Reset password",
      danger: false,
    },
  } as const;
  const text = action ? copy[action.kind] : copy.deactivate;

  return (
    <Dialog
      open={action !== null}
      onClose={close}
      dismissible={!pending}
      size="sm"
      title={text.title}
      footer={
        <>
          <Button variant="secondary" onClick={close} disabled={pending}>
            Cancel
          </Button>
          <Button variant={text.danger ? "danger" : "primary"} loading={pending} onClick={() => void confirm()}>
            {text.cta}
          </Button>
        </>
      }
    >
      {user ? (
        <div className="flex flex-col gap-4">
          <FormError message={error} />
          <p className="text-sm">
            <span className="font-medium">{user.fullName}</span> <span className="text-ink-muted">· {user.email}</span>
          </p>
          <p className="text-sm text-ink-muted">{text.body}</p>
        </div>
      ) : null}
    </Dialog>
  );
}
