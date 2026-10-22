import type { Metadata } from "next";
import { TestsScreen } from "@/features/tests/tests-screen";

// Everything here depends on the signed-in user, which the browser learns from /auth/me.
// There is no server-rendered content to make instant, so Next shouldn't validate it as such.
export const instant = false;

export const metadata: Metadata = { title: "Tests" };

export default function TestsPage() {
  return <TestsScreen />;
}
