import type { Metadata } from "next";
import { AdminOnly } from "@/features/shell/admin-only";
import { UsersScreen } from "@/features/users/users-screen";

// Everything here depends on the signed-in user, which the browser learns from /auth/me.
// There is no server-rendered content to make instant, so Next shouldn't validate it as such.
export const instant = false;

export const metadata: Metadata = { title: "Staff" };

export default function UsersPage() {
  return (
    <AdminOnly also={["MANAGER"]}>
      <UsersScreen />
    </AdminOnly>
  );
}
