"use client";

import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { FormError } from "@/components/ui/form-error";
import { useToast } from "@/components/ui/toast";
import { toApiError } from "@/lib/api/errors";
import type { TestSchedule } from "@/lib/api/types";
import { zodResolver } from "@/lib/forms/zod-resolver";
import { useRescheduleTest } from "./api";
import { formatIstWindow, istParts } from "./ist";
import { LEVEL_LABEL, statusBadge } from "./labels";
import { rescheduleTestSchema, toRescheduleBody } from "./schemas";
import type { RescheduleTestValues } from "./schemas";
import { SlotFields, useDefaultEnd } from "./slot-fields";

const FIELD_BY_PATH: Record<string, keyof RescheduleTestValues> = {
  startsAt: "startTime",
  endsAt: "endTime",
};

/** Starts from the current window when it has not opened yet. Once it has, the old start can't be reused, so the fields start blank and the new time is a choice. */
function defaultsFor(schedule: TestSchedule): RescheduleTestValues {
  if (new Date(schedule.startsAt).getTime() <= Date.now()) return { date: "", startTime: "", endTime: "" };
  const start = istParts(schedule.startsAt);
  const end = istParts(schedule.endsAt);
  return { date: start.date, startTime: start.time, endTime: end.date === start.date ? end.time : "" };
}

function RescheduleForm({
  schedule,
  mutation,
  onDone,
}: {
  schedule: TestSchedule;
  mutation: ReturnType<typeof useRescheduleTest>;
  onDone: () => void;
}) {
  const toast = useToast();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    setError,
    setValue,
    formState: { errors, isSubmitted },
  } = useForm<RescheduleTestValues>({
    resolver: zodResolver(rescheduleTestSchema(schedule.level)),
    defaultValues: defaultsFor(schedule),
  });

  const [date, startTime, endTime] = useWatch({ control, name: ["date", "startTime", "endTime"] });
  const defaultEnd = useDefaultEnd((time) => setValue("endTime", time, { shouldValidate: isSubmitted }));

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      const { schedule: moved, emailQueued } = await mutation.mutateAsync({ id: schedule.id, body: toRescheduleBody(values) });
      if (emailQueued) {
        toast({ title: "Test rescheduled", description: `The new time was emailed to ${moved.candidate.email}.` });
      } else {
        toast({
          tone: "error",
          title: "Rescheduled, but the email didn't go out",
          description: `Use Resend invitation for ${moved.candidate.fullName} once it's fixed.`,
        });
      }
      onDone();
    } catch (caught) {
      const apiError = toApiError(caught);
      let attached = 0;
      for (const issue of apiError.fieldIssues) {
        const field = FIELD_BY_PATH[issue.path];
        if (field) {
          setError(field, { type: "server", message: issue.message });
          attached += 1;
        }
      }
      if (attached === 0) setFormError(apiError.message);
    }
  });

  const badge = statusBadge(schedule);

  return (
    <form id="reschedule-form" onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
      <FormError message={formError} />

      <div className="rounded-control border border-line bg-sunken px-4 py-3 text-sm">
        <p className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="font-medium">{LEVEL_LABEL[schedule.level]}</span>
          <span className="text-ink-muted">· {schedule.durationMinutes} minutes</span>
          <Badge tone={badge.tone} dot>{badge.label}</Badge>
        </p>
        <p className="mt-1 text-ink-muted">Now: {formatIstWindow(schedule.startsAt, schedule.endsAt)} IST</p>
      </div>

      <SlotFields
        date={register("date")}
        startTime={register("startTime", { onChange: defaultEnd.onStartChange })}
        endTime={register("endTime", { onChange: defaultEnd.onEndChange })}
        errors={{ date: errors.date?.message, startTime: errors.startTime?.message, endTime: errors.endTime?.message }}
        level={schedule.level}
        values={{ date, startTime, endTime }}
      />
    </form>
  );
}

export function RescheduleDialog({ schedule, onClose }: { schedule: TestSchedule | null; onClose: () => void }) {
  // Owned here, not in the form, so the footer button can show the same pending state.
  const mutation = useRescheduleTest();
  const pending = mutation.isPending;
  return (
    <Dialog
      open={schedule !== null}
      onClose={onClose}
      dismissible={!pending}
      size="lg"
      title={schedule ? `Reschedule ${schedule.candidate.fullName}` : "Reschedule"}
      description="Pick a new time. We'll email the candidate so they know the old one no longer applies."
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={pending}>
            Cancel
          </Button>
          {/* The button sits in the dialog footer, outside the form, so it points at the form by id. */}
          <Button type="submit" form="reschedule-form" icon="send" loading={pending}>
            Reschedule and email candidate
          </Button>
        </>
      }
    >
      {schedule ? <RescheduleForm key={schedule.id} schedule={schedule} mutation={mutation} onDone={onClose} /> : null}
    </Dialog>
  );
}
