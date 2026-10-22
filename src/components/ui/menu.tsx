"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/cn";
import { Icon } from "./icon";
import type { IconName } from "./icon";

export type MenuEntry =
  | {
      label: string;
      icon?: IconName;
      onSelect: () => void;
      tone?: "danger";
      disabled?: boolean;
      /** Shown under the label; use it to say why an item is disabled. */
      hint?: string;
    }
  | { separator: true };

const GAP = 6;
const EDGE = 8;

/**
 * An actions menu that renders in a portal, so a table's scroll container can't clip it.
 * Arrow keys move, Home/End jump, Escape closes and returns focus to the trigger.
 */
export function Menu({ label, entries }: { label: string; entries: MenuEntry[] }) {
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement | null>(null);
  const id = useId();

  const close = useCallback((returnFocus: boolean) => {
    setOpen(false);
    if (returnFocus) trigger.current?.focus();
  }, []);

  // Runs as the panel mounts, before paint: place it by the trigger, then focus the first item.
  const place = useCallback((node: HTMLDivElement | null) => {
    panel.current = node;
    if (!node || !trigger.current) return;
    const anchor = trigger.current.getBoundingClientRect();
    const box = node.getBoundingClientRect();
    let top = anchor.bottom + GAP;
    if (top + box.height > window.innerHeight - EDGE) top = Math.max(EDGE, anchor.top - box.height - GAP);
    const left = Math.min(Math.max(EDGE, anchor.right - box.width), window.innerWidth - box.width - EDGE);
    node.style.top = `${top}px`;
    node.style.left = `${left}px`;
    node.querySelector<HTMLElement>('[role="menuitem"]:not([disabled])')?.focus();
  }, []);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (panel.current?.contains(target) || trigger.current?.contains(target)) return;
      close(false);
    };
    const onViewportChange = () => close(false);
    document.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("resize", onViewportChange);
    window.addEventListener("scroll", onViewportChange, true);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("resize", onViewportChange);
      window.removeEventListener("scroll", onViewportChange, true);
    };
  }, [open, close]);

  function onKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    const items = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('[role="menuitem"]:not([disabled])'));
    const index = items.indexOf(document.activeElement as HTMLElement);
    const move = (to: number) => {
      event.preventDefault();
      items[(to + items.length) % items.length]?.focus();
    };
    if (event.key === "ArrowDown") move(index + 1);
    else if (event.key === "ArrowUp") move(index - 1);
    else if (event.key === "Home") move(0);
    else if (event.key === "End") move(items.length - 1);
    else if (event.key === "Escape") {
      event.preventDefault();
      close(true);
    } else if (event.key === "Tab") close(false);
  }

  return (
    <>
      <button
        ref={trigger}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? id : undefined}
        aria-label={label}
        title={label}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex size-9 items-center justify-center rounded-control text-ink-muted transition-colors hover:bg-sunken hover:text-ink aria-expanded:bg-sunken aria-expanded:text-ink"
      >
        <Icon name="more" />
      </button>
      {open
        ? createPortal(
            <div
              ref={place}
              id={id}
              role="menu"
              aria-label={label}
              onKeyDown={onKeyDown}
              className="fixed left-0 top-0 z-50 w-60 rounded-panel border border-line bg-surface shadow-card p-1.5 shadow-pop"
            >
              {entries.map((entry, index) =>
                "separator" in entry ? (
                  <div key={`sep-${index}`} role="separator" className="my-1.5 h-px bg-line" />
                ) : (
                  <button
                    key={entry.label}
                    type="button"
                    role="menuitem"
                    disabled={entry.disabled}
                    onClick={() => {
                      close(false);
                      entry.onSelect();
                    }}
                    className={cn(
                      "flex w-full items-start gap-3 rounded-md px-2.5 py-2 text-left text-sm transition-colors focus-visible:outline-offset-0 disabled:cursor-not-allowed disabled:opacity-50",
                      entry.tone === "danger" ? "text-danger hover:bg-danger-tint" : "text-ink hover:bg-sunken",
                    )}
                  >
                    {entry.icon ? <Icon name={entry.icon} size={17} className="mt-0.5 shrink-0" /> : null}
                    <span className="min-w-0">
                      <span className="block font-medium">{entry.label}</span>
                      {entry.hint ? <span className="block text-xs font-normal text-ink-muted">{entry.hint}</span> : null}
                    </span>
                  </button>
                ),
              )}
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
