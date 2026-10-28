"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Icon } from "@/components/ui/icon";
import type { TestSchedule } from "@/lib/api/types";
import { formatDateTime } from "@/lib/format";
import { formatIstDate, formatIstTime, formatIstWindow } from "./ist";
import { LEVEL_LABEL, MAIL_PROBLEM_ADVICE, MAIL_STATUS, STATUS_LABEL, STATUS_TONE } from "./labels";
import { canGetNewLink, canReschedule, canResend } from "./resend";

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[7.5rem_1fr] gap-3 border-b border-line py-2.5 text-sm last:border-b-0">
      <dt className="text-ink-muted">{label}</dt>
      <dd className="min-w-0 break-words">{children}</dd>
    </div>
  );
}

export function TestDetailsDialog({
  schedule,
  showOwner,
  resending,
  onResend,
  onReschedule,
  onNewLink,
  onClose,
}: {
  schedule: TestSchedule | null;
  showOwner: boolean;
  resending: boolean;
  onResend: (schedule: TestSchedule) => void;
  onReschedule: (schedule: TestSchedule) => void;
  onNewLink: (schedule: TestSchedule) => void;
  onClose: () => void;
}) {
  const resend = schedule ? canResend(schedule) : null;
  const reschedule = schedule ? canReschedule(schedule) : null;
  const newLink = schedule ? canGetNewLink(schedule) : null;

  return (
    <Dialog
      open={schedule !== null}
      onClose={onClose}
      title={schedule?.candidate.fullName ?? "Test details"}
      description={schedule?.candidate.email}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
          {schedule?.status === "SUBMITTED" ? (
            <Link
              href={`/tests/${schedule.id}/report`}
              onClick={onClose}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-control bg-action px-4 text-sm font-medium text-on-action hover:bg-action-hover"
            >
              View report
            </Link>
          ) : null}
          {schedule && reschedule?.ok ? (
            <Button variant="secondary" icon="calendar" onClick={() => onReschedule(schedule)}>
              Reschedule
            </Button>
          ) : null}
          {schedule && resend?.ok ? (
            <Button icon="send" loading={resending} onClick={() => onResend(schedule)}>
              Resend invitation
            </Button>
          ) : null}
        </>
      }
    >
      {schedule ? (
        <div className="flex flex-col gap-4">
          {schedule.invitationQueuedAt === null ? (
            <p className="flex items-start gap-2.5 rounded-control bg-warning-tint px-3.5 py-3 text-[13px] text-warning">
              <Icon name="alert" size={16} className="mt-0.5 shrink-0" />
              <span>The invitation email hasn&apos;t been sent. {resend?.ok ? "Use Resend invitation to try again." : resend?.reason}</span>
            </p>
          ) : null}
          {schedule.invitationMail && MAIL_STATUS[schedule.invitationMail.status].problem ? (
            <p
              className={`flex items-start gap-2.5 rounded-control px-3.5 py-3 text-[13px] ${
                MAIL_STATUS[schedule.invitationMail.status].tone === "danger" ? "bg-danger-tint text-danger" : "bg-warning-tint text-warning"
              }`}
            >
              <Icon name="alert" size={16} className="mt-0.5 shrink-0" />
              <span>
                <strong className="font-medium">{MAIL_STATUS[schedule.invitationMail.status].label}.</strong>{" "}
                {MAIL_PROBLEM_ADVICE[schedule.invitationMail.status]}
                {schedule.invitationMail.detail ? <span className="mt-1 block opacity-80">{schedule.invitationMail.detail}</span> : null}
              </span>
            </p>
          ) : null}
          <dl>
            <Row label="Status">
              <Badge tone={STATUS_TONE[schedule.status]} dot>{STATUS_LABEL[schedule.status]}</Badge>
            </Row>
            <Row label="Level">
              {LEVEL_LABEL[schedule.level]} · {schedule.durationMinutes} minutes
            </Row>
            <Row label="Window">{formatIstWindow(schedule.startsAt, schedule.endsAt)} IST</Row>
            <Row label="Last start">
              {formatIstDate(schedule.latestStartAt)}, {formatIstTime(schedule.latestStartAt)} IST
            </Row>
            <Row label="Phone">{schedule.candidate.phone ?? <span className="text-ink-muted">Not given</span>}</Row>
            {showOwner ? <Row label="Scheduled by">{schedule.invitedBy.fullName}</Row> : null}
            <Row label="Scheduled on">{formatDateTime(schedule.createdAt)}</Row>
            <Row label="Invitation">
              {schedule.invitationQueuedAt === null ? (
                "Not sent"
              ) : schedule.invitationMail ? (
                <>
                  {MAIL_STATUS[schedule.invitationMail.status].label}
                  <span className="block text-[13px] text-ink-muted">{formatDateTime(schedule.invitationMail.updatedAt)}</span>
                </>
              ) : (
                `Queued ${formatDateTime(schedule.invitationQueuedAt)}`
              )}
              {newLink?.ok ? (
                <div className="mt-2">
                  <Button variant="secondary" size="sm" icon="key" onClick={() => onNewLink(schedule)}>
                    Get new link
                  </Button>
                  <span className="mt-1.5 block text-[13px] text-ink-muted">
                    Share it yourself if the email isn&apos;t reaching them. Only the newest link works.
                  </span>
                </div>
              ) : null}
            </Row>
          </dl>
        </div>
      ) : null}
    </Dialog>
  );
}
