import type { ReactNode } from "react";
import { Icon } from "./icon";
import type { IconName } from "./icon";

export function EmptyState({ icon, title, children, action }: { icon: IconName; title: string; children?: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center px-6 py-14 text-center">
      <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-primary-tint text-primary">
        <Icon name={icon} size={22} />
      </span>
      <h3 className="mt-4 font-display text-base font-semibold">{title}</h3>
      {children ? <p className="mt-1 max-w-sm text-sm text-ink-muted">{children}</p> : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
