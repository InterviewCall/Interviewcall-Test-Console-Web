"use client";

import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Icon } from "@/components/ui/icon";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/layout/page-header";
import { Detail, Panel, SessionRow } from "@/features/account/parts";
import { useSessionUser } from "@/features/shell/session";
import { ApiError, toApiError } from "@/lib/api/errors";
import type { SessionInfo, User } from "@/lib/api/types";
import { formatDateTime, formatRelative } from "@/lib/format";
import { useUser, useUserSessions } from "./api";
import { ROLE_LABEL, STATUS_LABEL, STATUS_TONE } from "./labels";

function BackLink() {
  return (
    <Link href="/users" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
      <Icon name="chevron-left" size={16} />
      Back to staff
    </Link>
  );
}

function Loading() {
  return (
    <div className="grid gap-6 xl:grid-cols-2" role="status" aria-label="Loading staff member">
      <Skeleton className="h-72 rounded-panel" />
      <Skeleton className="h-48 rounded-panel" />
    </div>
  );
}

function Unavailable({ error, onRetry }: { error: unknown; onRetry: () => void }) {
  const api = error instanceof ApiError ? error : null;
  if (api?.status === 404) {
    return (
      <EmptyState icon="search" title="Staff member not found" action={<BackLink />}>
        They may have been removed, or the link is wrong.
      </EmptyState>
    );
  }
  return (
    <EmptyState
      icon="alert"
      title="Couldn't load this staff member"
      action={
        <Button variant="secondary" onClick={onRetry}>
          Try again
        </Button>
      }
    >
      {api?.message ?? "Something went wrong. Try again in a moment."}
    </EmptyState>
  );
}

/** Signed in = at least one device still has a live sign-in. Says nothing while we don't know yet. */
function SignedInBadge({ sessions }: { sessions: SessionInfo[] | undefined }) {
  if (!sessions) return null;
  return sessions.length > 0 ? (
    <Badge tone="success" dot>
      Signed in
    </Badge>
  ) : (
    <Badge tone="neutral" dot>
      Signed out
    </Badge>
  );
}

function SignIns({ user }: { user: User }) {
  const sessions = useUserSessions(user.id);

  if (sessions.isPending) {
    return (
      <div className="flex flex-col gap-3" role="status" aria-label="Loading sign-ins">
        <Skeleton className="h-14 w-full" />
        <Skeleton className="h-14 w-full" />
      </div>
    );
  }

  if (sessions.isError) {
    return (
      <EmptyState
        icon="alert"
        title="Couldn't load their sign-ins"
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

  if (sessions.data.length === 0) {
    return (
      <p className="text-sm text-ink-muted">
        {user.lastLoginAt ? "Signed out everywhere right now." : "They haven't signed in yet."}
      </p>
    );
  }

  const devices = sessions.data.length;
  // The API lists the most recently active device first.
  const lastActive = sessions.data[0]!.lastSeenAt;
  return (
    <>
      <p className="mb-4 text-sm font-medium">
        Signed in on {devices === 1 ? "1 device" : `${devices} devices`}
        <span className="font-normal text-ink-muted"> · last active {formatRelative(lastActive)}</span>
      </p>
      <ul className="divide-y divide-line">
        {sessions.data.map((session) => (
          <SessionRow key={session.id} session={session} />
        ))}
      </ul>
    </>
  );
}

export function UserDetailScreen({ id }: { id: number }) {
  const me = useSessionUser();
  const user = useUser(id);
  // Same query as the panel below, so it is fetched once and both stay in step.
  const sessions = useUserSessions(id);
  const isSelf = id === me.id;

  return (
    <div className="flex flex-col gap-6">
      <BackLink />
      <PageHeader
        title={user.data?.fullName ?? "Staff member"}
        description={isSelf ? "This is you. Change your password under Your account." : "Their details, and where they're signed in."}
      />

      {user.isPending ? <Loading /> : null}
      {user.isError ? <Unavailable error={user.error} onRetry={() => void user.refetch()} /> : null}

      {user.data ? (
        <div className="grid gap-6 xl:grid-cols-2">
          <Panel title="Profile" description="To change these, use Edit details on the staff list.">
            <div className="flex items-center gap-4">
              <Avatar name={user.data.fullName} seed={user.data.id} size={56} />
              <div className="min-w-0">
                <p className="truncate font-display text-lg font-semibold">{user.data.fullName}</p>
                <p className="mt-1 flex flex-wrap items-center gap-2">
                  <Badge tone={user.data.role === "ADMIN" ? "ink" : "info"}>{ROLE_LABEL[user.data.role]}</Badge>
                  <Badge tone={STATUS_TONE[user.data.status]}>{STATUS_LABEL[user.data.status]}</Badge>
                  <SignedInBadge sessions={sessions.data} />
                </p>
              </div>
            </div>
            <dl className="mt-6 grid gap-5 sm:grid-cols-2">
              <Detail label="Email" value={user.data.email} />
              <Detail label="Phone" value={user.data.phone} />
              <Detail label="Last sign-in" value={user.data.lastLoginAt ? formatDateTime(user.data.lastLoginAt) : "Not yet"} />
              <Detail label="Joined" value={formatDateTime(user.data.createdAt)} />
            </dl>
          </Panel>

          <Panel title="Where they're signed in" description="Resetting their password or deactivating them signs them out everywhere.">
            <SignIns user={user.data} />
          </Panel>
        </div>
      ) : null}
    </div>
  );
}
