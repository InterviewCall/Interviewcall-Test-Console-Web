"use client";

import { Icon } from "@/components/ui/icon";
import { CopyButton } from "@/components/ui/copy-button";

/** Shown once, right after the API returns a temporary password. It is never retrievable again. */
export function TemporaryPasswordPanel({ name, email, password, intro }: { name: string; email: string; password: string; intro: string }) {
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
      <p className="flex items-start gap-2.5 rounded-control bg-warning-tint px-3.5 py-3 text-[13px] text-warning">
        <Icon name="alert" size={16} className="mt-0.5 shrink-0" />
        <span>Copy it now. It won&apos;t be shown again. They&apos;ll choose their own password at first sign-in.</span>
      </p>
    </div>
  );
}
