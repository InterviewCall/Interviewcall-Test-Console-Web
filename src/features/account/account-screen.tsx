"use client";

import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { PageHeader } from "@/components/layout/page-header";
import { ChangePasswordForm } from "@/features/auth/change-password-form";
import { useRevokeSession, useSessions } from "@/features/auth/api";
import { useSessionUser } from "@/features/shell/session";
import { toApiError } from "@/lib/api/errors";
import { formatDateTime } from "@/lib/format";
import { ROLE_LABEL } from "@/features/users/labels";
import { Detail, Panel, SessionRow } from "./parts";

function Sessions() {
  const toast = useToast();
  const sessions = useSessions();
  const revoke = useRevokeSession();

  if (sessions.isPending) {
    return (
      <div className="flex flex-col gap-3" role="status" aria-label="Loading sessions">
        <Skeleton className="h-14 w-full" />
        <Skeleton className="h-14 w-full" />
      </div>
    );
  }

  if (sessions.isError) {
    return (
      <EmptyState
        icon="alert"
        title="Couldn't load your sign-ins"
        action={
          <Button variant="secondary" size="sm" onClick={() => void sessions.refetch()}>
            Try again
          </Button>
        }
      >
        {toApiError(sessions.error).message}
      </EmptyState>
    );
  }

  return (
    <ul className="divide-y divide-line">
      {sessions.data.map((session) => (
        <SessionRow
          key={session.id}
          session={session}
          action={
            session.current ? null : (
              <Button
                variant="secondary"
                size="sm"
                loading={revoke.isPending && revoke.variables === session.id}
                onClick={() =>
                  revoke.mutate(session.id, {
                    onSuccess: () => toast({ title: "Signed out of that device" }),
                    onError: (error) => toast({ tone: "error", title: "Couldn't sign out that device", description: toApiError(error).message }),
                  })
                }
              >
                Sign out
              </Button>
            )
          }
        />
      ))}
    </ul>
  );
}

export function AccountScreen() {
  const user = useSessionUser();
  const toast = useToast();

  return (
    <div className="flex flex-col gap-8">
      <PageHeader title="Your account" description="Your details, your password, and where you're signed in." />

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="flex flex-col gap-6">
          <Panel title="Profile" description="To change these, ask an admin.">
            <div className="flex items-center gap-4">
              <Avatar name={user.fullName} seed={user.id} size={56} />
              <div className="min-w-0">
                <p className="truncate font-display text-lg font-semibold">{user.fullName}</p>
                <Badge tone="info">{ROLE_LABEL[user.role]}</Badge>
              </div>
            </div>
            <dl className="mt-6 grid gap-5 sm:grid-cols-2">
              <Detail label="Email" value={user.email} />
              <Detail label="Phone" value={user.phone} />
              <Detail label="Last sign-in" value={user.lastLoginAt ? formatDateTime(user.lastLoginAt) : "This is your first"} />
              <Detail label="Joined" value={formatDateTime(user.createdAt)} />
            </dl>
          </Panel>

          <Panel title="Where you're signed in" description="Sign out any device you don't recognise.">
            <Sessions />
          </Panel>
        </div>

        <Panel title="Change password" description="Changing it signs you out everywhere else.">
          <ChangePasswordForm
            onDone={() => toast({ title: "Password updated", description: "Your other devices were signed out." })}
          />
        </Panel>
      </div>
    </div>
  );
}
