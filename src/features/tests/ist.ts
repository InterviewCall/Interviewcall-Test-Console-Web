/**
 * Candidates and staff work in Indian Standard Time, whatever the browser's own zone is.
 * IST has no daylight saving, so a fixed +05:30 offset is always right.
 */
export const IST_OFFSET = "+05:30";
const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

const dateFormat = new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", weekday: "short", day: "numeric", month: "short", year: "numeric" });
const timeFormat = new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", hour: "numeric", minute: "2-digit", hour12: true });

export const formatIstDate = (value: Date | string) => dateFormat.format(new Date(value));
export const formatIstTime = (value: Date | string) => timeFormat.format(new Date(value)).replace(/\s?([ap])m$/i, (_, m: string) => ` ${m.toUpperCase()}M`);

/** "Sat, 24 Oct 2026, 11:00 AM – 12:00 PM" */
export function formatIstWindow(startsAt: string, endsAt: string): string {
  const sameDay = formatIstDate(startsAt) === formatIstDate(endsAt);
  return sameDay
    ? `${formatIstDate(startsAt)}, ${formatIstTime(startsAt)} – ${formatIstTime(endsAt)}`
    : `${formatIstDate(startsAt)}, ${formatIstTime(startsAt)} – ${formatIstDate(endsAt)}, ${formatIstTime(endsAt)}`;
}

/** The instant a "2026-10-24" + "11:00" pair denotes in IST. Invalid input gives null. */
export function istToDate(date: string, time: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time)) return null;
  const value = new Date(`${date}T${time}:00${IST_OFFSET}`);
  return Number.isNaN(value.getTime()) ? null : value;
}

/** Today's calendar date in IST, as yyyy-mm-dd. */
export function istToday(now = new Date()): string {
  return new Date(now.getTime() + IST_OFFSET_MS).toISOString().slice(0, 10);
}

/** [start, end) of today in IST, as instants. */
export function istDayBounds(now = new Date()): { start: Date; end: Date } {
  const start = istToDate(istToday(now), "00:00") as Date;
  return { start, end: new Date(start.getTime() + 24 * 60 * 60 * 1000) };
}

/**
 * "11:00" + 60 → "12:00". A slot lives on one calendar day, so a result past midnight
 * stops at 23:59 rather than wrapping. An empty or invalid time gives an empty string.
 */
export function addMinutesToTime(time: string, minutes: number): string {
  const match = /^(\d{2}):(\d{2})$/.exec(time);
  if (!match) return "";
  const total = Math.min(Number(match[1]) * 60 + Number(match[2]) + minutes, 24 * 60 - 1);
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

/** The IST calendar date ("2026-10-24") and clock time ("11:00") of an instant. */
export function istParts(value: Date | string): { date: string; time: string } {
  const shifted = new Date(new Date(value).getTime() + IST_OFFSET_MS).toISOString();
  return { date: shifted.slice(0, 10), time: shifted.slice(11, 16) };
}
