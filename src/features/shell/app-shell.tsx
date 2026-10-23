"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import type { ReactNode } from "react";
import { useLogout } from "@/features/auth/api";
import { Avatar } from "@/components/ui/avatar";
import { Icon } from "@/components/ui/icon";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { LogoMark, Wordmark } from "@/components/layout/brand";
import { cn } from "@/lib/cn";
import { navFor, useSessionUser } from "./session";

const ROLE_LABEL = { ADMIN: "Admin", MANAGER: "Manager", ADVISOR: "Advisor", EDITOR: "Editor" } as const;

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const user = useSessionUser();
  const pathname = usePathname();

  return (
    <nav aria-label="Main" className="flex flex-col gap-1.5">
      {navFor(user.role).map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "group flex items-center gap-3 rounded-control px-3 py-2.5 text-sm font-medium transition-colors focus-visible:outline-highlighter",
              active
                ? "bg-highlighter text-on-highlighter shadow-[0_8px_20px_-10px_rgb(0_0_0/0.7)]"
                : "text-rail-ink hover:bg-white/10 hover:text-white",
            )}
          >
            <Icon name={item.icon} className={active ? "text-primary" : undefined} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

function UserChip() {
  const user = useSessionUser();
  const logout = useLogout();

  return (
    <div className="border-t border-white/10 pt-4">
      <div className="flex items-center gap-3 rounded-control bg-white/[0.06] p-2.5">
        <Avatar name={user.fullName} seed={user.id} size={38} tone="cream" />
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-white">{user.fullName}</p>
          <p className="truncate text-xs text-rail-ink">{ROLE_LABEL[user.role]}</p>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between gap-3 px-1">
        <span className="text-xs text-rail-ink">Theme</span>
        <ThemeToggle tone="rail" />
      </div>
      <button
        type="button"
        onClick={() => logout.mutate()}
        disabled={logout.isPending}
        className="mt-2 flex w-full items-center gap-3 rounded-control px-3 py-2.5 text-sm font-medium text-rail-ink transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-highlighter disabled:opacity-60"
      >
        <Icon name="logout" />
        {logout.isPending ? "Signing out…" : "Sign out"}
      </button>
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="min-h-dvh lg:flex">
      {/* Desktop rail */}
      <aside data-print="hide" className="sticky top-0 hidden h-dvh w-72 shrink-0 flex-col justify-between bg-brand p-6 text-white lg:flex">
        <div className="flex flex-col gap-8">
          <Wordmark size={44} />
          <NavLinks />
        </div>
        <UserChip />
      </aside>

      {/* Mobile top bar and drawer */}
      <div data-print="hide" className="sticky top-0 z-30 flex items-center justify-between bg-brand px-4 py-3 text-white shadow-[0_8px_24px_-12px_rgb(0_0_0/0.6)] lg:hidden">
        <span className="flex items-center gap-2.5">
          <LogoMark size={34} />
          <span className="font-display text-base font-semibold tracking-tight">InterviewCall</span>
        </span>
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          aria-label="Open menu"
          aria-expanded={drawerOpen}
          className="inline-flex size-10 items-center justify-center rounded-control hover:bg-rail-line focus-visible:outline-highlighter"
        >
          <Icon name="menu" size={22} />
        </button>
      </div>
      {drawerOpen ? (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <button
            type="button"
            aria-label="Close menu"
            className="absolute inset-0 bg-black/55"
            onClick={() => setDrawerOpen(false)}
            tabIndex={-1}
          />
          <div className="absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col justify-between bg-brand p-5 text-white">
            <div className="flex flex-col gap-8">
              <div className="flex items-start justify-between">
                <Wordmark />
                <button
                  type="button"
                  onClick={() => setDrawerOpen(false)}
                  aria-label="Close menu"
                  className="inline-flex size-9 items-center justify-center rounded-control text-rail-ink hover:bg-white/10 focus-visible:outline-highlighter"
                >
                  <Icon name="x" />
                </button>
              </div>
              <NavLinks onNavigate={() => setDrawerOpen(false)} />
            </div>
            <UserChip />
          </div>
        </div>
      ) : null}

      <main className="min-w-0 flex-1 px-4 py-6 sm:px-8 lg:px-12 lg:py-12">
        <div className="mx-auto w-full max-w-6xl">{children}</div>
      </main>
    </div>
  );
}
