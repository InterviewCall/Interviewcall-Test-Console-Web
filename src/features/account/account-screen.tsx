"use client";

import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Icon } from "@/components/ui/icon";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { PageHeader } from "@/components/layout/page-header";
import { ChangePasswordForm } from "@/features/auth/change-password-form";
import { useRevokeSession, useSessions } from "@/features/auth/api";
import { useSessionUser } from "@/features/shell/session";
import { toApiError } from "@/lib/api/errors";
import { describeDevice, formatDateTime, formatRelative } from "@/lib/format";
import { ROLE_LABEL } from "@/features/users/labels";

function Panel({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-panel border border-line bg-surface">
      <div className="border-b border-line px-6 py-4">
        <h2 className="font-display text-base font-semibold">{title}</h2>
        {description ? <p className="mt-0.5 text-[13px] text-ink-muted">{description}</p> : null}
      </div>
      <div className="px-6 py-5">{children}</div>
    </section>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-[13px] text-ink-muted">{label}</dt>
      <dd className="mt-0.5 truncate font-medium">{value}</dd>
    </div>
  );
}

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
      {sessions.data.map((session) => {
        const device = describeDevice(session.userAgent);
        return (
          <li key={session.id} className="flex items-center gap-4 py-3.5 first:pt-0 last:pb-0">
            <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-control bg-sunken text-ink-muted ring-1 ring-inset ring-line">
              <Icon name={device.mobile ? "phone" : "monitor"} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="flex flex-wrap items-center gap-2 font-medium">
                {device.label}
                {session.current ? <Badge tone="success">This device</Badge> : null}
              </p>
              <p className="truncate text-[13px] text-ink-muted" title={formatDateTime(session.createdAt)}>
                {session.ip ?? "Unknown address"} · active {formatRelative(session.lastSeenAt)}
              </p>
            </div>
            {session.current ? null : (
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
            )}
          </li>
        );
      })}
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
