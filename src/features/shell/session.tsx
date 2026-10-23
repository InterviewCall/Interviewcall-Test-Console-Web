"use client";

import { createContext, useContext } from "react";
import type { ReactNode } from "react";
import type { User, UserRole } from "@/lib/api/types";

const SessionContext = createContext<User | null>(null);

export function SessionProvider({ user, children }: { user: User; children: ReactNode }) {
  return <SessionContext.Provider value={user}>{children}</SessionContext.Provider>;
}

/** The signed-in user. Only usable below AppGate, which guarantees one exists. */
export function useSessionUser(): User {
  const user = useContext(SessionContext);
  if (!user) throw new Error("useSessionUser must be used inside <AppGate>");
  return user;
}

export interface NavItem {
  href: "/tests" | "/users" | "/account";
  label: string;
  icon: "calendar" | "users" | "account";
  roles?: readonly UserRole[];
}

/** Every page the console has today. New features add themselves here. */
export const NAV_ITEMS: readonly NavItem[] = [
  { href: "/tests", label: "Tests", icon: "calendar", roles: ["ADMIN", "MANAGER", "ADVISOR"] },
  { href: "/users", label: "Staff", icon: "users", roles: ["ADMIN", "MANAGER"] },
  { href: "/account", label: "Your account", icon: "account" },
];

export function navFor(role: UserRole): NavItem[] {
  return NAV_ITEMS.filter((item) => !item.roles || item.roles.includes(role));
}

export function homeFor(role: UserRole): string {
  return navFor(role)[0]?.href ?? "/account";
}
