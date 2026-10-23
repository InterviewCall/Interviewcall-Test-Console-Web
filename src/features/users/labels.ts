import type { UserRole, UserStatus } from "@/lib/api/types";

export const ROLE_LABEL: Record<UserRole, string> = {
  ADMIN: "Admin",
  MANAGER: "Manager",
  ADVISOR: "Advisor",
  EDITOR: "Editor",
};

export const ROLE_HINT: Record<UserRole, string> = {
  ADMIN: "Manages staff and settings",
  MANAGER: "Oversees every advisor's tests",
  ADVISOR: "Works with candidates",
  EDITOR: "Writes and edits test content",
};

export const STATUS_LABEL: Record<UserStatus, string> = {
  ACTIVE: "Active",
  UNACTIVATED: "Invited",
  INACTIVE: "Deactivated",
};

export const STATUS_TONE: Record<UserStatus, "success" | "warning" | "neutral"> = {
  ACTIVE: "success",
  UNACTIVATED: "warning",
  INACTIVE: "neutral",
};
