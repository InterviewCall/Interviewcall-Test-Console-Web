import { z } from "zod";
import { TEST_LEVELS } from "@/lib/api/types";
import type { TestLevel } from "@/lib/api/types";
import { LEVEL_PREVIEW_MINUTES } from "./labels";
import { istToDate } from "./ist";

/** The API rejects a window longer than this. */
export const MAX_WINDOW_MINUTES = 7 * 24 * 60;
const MINUTE = 60_000;
/** How far behind the clock a start can be and still count as now. Same as the API. */
const START_GRACE_MS = MINUTE;

/** True when nothing could still be booked for this start. */
export function startIsInThePast(startsAt: Date): boolean {
  return startsAt.getTime() < Date.now() - START_GRACE_MS;
}

const email = z.string().trim().toLowerCase().min(1, "Enter the candidate's email").pipe(z.email("Enter a valid email address"));

const phone = z
  .string()
  .trim()
  .refine((value) => value === "" || /^\+?[0-9][0-9\s()-]{5,48}$/.test(value), "Enter a phone number, like +91 98765 43210");

const level = z.string().pipe(z.enum(TEST_LEVELS as [string, ...string[]], { error: "Pick a level" }));

const slotFields = {
  date: z.string().min(1, "Pick a date"),
  startTime: z.string().min(1, "Pick a start time"),
  endTime: z.string().min(1, "Pick an end time"),
};

/** The rules every start window follows, for a test of the given level. Adds issues to the field they belong to. */
function addWindowIssues(value: { level: string; date: string; startTime: string; endTime: string }, ctx: z.RefinementCtx) {
  const startsAt = istToDate(value.date, value.startTime);
  const endsAt = istToDate(value.date, value.endTime);
  if (!startsAt || !endsAt) return; // the required-field messages above already cover this

  // Nothing can be booked for a time that has gone. A minute's grace matches the API, so "now" still works.
  if (startIsInThePast(startsAt)) {
    ctx.addIssue({ code: "custom", path: ["startTime"], message: "That time has already passed. Pick a time from now onwards" });
    return;
  }
  if (endsAt <= startsAt) {
    ctx.addIssue({ code: "custom", path: ["endTime"], message: "The window must close after it opens" });
    return;
  }
  const windowMinutes = (endsAt.getTime() - startsAt.getTime()) / MINUTE;
  if (windowMinutes > MAX_WINDOW_MINUTES) {
    ctx.addIssue({ code: "custom", path: ["endTime"], message: "Keep the window to 7 days or less" });
    return;
  }
  if (!TEST_LEVELS.includes(value.level as TestLevel)) return;

  const minutes = LEVEL_PREVIEW_MINUTES[value.level as TestLevel];
  if (windowMinutes < minutes) {
    ctx.addIssue({ code: "custom", path: ["endTime"], message: `The window must be at least ${minutes} minutes for this level` });
  }
}

export const scheduleTestSchema = z
  .object({
    fullName: z.string().trim().min(2, "Enter the candidate's full name").max(150, "Use 150 characters or fewer"),
    email,
    phone,
    level,
    ...slotFields,
  })
  .superRefine(addWindowIssues);

/** Moving a test changes only the window. The level is already booked, so it is fixed here. */
export function rescheduleTestSchema(level: TestLevel) {
  return z
    .object(slotFields)
    .superRefine((value, ctx) => addWindowIssues({ ...value, level }, ctx));
}
export type RescheduleTestValues = z.infer<ReturnType<typeof rescheduleTestSchema>>;

export type ScheduleTestValues = z.infer<typeof scheduleTestSchema>;

/** The request body the API expects. Times carry the IST offset so the server stores the right instant. */
export function toScheduleBody(values: ScheduleTestValues) {
  const phoneValue = values.phone.trim();
  return {
    candidate: {
      fullName: values.fullName,
      email: values.email,
      ...(phoneValue ? { phone: phoneValue } : {}),
    },
    level: values.level as TestLevel,
    startsAt: (istToDate(values.date, values.startTime) as Date).toISOString(),
    endsAt: (istToDate(values.date, values.endTime) as Date).toISOString(),
  };
}

/** The window as the reschedule request expects it. Times carry the IST offset so the server stores the right instant. */
export function toRescheduleBody(values: RescheduleTestValues) {
  return {
    startsAt: (istToDate(values.date, values.startTime) as Date).toISOString(),
    endsAt: (istToDate(values.date, values.endTime) as Date).toISOString(),
  };
}
