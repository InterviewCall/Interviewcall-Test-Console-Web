"use client";

import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Icon } from "@/components/ui/icon";
import { FormError } from "@/components/ui/form-error";
import { TextField } from "@/components/ui/fields";
import { useToast } from "@/components/ui/toast";
import { toApiError } from "@/lib/api/errors";
import { TEST_LEVELS } from "@/lib/api/types";
import type { TestLevel } from "@/lib/api/types";
import { cn } from "@/lib/cn";
import { zodResolver } from "@/lib/forms/zod-resolver";
import { useScheduleTest } from "./api";
import { LEVEL_LABEL, LEVEL_PREVIEW_MINUTES } from "./labels";
import { SlotFields, useDefaultEnd } from "./slot-fields";
import { scheduleTestSchema, toScheduleBody } from "./schemas";
import type { ScheduleTestValues } from "./schemas";

const FIELD_BY_PATH: Record<string, keyof ScheduleTestValues> = {
  "candidate.fullName": "fullName",
  "candidate.email": "email",
  "candidate.phone": "phone",
  level: "level",
  startsAt: "startTime",
  endsAt: "endTime",
};

function LevelChoice({ value, selected, ...rest }: { value: TestLevel; selected: boolean } & Omit<React.InputHTMLAttributes<HTMLInputElement>, "value">) {
  return (
    <label
      className={cn(
        "relative flex cursor-pointer flex-col gap-0.5 rounded-control border px-4 py-3 transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-primary",
        selected ? "border-primary bg-primary-tint ring-1 ring-primary" : "border-line-strong bg-surface hover:bg-sunken",
      )}
    >
      <input type="radio" value={value} className="sr-only" {...rest} />
      <span className="flex items-center justify-between gap-2 text-sm font-medium">
        {LEVEL_LABEL[value]}
        {selected ? <Icon name="check" size={16} /> : null}
      </span>
      <span className="text-[13px] text-ink-muted">{LEVEL_PREVIEW_MINUTES[value]} minutes</span>
    </label>
  );
}

function ScheduleForm({ schedule, onDone }: { schedule: ReturnType<typeof useScheduleTest>; onDone: () => void }) {
  const toast = useToast();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    setError,
    setValue,
    formState: { errors, isSubmitted },
  } = useForm<ScheduleTestValues>({
    resolver: zodResolver(scheduleTestSchema),
    defaultValues: { fullName: "", email: "", phone: "", level: "", date: "", startTime: "", endTime: "" },
  });

  const [level, date, startTime, endTime] = useWatch({ control, name: ["level", "date", "startTime", "endTime"] });
  const defaultEnd = useDefaultEnd((time) => setValue("endTime", time, { shouldValidate: isSubmitted }));

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      const { schedule: created, emailQueued } = await schedule.mutateAsync(toScheduleBody(values));
      if (emailQueued) {
        toast({ title: "Test scheduled", description: `Invitation sent to ${created.candidate.email}.` });
      } else {
        toast({
          tone: "error",
          title: "Scheduled, but the email didn't go out",
          description: `Use Resend invitation for ${created.candidate.fullName} once it's fixed.`,
        });
      }
      onDone();
    } catch (caught) {
      const apiError = toApiError(caught);
      if (apiError.status === 409) {
        setError("email", { type: "server", message: "This candidate already has a test scheduled." });
        return;
      }
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

  return (
    <form id="schedule-form" onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
      <FormError message={formError} />

      <div className="flex flex-col gap-4">
        <TextField label="Candidate's full name" autoComplete="off" autoFocus error={errors.fullName?.message} {...register("fullName")} />
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            label="Email"
            type="email"
            autoComplete="off"
            hint="The invitation goes here."
            error={errors.email?.message}
            {...register("email")}
          />
          <TextField
            label="Phone (optional)"
            type="tel"
            autoComplete="off"
            placeholder="+91 98765 43210"
            error={errors.phone?.message}
            {...register("phone")}
          />
        </div>
      </div>

      <fieldset className="flex flex-col gap-1.5">
        <legend className="mb-1.5 text-[13px] font-medium">Level</legend>
        <div className="grid grid-cols-2 gap-3">
          {TEST_LEVELS.map((value) => (
            <LevelChoice key={value} value={value} selected={level === value} {...register("level")} />
          ))}
        </div>
        {errors.level ? (
          <p role="alert" className="flex items-start gap-1.5 text-[13px] text-danger">
            <Icon name="alert" size={15} className="mt-0.5 shrink-0" />
            {errors.level.message}
          </p>
        ) : null}
      </fieldset>

      <SlotFields
        date={register("date")}
        startTime={register("startTime", { onChange: defaultEnd.onStartChange })}
        endTime={register("endTime", { onChange: defaultEnd.onEndChange })}
        errors={{ date: errors.date?.message, startTime: errors.startTime?.message, endTime: errors.endTime?.message }}
        level={level}
        values={{ date, startTime, endTime }}
      />
    </form>
  );
}

export function ScheduleFormDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  // Owned here, not in the form, so the footer button can show the same pending state.
  const schedule = useScheduleTest();
  const pending = schedule.isPending;
  return (
    <Dialog
      open={open}
      onClose={onClose}
      dismissible={!pending}
      size="lg"
      title="Schedule a test"
      description="We'll email the candidate their link and the time they can start."
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={pending}>
            Cancel
          </Button>
          {/* The button sits in the dialog footer, outside the form, so it points at the form by id. */}
          <Button type="submit" form="schedule-form" icon="send" loading={pending}>
            Schedule and send invitation
          </Button>
        </>
      }
    >
      <ScheduleForm schedule={schedule} onDone={onClose} />
    </Dialog>
  );
}
