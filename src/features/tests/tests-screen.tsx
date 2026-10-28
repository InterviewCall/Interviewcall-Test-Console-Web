"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
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
import { useToast } from "@/components/ui/toast";
import { PageHeader } from "@/components/layout/page-header";
import { useSessionUser } from "@/features/shell/session";
import { useDebounced } from "@/features/users/use-debounced";
import { toApiError } from "@/lib/api/errors";
import { TEST_LEVELS, TEST_STATUSES } from "@/lib/api/types";
import type { ListTestSchedulesParams, TestLevel, TestSchedule, TestStatus } from "@/lib/api/types";
import { useResendInvitation, useTestSchedules } from "./api";
import { formatIstDate, formatIstTime, istDayBounds } from "./ist";
import { LEVEL_LABEL, STATUS_LABEL, statusBadge } from "./labels";
import { canGetNewLink, canReschedule, canResend } from "./resend";
import { NewLinkDialog } from "./new-link-dialog";
import { RescheduleDialog } from "./reschedule-dialog";
import { ScheduleFormDialog } from "./schedule-form-dialog";
import { MailStatusLine } from "./mail-status";
import { StatusOverview } from "./status-overview";
import { TestDetailsDialog } from "./test-details-dialog";

const PAGE_SIZE = 20;

type When = "" | "today" | "upcoming" | "earlier";
const WHEN_LABEL: Record<Exclude<When, "">, string> = { today: "Today", upcoming: "Today and later", earlier: "Before today" };

/** Day edges are fixed for the whole IST day, so the query key stays stable between renders. */
function whenParams(when: When): Pick<ListTestSchedulesParams, "startsFrom" | "startsTo"> {
  if (!when) return {};
  const { start, end } = istDayBounds();
  // The API treats both ends as inclusive, so step back a millisecond to keep midnight out of "today".
  const lastMoment = new Date(end.getTime() - 1).toISOString();
  if (when === "today") return { startsFrom: start.toISOString(), startsTo: lastMoment };
  if (when === "upcoming") return { startsFrom: start.toISOString() };
  return { startsTo: new Date(start.getTime() - 1).toISOString() };
}

function LoadingRows() {
  return (
    <div className="flex flex-col gap-4 p-4" role="status" aria-label="Loading tests">
      {Array.from({ length: 6 }, (_, i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton className="size-9 rounded-full" />
          <div className="flex-1">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="mt-1.5 h-3 w-56" />
          </div>
          <Skeleton className="hidden h-5 w-24 sm:block" />
        </div>
      ))}
    </div>
  );
}

function WindowCell({ schedule }: { schedule: TestSchedule }) {
  return (
    <>
      <p className="whitespace-nowrap font-medium">{formatIstDate(schedule.startsAt)}</p>
      <p className="whitespace-nowrap text-[13px] text-ink-muted">
        {formatIstTime(schedule.startsAt)} – {formatIstTime(schedule.endsAt)}
      </p>
    </>
  );
}

export function TestsScreen() {
  const me = useSessionUser();
  if (me.role === "EDITOR") {
    return (
      <div className="rounded-panel border border-line bg-surface shadow-card">
        <EmptyState
          icon="key"
          title="Advisors, managers and admins only"
          action={
            <Link href="/account" className="font-medium text-primary underline underline-offset-2">
              Go to your account
            </Link>
          }
        >
          Scheduling tests isn&apos;t part of the editor role. Ask an admin if you need access.
        </EmptyState>
      </div>
    );
  }
  // Admins and managers work with everyone's tests; advisors only with their own.
  return <TestsList seesAll={me.role === "ADMIN" || me.role === "MANAGER"} />;
}

function TestsList({ seesAll }: { seesAll: boolean }) {
  const toast = useToast();
  const router = useRouter();
  const resend = useResendInvitation();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<TestStatus | "">("");
  const [level, setLevel] = useState<TestLevel | "">("");
  const [when, setWhen] = useState<When>("");
  const [page, setPage] = useState(1);
  const [scheduling, setScheduling] = useState(false);
  const [openId, setOpenId] = useState<number | null>(null);
  const [reschedulingId, setReschedulingId] = useState<number | null>(null);
  const [resendingId, setResendingId] = useState<number | null>(null);
  const [linkForId, setLinkForId] = useState<number | null>(null);

  const q = useDebounced(search.trim());
  const params: ListTestSchedulesParams = {
    page,
    pageSize: PAGE_SIZE,
    ...(q ? { q } : {}),
    ...(status ? { status } : {}),
    ...(level ? { level } : {}),
    ...whenParams(when),
  };
  const tests = useTestSchedules(params);
  const filtered = Boolean(q || status || level || when);
  const opened = tests.data?.items.find((item) => item.id === openId) ?? null;
  const rescheduling = tests.data?.items.find((item) => item.id === reschedulingId) ?? null;
  const linkFor = tests.data?.items.find((item) => item.id === linkForId) ?? null;

  function clearFilters() {
    setSearch("");
    setStatus("");
    setLevel("");
    setWhen("");
    setPage(1);
  }

  async function resendInvitation(schedule: TestSchedule) {
    setResendingId(schedule.id);
    try {
      const result = await resend.mutateAsync(schedule.id);
      if (result.emailQueued) {
        toast({ title: "Invitation sent again", description: schedule.candidate.email });
      } else {
        toast({ tone: "error", title: "Couldn't send the email", description: "The email service isn't reachable right now. Try again in a moment." });
      }
    } catch (caught) {
      toast({ tone: "error", title: "Couldn't resend the invitation", description: toApiError(caught).message });
    } finally {
      setResendingId(null);
    }
  }

  function rowMenu(schedule: TestSchedule): MenuEntry[] {
    const allowed = canResend(schedule);
    const movable = canReschedule(schedule);
    const linkable = canGetNewLink(schedule);
    return [
      { label: "View details", icon: "info", onSelect: () => setOpenId(schedule.id) },
      {
        label: "View report",
        icon: "report",
        onSelect: () => router.push(`/tests/${schedule.id}/report`),
        disabled: schedule.status !== "SUBMITTED",
        hint: schedule.status === "SUBMITTED" ? undefined : "Available once the candidate has submitted.",
      },
      {
        label: "Reschedule",
        icon: "calendar",
        onSelect: () => setReschedulingId(schedule.id),
        disabled: !movable.ok,
        hint: movable.ok ? undefined : movable.reason,
      },
      {
        label: "Resend invitation",
        icon: "send",
        onSelect: () => void resendInvitation(schedule),
        disabled: !allowed.ok,
        hint: allowed.ok ? undefined : allowed.reason,
      },
      {
        label: "Get new link",
        icon: "key",
        onSelect: () => setLinkForId(schedule.id),
        disabled: !linkable.ok,
        hint: linkable.ok ? undefined : linkable.reason,
      },
    ];
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Tests"
        description={seesAll ? "Every test scheduled for a candidate." : "The tests you've scheduled for candidates."}
        actions={
          <Button icon="plus" onClick={() => setScheduling(true)}>
            Schedule a test
          </Button>
        }
      />

      <StatusOverview
        value={status}
        onChange={(next) => {
          setStatus(next);
          setPage(1);
        }}
      />

      <section className="rounded-panel border border-line bg-surface shadow-card">
        <div className="flex flex-col gap-3 rounded-t-panel border-b border-line bg-sunken p-4 lg:flex-row lg:items-center">
          <div className="relative lg:max-w-xs lg:flex-1">
            <Icon name="search" size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" />
            <input
              type="search"
              aria-label="Search tests"
              placeholder="Search name, email or phone"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              className="h-10 w-full rounded-control border border-line-strong bg-surface pl-9 pr-3 text-sm placeholder:text-ink-faint focus-visible:border-ink focus-visible:outline-offset-0"
            />
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:ml-auto lg:flex">
            <Select
              aria-label="Filter by date"
              value={when}
              onChange={(event) => {
                setWhen(event.target.value as When);
                setPage(1);
              }}
            >
              <option value="">Any date</option>
              {(Object.keys(WHEN_LABEL) as Exclude<When, "">[]).map((key) => (
                <option key={key} value={key}>
                  {WHEN_LABEL[key]}
                </option>
              ))}
            </Select>
            <Select
              aria-label="Filter by level"
              value={level}
              onChange={(event) => {
                setLevel(event.target.value as TestLevel | "");
                setPage(1);
              }}
            >
              <option value="">All levels</option>
              {TEST_LEVELS.map((value) => (
                <option key={value} value={value}>
                  {LEVEL_LABEL[value]}
                </option>
              ))}
            </Select>
            <Select
              aria-label="Filter by status"
              className="col-span-2 sm:col-span-1"
              value={status}
              onChange={(event) => {
                setStatus(event.target.value as TestStatus | "");
                setPage(1);
              }}
            >
              <option value="">All statuses</option>
              {TEST_STATUSES.map((value) => (
                <option key={value} value={value}>
                  {STATUS_LABEL[value]}
                </option>
              ))}
            </Select>
          </div>
        </div>

        {tests.isPending ? (
          <LoadingRows />
        ) : tests.isError ? (
          <EmptyState
            icon="alert"
            title="Couldn't load tests"
            action={
              <Button variant="secondary" onClick={() => void tests.refetch()}>
                Try again
              </Button>
            }
          >
            {toApiError(tests.error).message}
          </EmptyState>
        ) : tests.data.items.length === 0 ? (
          filtered ? (
            <EmptyState
              icon="search"
              title="No tests match those filters"
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
              icon="calendar"
              title="No tests scheduled yet"
              action={
                <Button icon="plus" onClick={() => setScheduling(true)}>
                  Schedule a test
                </Button>
              }
            >
              Schedule the first one and the candidate gets an email with their time.
            </EmptyState>
          )
        ) : (
          <div className={tests.isPlaceholderData ? "opacity-60 transition-opacity" : "transition-opacity"}>
            <Table>
              <thead>
                <tr>
                  <Th>Candidate</Th>
                  <Th className="hidden sm:table-cell">When (IST)</Th>
                  <Th className="hidden md:table-cell">Level</Th>
                  <Th className="hidden sm:table-cell">Status</Th>
                  {seesAll ? <Th className="hidden lg:table-cell">Scheduled by</Th> : null}
                  <Th className="w-14">
                    <span className="sr-only">Actions</span>
                  </Th>
                </tr>
              </thead>
              <tbody>
                {tests.data.items.map((schedule) => {
                  const badge = statusBadge(schedule);
                  return (
                    <tr key={schedule.id} className="hover:bg-sunken/60">
                      <Td>
                        <button
                          type="button"
                          onClick={() => setOpenId(schedule.id)}
                          className="flex w-full items-center gap-3 rounded-control text-left focus-visible:outline-offset-4"
                        >
                          <Avatar name={schedule.candidate.fullName} seed={schedule.candidate.id} />
                          <span className="min-w-0">
                            <span className="block truncate font-medium">{schedule.candidate.fullName}</span>
                            <span className="block truncate text-[13px] text-ink-muted">{schedule.candidate.email}</span>
                            {/* Narrow screens drop the other columns; fold the essentials in here. */}
                            <span className="mt-1 block text-[13px] sm:hidden">
                              <WindowCell schedule={schedule} />
                              <span className="mt-1 flex flex-wrap items-center gap-2">
                                <Badge tone={badge.tone} dot>
                            {badge.label}
                          </Badge>
                                <span className="text-ink-muted">
                                  {LEVEL_LABEL[schedule.level]} · {schedule.durationMinutes} min
                                </span>
                              </span>
                              <span className="mt-1 block">
                                <MailStatusLine schedule={schedule} onlyProblems />
                              </span>
                            </span>
                          </span>
                        </button>
                      </Td>
                      <Td className="hidden sm:table-cell">
                        <WindowCell schedule={schedule} />
                      </Td>
                      <Td className="hidden md:table-cell">
                        <p className="font-medium">{LEVEL_LABEL[schedule.level]}</p>
                        <p className="text-[13px] text-ink-muted">{schedule.durationMinutes} minutes</p>
                      </Td>
                      <Td className="hidden sm:table-cell">
                        <div className="flex flex-col items-start gap-1">
                          <Badge tone={badge.tone} dot>
                            {badge.label}
                          </Badge>
                          <MailStatusLine schedule={schedule} />
                        </div>
                      </Td>
                      {seesAll ? <Td className="hidden text-ink-muted lg:table-cell">{schedule.invitedBy.fullName}</Td> : null}
                      <Td className="text-right">
                        <Menu label={`Actions for ${schedule.candidate.fullName}`} entries={rowMenu(schedule)} />
                      </Td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
            <Pagination
              page={tests.data.page}
              pageSize={tests.data.pageSize}
              total={tests.data.total}
              busy={tests.isPlaceholderData}
              onPageChange={setPage}
            />
          </div>
        )}
      </section>

      <ScheduleFormDialog open={scheduling} onClose={() => setScheduling(false)} />
      <RescheduleDialog schedule={rescheduling} onClose={() => setReschedulingId(null)} />
      <NewLinkDialog schedule={linkFor} onClose={() => setLinkForId(null)} />
      <TestDetailsDialog
        schedule={opened}
        showOwner={seesAll}
        resending={resendingId === opened?.id}
        onResend={(schedule) => void resendInvitation(schedule)}
        onReschedule={(schedule) => {
          setOpenId(null);
          setReschedulingId(schedule.id);
        }}
        onNewLink={(schedule) => {
          setOpenId(null);
          setLinkForId(schedule.id);
        }}
        onClose={() => setOpenId(null)}
      />
    </div>
  );
}
