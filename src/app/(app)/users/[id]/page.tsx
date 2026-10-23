import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdminOnly } from "@/features/shell/admin-only";
import { UserDetailScreen } from "@/features/users/user-detail-screen";

export const instant = false;

export const metadata: Metadata = { title: "Staff member" };

export default async function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const userId = Number(id);
  if (!Number.isInteger(userId) || userId <= 0) notFound();
  // Only admins: the staff list is open to managers, but a person's sign-ins are not.
  return (
    <AdminOnly description="Only admins can open a staff member's details. Ask an admin if you need something checked.">
      <UserDetailScreen id={userId} />
    </AdminOnly>
  );
}
