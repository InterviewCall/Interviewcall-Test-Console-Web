import type { MailStatus, TestLevel, TestStatus } from "@/lib/api/types";

export const LEVEL_LABEL: Record<TestLevel, string> = {
  INTERMEDIATE: "Intermediate",
  ADVANCED: "Advanced",
};

/**
 * Only used to preview the slot before it is sent. The server fixes the real duration
 * when the test is scheduled and returns it as `durationMinutes`, which is what every
 * list and detail view shows.
 */
export const LEVEL_PREVIEW_MINUTES: Record<TestLevel, number> = {
  INTERMEDIATE: 22,
  ADVANCED: 12,
};

export const STATUS_LABEL: Record<TestStatus, string> = {
  INVITED: "Invited",
  IN_PROGRESS: "In progress",
  SUBMITTED: "Submitted",
  EXPIRED: "Expired",
};

export const STATUS_TONE: Record<TestStatus, "info" | "warning" | "success" | "neutral"> = {
  INVITED: "info",
  IN_PROGRESS: "warning",
  SUBMITTED: "success",
  EXPIRED: "neutral",
};

/**
 * What to show for a test. The worker marks a missed test EXPIRED every minute, so for up to a minute
 * after the last start passes the server still says INVITED. Show it as expired right away.
 */
export function statusBadge(schedule: { status: TestStatus; latestStartAt: string }): { label: string; tone: "info" | "warning" | "success" | "neutral" } {
  if (schedule.status === "INVITED" && new Date(schedule.latestStartAt).getTime() <= Date.now()) {
    return { label: STATUS_LABEL.EXPIRED, tone: STATUS_TONE.EXPIRED };
  }
  return { label: STATUS_LABEL[schedule.status], tone: STATUS_TONE[schedule.status] };
}

type Tone = "info" | "warning" | "success" | "neutral" | "danger";

/**
 * Where the invitation email got to, as SES reported it. `problem` ones need someone to look at them:
 * the candidate may not have their link.
 */
export const MAIL_STATUS: Record<MailStatus, { label: string; tone: Tone; problem: boolean }> = {
  QUEUED: { label: "Email queued", tone: "neutral", problem: false },
  SENT: { label: "Email sent", tone: "neutral", problem: false },
  DELAYED: { label: "Email delayed", tone: "warning", problem: true },
  DELIVERED: { label: "Email delivered", tone: "success", problem: false },
  BOUNCED: { label: "Email bounced", tone: "danger", problem: true },
  COMPLAINED: { label: "Marked as spam", tone: "warning", problem: true },
  REJECTED: { label: "Email rejected", tone: "danger", problem: true },
};

/** What the candidate and staff should do about a problem, shown in the details dialog. */
export const MAIL_PROBLEM_ADVICE: Partial<Record<MailStatus, string>> = {
  BOUNCED: "The candidate hasn't received their link. Check the address with them, or contact them another way.",
  REJECTED: "The email was never sent. Try Resend invitation, or contact the candidate another way.",
  COMPLAINED: "The candidate reported this email as spam. They may still have their link; check with them.",
  DELAYED: "The candidate's mail server is slow to accept it. It will keep trying; if the test is soon, contact them another way.",
};
