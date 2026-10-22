import { z } from "zod";
import { USER_ROLES } from "@/lib/api/types";
import { emailField } from "@/features/auth/schemas";

const fullName = z.string().trim().min(2, "Enter the full name").max(150, "Use 150 characters or fewer");

const phone = z
  .string()
  .trim()
  .regex(/^\+?[0-9][0-9\s()-]{5,48}$/, "Enter a phone number, like +91 98765 43210");

// A <select> starts empty, so accept any string and then require a real role.
const role = z.string().pipe(z.enum(USER_ROLES as [string, ...string[]], { error: "Pick a role" }));

export const createUserSchema = z.object({ fullName, email: emailField, phone, role });
export type CreateUserValues = z.infer<typeof createUserSchema>;

export const updateUserSchema = z.object({ fullName, phone, role });
export type UpdateUserValues = z.infer<typeof updateUserSchema>;
