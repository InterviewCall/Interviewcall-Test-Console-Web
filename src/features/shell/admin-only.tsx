"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { EmptyState } from "@/components/ui/empty-state";
import type { UserRole } from "@/lib/api/types";
import { useSessionUser } from "./session";

/**
 * The API enforces this too; this just avoids showing a page that would only error.
 * Admins only, unless the page names more roles.
 */
export function AdminOnly({ children, also = [] }: { children: ReactNode; also?: readonly UserRole[] }) {
  const user = useSessionUser();
  if (user.role === "ADMIN" || also.includes(user.role)) return <>{children}</>;
  const withManagers = also.includes("MANAGER");
  return (
    <div className="rounded-panel border border-line bg-surface shadow-card">
      <EmptyState
        icon="key"
        title={withManagers ? "Admins and managers only" : "Admins only"}
        action={
          <Link href="/account" className="font-medium text-primary underline underline-offset-2">
            Go to your account
          </Link>
        }
      >
        Your role doesn&apos;t include the staff list. Ask an admin if you need something changed.
      </EmptyState>
    </div>
  );
}
