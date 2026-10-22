"use client";

import { useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Icon } from "@/components/ui/icon";
import { Menu } from "@/components/ui/menu";
import type { MenuEntry } from "@/components/ui/menu";
import { Pagination } from "@/components/ui/pagination";
import { Select } from "@/components/ui/fields";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, Td, Th } from "@/components/ui/table";
import { PageHeader } from "@/components/layout/page-header";
import { useSessionUser } from "@/features/shell/session";
import { toApiError } from "@/lib/api/errors";
import { USER_ROLES, USER_STATUSES } from "@/lib/api/types";
import type { ListUsersParams, User, UserRole, UserStatus } from "@/lib/api/types";
import { formatDateTime, formatRelative } from "@/lib/format";
import { useUsers } from "./api";
import { ROLE_LABEL, STATUS_LABEL, STATUS_TONE } from "./labels";
import { UserActionDialog } from "./user-actions";
import type { UserAction } from "./user-actions";
import { UserFormDialog } from "./user-form-dialog";
import { useDebounced } from "./use-debounced";

const PAGE_SIZE = 20;

function rowMenu(user: User, isSelf: boolean, open: { edit: () => void; act: (kind: UserAction["kind"]) => void }): MenuEntry[] {
  const entries: MenuEntry[] = [{ label: "Edit details", icon: "pencil", onSelect: open.edit }];
  const selfHint = "Use Your account for this";

  if (user.status === "INACTIVE") {
    entries.push({ separator: true }, { label: "Reactivate", icon: "restore", onSelect: () => open.act("reactivate") });
  } else {
    entries.push(
      { label: "Reset password", icon: "key", onSelect: () => open.act("reset"), disabled: isSelf, hint: isSelf ? selfHint : undefined },
      { separator: true },
      { label: "Deactivate", icon: "power", tone: "danger", onSelect: () => open.act("deactivate"), disabled: isSelf, hint: isSelf ? "You can't deactivate yourself" : undefined },
    );
  }
  return entries;
}

function StatusDot({ status }: { status: UserStatus }) {
  const dot = status === "ACTIVE" ? "bg-success" : status === "UNACTIVATED" ? "bg-warning" : "bg-line-strong";
  return (
    <span className="inline-flex items-center gap-2">
      <span aria-hidden="true" className={`size-2 rounded-full ${dot}`} />
      {STATUS_LABEL[status]}
    </span>
  );
}

function LoadingRows() {
  return (
    <div className="flex flex-col gap-4 p-4" role="status" aria-label="Loading staff">
      {Array.from({ length: 6 }, (_, i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton className="size-9 rounded-full" />
          <div className="flex-1">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="mt-1.5 h-3 w-56" />
          </div>
          <Skeleton className="hidden h-5 w-16 sm:block" />
        </div>
      ))}
    </div>
  );
}

export function UsersScreen() {
  const me = useSessionUser();
  const [search, setSearch] = useState("");
  const [role, setRole] = useState<UserRole | "">("");
  const [status, setStatus] = useState<UserStatus | "">("");
  const [page, setPage] = useState(1);
  const [formMode, setFormMode] = useState<{ kind: "create" } | { kind: "edit"; user: User; isSelf: boolean } | null>(null);
  const [action, setAction] = useState<UserAction | null>(null);

  const q = useDebounced(search.trim());
  const params: ListUsersParams = {
    page,
    pageSize: PAGE_SIZE,
    ...(q ? { q } : {}),
    ...(role ? { role } : {}),
    ...(status ? { status } : {}),
  };
  const users = useUsers(params);
  const filtered = Boolean(q || role || status);

  function clearFilters() {
    setSearch("");
    setRole("");
    setStatus("");
    setPage(1);
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Staff"
        description="Everyone who can sign in to this console."
        actions={
          <Button icon="plus" onClick={() => setFormMode({ kind: "create" })}>
            Add staff member
          </Button>
        }
      />

      <section className="rounded-panel border border-line bg-surface">
        <div className="flex flex-col gap-3 border-b border-line p-4 sm:flex-row sm:items-center">
          <div className="relative sm:max-w-xs sm:flex-1">
            <Icon name="search" size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" />
            <input
              type="search"
              aria-label="Search staff"
              placeholder="Search name, email or phone"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              className="h-10 w-full rounded-control border border-line-strong bg-surface pl-9 pr-3 text-sm placeholder:text-ink-faint focus-visible:border-ink focus-visible:outline-offset-0"
            />
          </div>
          <div className="grid grid-cols-2 gap-3 sm:ml-auto sm:flex">
            <Select
              aria-label="Filter by role"
              value={role}
              onChange={(event) => {
                setRole(event.target.value as UserRole | "");
                setPage(1);
              }}
            >
              <option value="">All roles</option>
              {USER_ROLES.map((r) => (
                <option key={r} value={r}>
                  {ROLE_LABEL[r]}
                </option>
              ))}
            </Select>
            <Select
              aria-label="Filter by status"
              value={status}
              onChange={(event) => {
                setStatus(event.target.value as UserStatus | "");
                setPage(1);
              }}
            >
              <option value="">All statuses</option>
              {USER_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABEL[s]}
                </option>
              ))}
            </Select>
          </div>
        </div>

        {users.isPending ? (
          <LoadingRows />
        ) : users.isError ? (
          <EmptyState
            icon="alert"
            title="Couldn't load staff"
            action={
              <Button variant="secondary" onClick={() => void users.refetch()}>
                Try again
              </Button>
            }
          >
            {toApiError(users.error).message}
          </EmptyState>
        ) : users.data.items.length === 0 ? (
          filtered ? (
            <EmptyState
              icon="search"
              title="No one matches those filters"
              action={
                <Button variant="secondary" onClick={clearFilters}>
                  Clear filters
                </Button>
              }
            >
              Try a different name, or remove a filter.
            </EmptyState>
          ) : (
            <EmptyState
              icon="users"
              title="No staff yet"
              action={<Button icon="plus" onClick={() => setFormMode({ kind: "create" })}>Add staff member</Button>}
            >
              Add the first person who will use this console.
            </EmptyState>
          )
        ) : (
          <div className={users.isPlaceholderData ? "opacity-60 transition-opacity" : "transition-opacity"}>
            <Table>
              <thead>
                <tr>
                  <Th>Name</Th>
                  <Th className="hidden sm:table-cell">Role</Th>
                  <Th className="hidden sm:table-cell">Status</Th>
                  <Th className="hidden md:table-cell">Last sign-in</Th>
                  <Th className="w-14">
                    <span className="sr-only">Actions</span>
                  </Th>
                </tr>
              </thead>
              <tbody>
                {users.data.items.map((user) => {
                  const isSelf = user.id === me.id;
                  return (
                    <tr key={user.id} className="hover:bg-sunken/60">
                      <Td>
                        <div className="flex items-center gap-3">
                          <Avatar name={user.fullName} seed={user.id} />
                          <div className="min-w-0">
                            <p className="flex items-center gap-2 font-medium">
                              <span className="truncate">{user.fullName}</span>
                              {isSelf ? <Badge tone="neutral">You</Badge> : null}
                            </p>
                            <p className="truncate text-[13px] text-ink-muted">{user.email}</p>
                            {/* Narrow screens drop the Role and Status columns; fold them in here. */}
                            <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] sm:hidden">
                              <Badge tone={user.role === "ADMIN" ? "ink" : "info"}>{ROLE_LABEL[user.role]}</Badge>
                              <StatusDot status={user.status} />
                            </p>
                          </div>
                        </div>
                      </Td>
                      <Td className="hidden sm:table-cell">
                        <Badge tone={user.role === "ADMIN" ? "ink" : "info"}>{ROLE_LABEL[user.role]}</Badge>
                      </Td>
                      <Td className={`hidden sm:table-cell ${STATUS_TONE[user.status] === "neutral" ? "text-ink-muted" : ""}`}>
                        <StatusDot status={user.status} />
                      </Td>
                      <Td className="hidden text-ink-muted md:table-cell">
                        <span title={user.lastLoginAt ? formatDateTime(user.lastLoginAt) : undefined}>
                          {formatRelative(user.lastLoginAt, "Not yet")}
                        </span>
                      </Td>
                      <Td className="text-right">
                        <Menu
                          label={`Actions for ${user.fullName}`}
                          entries={rowMenu(user, isSelf, {
                            edit: () => setFormMode({ kind: "edit", user, isSelf }),
                            act: (kind) => setAction({ kind, user }),
                          })}
                        />
                      </Td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
            <Pagination
              page={users.data.page}
              pageSize={users.data.pageSize}
              total={users.data.total}
              busy={users.isPlaceholderData}
              onPageChange={setPage}
            />
          </div>
        )}
      </section>

      <UserFormDialog mode={formMode} onClose={() => setFormMode(null)} />
      <UserActionDialog action={action} onClose={() => setAction(null)} />
    </div>
  );
}
