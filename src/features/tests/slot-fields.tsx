"use client";

import { useState } from "react";
import type { ChangeEvent } from "react";
import type { UseFormRegisterReturn } from "react-hook-form";
import { Icon } from "@/components/ui/icon";
import { TextField } from "@/components/ui/fields";
import type { TestLevel } from "@/lib/api/types";
import { addMinutesToTime, formatIstDate, formatIstTime, istToDate, istToday } from "./ist";
import { LEVEL_PREVIEW_MINUTES } from "./labels";
import { startIsInThePast } from "./schemas";

/** A slot is one hour unless someone says otherwise. */
export const DEFAULT_SLOT_MINUTES = 60;

/**
 * Picking the start fills in the end an hour later, until someone sets the end by hand.
 * `setEnd` is the form's own setter, so this works for any form with a closing time.
 */
export function useDefaultEnd(setEnd: (time: string) => void) {
  const [editedByHand, setEditedByHand] = useState(false);
  return {
    onStartChange: (event: ChangeEvent<HTMLInputElement>) => {
      if (!editedByHand) setEnd(addMinutesToTime(event.target.value, DEFAULT_SLOT_MINUTES));
    },
    onEndChange: () => setEditedByHand(true),
  };
}

/**
 * The one thing worth getting right here is the slot: a candidate may start any time in the
 * window, so the last start is the close time minus the test length. Saying that out loud
 * while staff type the times saves a wrong email going to a candidate.
 */
export function SlotPreview({ level, date, startTime, endTime }: { level: string; date: string; startTime: string; endTime: string }) {
  const startsAt = istToDate(date, startTime);
  const endsAt = istToDate(date, endTime);
  const minutes = LEVEL_PREVIEW_MINUTES[level as TestLevel];

  let message: React.ReactNode = "Choose a level, a date and the times to see exactly when the candidate can start.";
  let timeline: { startMs: number; windowMs: number; latestMs: number } | null = null;

  if (startsAt && startIsInThePast(startsAt)) {
    message = `${formatIstDate(startsAt)}, ${formatIstTime(startsAt)} has already passed. Pick a time from now onwards.`;
  } else if (startsAt && endsAt && minutes && endsAt > startsAt) {
    const latest = new Date(endsAt.getTime() - minutes * 60_000);
    if (latest >= startsAt) {
      timeline = { startMs: startsAt.getTime(), windowMs: endsAt.getTime() - startsAt.getTime(), latestMs: latest.getTime() };
      message = (
        <>
          <span className="font-semibold">
            {formatIstDate(startsAt)}, {formatIstTime(startsAt)} to {formatIstTime(latest)}
          </span>{" "}
          is when they can press start. They always get the full {minutes} minutes, finishing by {formatIstTime(endsAt)}.
        </>
      );
    } else {
      message = `This window is shorter than the ${minutes}-minute test. Make it at least ${minutes} minutes long.`;
    }
  }

  if (!timeline || !startsAt || !endsAt) {
    return (
      <div aria-live="polite" className="flex items-start gap-3 rounded-control border border-dashed border-line-strong bg-sunken px-4 py-3 text-sm text-ink-muted">
        <Icon name="clock" size={18} className="mt-0.5 shrink-0" />
        <p>{message}</p>
      </div>
    );
  }

  // The bar is the whole window. The bright part is when pressing start still leaves time to finish;
  // the dim part at the end is the test running out its full length.
  const startShare = ((timeline.latestMs - timeline.startMs) / timeline.windowMs) * 100;
  const latestAt = new Date(timeline.latestMs);

  return (
    <div aria-live="polite" className="overflow-hidden rounded-control bg-brand p-4 text-sm text-white shadow-card">
      <div className="flex items-start gap-3">
        <Icon name="clock" size={18} className="mt-0.5 shrink-0 text-highlighter" />
        <p className="text-white/90">{message}</p>
      </div>
      <div aria-hidden="true" className="mt-4">
        <div className="flex h-2.5 overflow-hidden rounded-full bg-white/10">
          <div className="h-full bg-highlighter" style={{ width: `${startShare}%` }} />
          <div className="h-full bg-white/30" style={{ width: `${100 - startShare}%` }} />
        </div>
        <div className="relative mt-2 flex justify-between text-xs text-white/75">
          <span>
            Opens
            <b className="block text-[13px] font-semibold text-white">{formatIstTime(startsAt)}</b>
          </span>
          {startShare > 0 && startShare < 100 ? (
            <span className="text-center">
              Last start
              <b className="block text-[13px] font-semibold text-highlighter">{formatIstTime(latestAt)}</b>
            </span>
          ) : null}
          <span className="text-right">
            Closes
            <b className="block text-[13px] font-semibold text-white">{formatIstTime(endsAt)}</b>
          </span>
        </div>
      </div>
    </div>
  );
}


interface SlotFieldsProps {
  date: UseFormRegisterReturn;
  startTime: UseFormRegisterReturn;
  endTime: UseFormRegisterReturn;
  errors: { date?: string; startTime?: string; endTime?: string };
  /** What the slot preview below the fields describes. */
  level: string;
  values: { date: string; startTime: string; endTime: string };
}

/** Date, opens-at and closes-at, in IST, with the live "when can they start" line under them. */
export function SlotFields({ date, startTime, endTime, errors, level, values }: SlotFieldsProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-[1.4fr_1fr_1fr]">
        <div className="col-span-2 sm:col-span-1">
          <TextField label="Date" type="date" min={istToday()} error={errors.date} {...date} />
        </div>
        <TextField label="Opens at" type="time" error={errors.startTime} {...startTime} />
        <TextField label="Closes at" type="time" hint="One hour after it opens" error={errors.endTime} {...endTime} />
      </div>
      <p className="text-[13px] text-ink-muted">All times are Indian Standard Time (IST).</p>
      <SlotPreview level={level} date={values.date} startTime={values.startTime} endTime={values.endTime} />
    </div>
  );
}
