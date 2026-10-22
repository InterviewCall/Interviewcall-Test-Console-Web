"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { EmptyState } from "@/components/ui/empty-state";
import { useSessionUser } from "./session";

/** The API enforces this too; this just avoids showing a page that would only error. */
export function AdminOnly({ children }: { children: ReactNode }) {
  const user = useSessionUser();
  if (user.role === "ADMIN") return <>{children}</>;
  return (
    <div className="rounded-panel border border-line bg-surface shadow-card">
      <EmptyState
        icon="key"
        title="Admins only"
        action={
          <Link href="/account" className="font-medium text-primary underline underline-offset-2">
            Go to your account
          </Link>
        }
      >
        Your role doesn&apos;t include managing staff. Ask an admin if you need something changed.
      </EmptyState>
    </div>
  );
}
