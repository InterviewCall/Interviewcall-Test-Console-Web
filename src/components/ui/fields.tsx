"use client";

import { useId, useState } from "react";
import type { InputHTMLAttributes, ReactNode, Ref, SelectHTMLAttributes } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "./icon";

interface FieldChrome {
  label: string;
  hint?: string;
  error?: string;
}

function FieldShell({
  id,
  label,
  hint,
  error,
  children,
}: FieldChrome & { id: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-[13px] font-medium text-ink">
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} role="alert" className="flex items-start gap-1.5 text-[13px] text-danger">
          <Icon name="alert" size={15} className="mt-0.5 shrink-0" />
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-[13px] text-ink-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

const controlClass =
  "h-10 w-full rounded-control border bg-surface px-3 text-sm text-ink placeholder:text-ink-faint transition-colors focus-visible:border-ink focus-visible:outline-offset-0 disabled:bg-sunken disabled:text-ink-muted";

function describedBy(id: string, error?: string, hint?: string) {
  return error ? `${id}-error` : hint ? `${id}-hint` : undefined;
}

export interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement>, FieldChrome {
  ref?: Ref<HTMLInputElement>;
  trailing?: ReactNode;
}

export function TextField({ label, hint, error, trailing, className, id: idProp, ref, ...rest }: TextFieldProps) {
  const generated = useId();
  const id = idProp ?? generated;
  return (
    <FieldShell id={id} label={label} hint={hint} error={error}>
      <div className="relative">
        <input
          id={id}
          ref={ref}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(id, error, hint)}
          className={cn(controlClass, error ? "border-danger" : "border-line-strong", trailing ? "pr-11" : "", className)}
          {...rest}
        />
        {trailing ? <div className="absolute inset-y-0 right-1 flex items-center">{trailing}</div> : null}
      </div>
    </FieldShell>
  );
}

export function PasswordField(props: Omit<TextFieldProps, "type" | "trailing">) {
  const [visible, setVisible] = useState(false);
  return (
    <TextField
      {...props}
      type={visible ? "text" : "password"}
      trailing={
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          className="inline-flex size-8 items-center justify-center rounded-md text-ink-faint hover:text-ink"
        >
          <Icon name={visible ? "eye-off" : "eye"} size={17} />
        </button>
      }
    />
  );
}

export interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement>, FieldChrome {
  ref?: Ref<HTMLSelectElement>;
}

export function SelectField({ label, hint, error, className, id: idProp, ref, children, ...rest }: SelectFieldProps) {
  const generated = useId();
  const id = idProp ?? generated;
  return (
    <FieldShell id={id} label={label} hint={hint} error={error}>
      <Select
        id={id}
        ref={ref}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, error, hint)}
        className={cn(error ? "border-danger" : "border-line-strong", className)}
        {...rest}
      >
        {children}
      </Select>
    </FieldShell>
  );
}

/** A native select with the chevron drawn by us, for use without a label (filters). */
export function Select({
  className,
  children,
  ref,
  ...rest
}: SelectHTMLAttributes<HTMLSelectElement> & { ref?: Ref<HTMLSelectElement> }) {
  return (
    <div className="relative">
      <select
        ref={ref}
        className={cn(controlClass, "appearance-none pr-9", className ?? "border-line-strong")}
        {...rest}
      >
        {children}
      </select>
      <Icon
        name="chevron-down"
        size={16}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-faint"
      />
    </div>
  );
}
