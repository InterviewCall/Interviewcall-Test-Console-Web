"use client";

import { Icon } from "@/components/ui/icon";
import { CopyButton } from "@/components/ui/copy-button";

/** Shown once, right after the API returns a temporary password. It is never retrievable again. */
export function TemporaryPasswordPanel({
  name,
  email,
  password,
  intro,
  emailQueued,
}: {
  name: string;
  email: string;
  password: string;
  intro: string;
  /** Whether the API queued an email with these sign-in details. Leave out if unknown. */
  emailQueued?: boolean;
}) {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-ink-muted">{intro}</p>
      <div className="rounded-panel border border-line-strong bg-sunken p-4">
        <p className="text-[13px] text-ink-muted">
          {name} · {email}
        </p>
        <div className="mt-2 flex items-center justify-between gap-3">
          <code
            data-testid="temporary-password"
            className="min-w-0 select-all break-all font-mono text-lg font-semibold tracking-wide"
          >
            {password}
          </code>
          <CopyButton value={password} label="Copy password" />
        </div>
      </div>
      {emailQueued === undefined ? null : emailQueued ? (
        <p className="flex items-start gap-2.5 rounded-control bg-success-tint px-3.5 py-3 text-[13px] text-success">
          <Icon name="check" size={16} className="mt-0.5 shrink-0" />
          <span>We&apos;ve also emailed these sign-in details to {email}.</span>
        </p>
      ) : (
        <p className="flex items-start gap-2.5 rounded-control bg-warning-tint px-3.5 py-3 text-[13px] text-warning">
          <Icon name="alert" size={16} className="mt-0.5 shrink-0" />
          <span>The email with these details couldn&apos;t be sent, so share the password yourself.</span>
        </p>
      )}
      <p className="flex items-start gap-2.5 rounded-control bg-warning-tint px-3.5 py-3 text-[13px] text-warning">
        <Icon name="alert" size={16} className="mt-0.5 shrink-0" />
        <span>Copy it now. It won&apos;t be shown again. They&apos;ll choose their own password at first sign-in.</span>
      </p>
    </div>
  );
}
