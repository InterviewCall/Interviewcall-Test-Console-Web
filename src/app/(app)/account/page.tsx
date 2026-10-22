import type { Metadata } from "next";
import { AccountScreen } from "@/features/account/account-screen";

// Everything here depends on the signed-in user, which the browser learns from /auth/me.
// There is no server-rendered content to make instant, so Next shouldn't validate it as such.
export const instant = false;

export const metadata: Metadata = { title: "Your account" };

export default function AccountPage() {
  return <AccountScreen />;
}
