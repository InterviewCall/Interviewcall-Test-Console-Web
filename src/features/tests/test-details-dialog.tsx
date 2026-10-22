"use client";

import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Icon } from "@/components/ui/icon";
import type { TestSchedule } from "@/lib/api/types";
import { formatDateTime } from "@/lib/format";
import { formatIstDate, formatIstTime, formatIstWindow } from "./ist";
import { LEVEL_LABEL, STATUS_LABEL, STATUS_TONE } from "./labels";
import { canReschedule, canResend } from "./resend";

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
  onClose,
}: {
  schedule: TestSchedule | null;
  showOwner: boolean;
  resending: boolean;
  onResend: (schedule: TestSchedule) => void;
  onReschedule: (schedule: TestSchedule) => void;
  onClose: () => void;
}) {
  const resend = schedule ? canResend(schedule) : null;
  const reschedule = schedule ? canReschedule(schedule) : null;

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
              {schedule.invitationQueuedAt ? `Queued ${formatDateTime(schedule.invitationQueuedAt)}` : "Not sent"}
            </Row>
          </dl>
        </div>
      ) : null}
    </Dialog>
  );
}
