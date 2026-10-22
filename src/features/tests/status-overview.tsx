"use client";

import { cn } from "@/lib/cn";
import { TEST_STATUSES } from "@/lib/api/types";
import type { TestStatus } from "@/lib/api/types";
import { useTestSchedules } from "./api";
import { STATUS_LABEL } from "./labels";

const DOT: Record<TestStatus | "ALL", string> = {
  ALL: "bg-ink-faint",
  INVITED: "bg-primary",
  IN_PROGRESS: "bg-warning",
  SUBMITTED: "bg-success",
  EXPIRED: "bg-line-strong",
};

function Tile({ label, status, selected, onSelect }: { label: string; status: TestStatus | "ALL"; selected: boolean; onSelect: () => void }) {
  // One row is enough to read the total, so ask for a page of one.
  const count = useTestSchedules({ page: 1, pageSize: 1, ...(status === "ALL" ? {} : { status }) });

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        "flex flex-col items-start gap-1 px-5 py-4 text-left transition-colors focus-visible:outline-offset-[-3px]",
        selected ? "bg-primary-tint" : "bg-surface hover:bg-sunken",
        status === "ALL" && "col-span-2 md:col-span-1",
      )}
    >
      <span className="flex items-center gap-2 text-[13px] font-medium text-ink-muted">
        <span aria-hidden="true" className={cn("size-2 rounded-full", DOT[status])} />
        {label}
      </span>
      <span className={cn("font-display text-[1.75rem] font-semibold leading-none tracking-tight", selected ? "text-primary" : "text-ink")}>
        {count.data ? count.data.total : <span className="inline-block h-7 w-8 animate-pulse rounded-md bg-line motion-reduce:animate-none" />}
      </span>
    </button>
  );
}

/**
 * Where every test stands, at a glance. Each tile is also a filter: pick one to see just those.
 * It is one strip, not five cards, so it reads as a single summary above the list.
 */
export function StatusOverview({ value, onChange }: { value: TestStatus | ""; onChange: (status: TestStatus | "") => void }) {
  const current: TestStatus | "ALL" = value === "" ? "ALL" : value;
  const tiles: { key: TestStatus | "ALL"; label: string }[] = [
    { key: "ALL", label: "All tests" },
    ...TEST_STATUSES.map((status) => ({ key: status, label: STATUS_LABEL[status] })),
  ];

  return (
    <section
      aria-label="Tests by status"
      className="grid grid-cols-2 gap-px overflow-hidden rounded-panel border border-line bg-line shadow-card md:grid-cols-5"
    >
      {tiles.map((tile) => (
        <Tile
          key={tile.key}
          label={tile.label}
          status={tile.key}
          selected={current === tile.key}
          onSelect={() => onChange(tile.key === "ALL" ? "" : tile.key)}
        />
      ))}
    </section>
  );
}
