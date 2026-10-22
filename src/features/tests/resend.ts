import type { TestSchedule } from "@/lib/api/types";

/**
 * Mirrors the API's rule: an invitation can be resent only while the test is still
 * waiting to start and the candidate could still get the full time. The API has the last say.
 */
export function canResend(schedule: TestSchedule): { ok: true } | { ok: false; reason: string } {
  if (schedule.status !== "INVITED") return { ok: false, reason: "They've already started or finished this test." };
  if (new Date(schedule.latestStartAt).getTime() <= Date.now()) return { ok: false, reason: "The start window has passed." };
  return { ok: true };
}

/** Mirrors the API: a test can be moved until the candidate starts it. A missed slot or an expired test can be moved too. */
export function canReschedule(schedule: TestSchedule): { ok: true } | { ok: false; reason: string } {
  if (schedule.status === "IN_PROGRESS" || schedule.status === "SUBMITTED") {
    return { ok: false, reason: "They've already started or finished this test." };
  }
  return { ok: true };
}
