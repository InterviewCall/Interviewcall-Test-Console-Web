import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/cn";
import type { TestSchedule } from "@/lib/api/types";
import { MAIL_STATUS } from "./labels";

const TEXT_TONE = {
  neutral: "text-ink-muted",
  info: "text-primary",
  success: "text-success",
  warning: "text-warning",
  danger: "text-danger",
} as const;

/**
 * One line saying what happened to the invitation email. Shows nothing for tests invited before delivery
 * tracking existed, and nothing while the status is still unknown.
 */
export function MailStatusLine({ schedule, onlyProblems = false }: { schedule: TestSchedule; onlyProblems?: boolean }) {
  if (schedule.invitationQueuedAt === null) {
    return (
      <span className="inline-flex items-center gap-1 text-[13px] text-warning">
        <Icon name="alert" size={14} />
        Email not sent
      </span>
    );
  }
  const mail = schedule.invitationMail;
  if (!mail) return null;
  const info = MAIL_STATUS[mail.status];
  if (onlyProblems && !info.problem) return null;
  return (
    <span className={cn("inline-flex items-center gap-1 text-[13px]", TEXT_TONE[info.tone])} title={mail.detail ?? undefined}>
      <Icon name={info.problem ? "alert" : "check"} size={14} />
      {info.label}
    </span>
  );
}
