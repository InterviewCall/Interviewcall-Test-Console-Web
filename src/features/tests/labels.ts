import type { TestLevel, TestStatus } from "@/lib/api/types";

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
