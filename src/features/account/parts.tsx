import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import type { SessionInfo } from "@/lib/api/types";
import { describeDevice, formatDateTime, formatRelative } from "@/lib/format";

/** The titled card used on the account page and on a staff member's page. */
export function Panel({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <section className="rounded-panel border border-line bg-surface shadow-card">
      <div className="border-b border-line px-6 py-4">
        <h2 className="font-display text-base font-semibold">{title}</h2>
        {description ? <p className="mt-0.5 text-[13px] text-ink-muted">{description}</p> : null}
      </div>
      <div className="px-6 py-5">{children}</div>
    </section>
  );
}

export function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-[13px] text-ink-muted">{label}</dt>
      <dd className="mt-0.5 truncate font-medium">{value}</dd>
    </div>
  );
}

/** One signed-in device. `action` is the button on the right, when the viewer may use one. */
export function SessionRow({ session, action }: { session: SessionInfo; action?: ReactNode }) {
  const device = describeDevice(session.userAgent);
  return (
    <li className="flex items-center gap-4 py-3.5 first:pt-0 last:pb-0">
      <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-control bg-sunken text-ink-muted ring-1 ring-inset ring-line">
        <Icon name={device.mobile ? "phone" : "monitor"} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="flex flex-wrap items-center gap-2 font-medium">
          {device.label}
          {session.current ? <Badge tone="success">This device</Badge> : null}
        </p>
        <p className="truncate text-[13px] text-ink-muted" title={formatDateTime(session.createdAt)}>
          {session.ip ?? "Unknown address"} · active {formatRelative(session.lastSeenAt)}
        </p>
      </div>
      {action}
    </li>
  );
}
