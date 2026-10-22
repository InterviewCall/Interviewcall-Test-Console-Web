"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { FormError } from "@/components/ui/form-error";
import { PasswordField } from "@/components/ui/fields";
import type { User } from "@/lib/api/types";
import { zodResolver } from "@/lib/forms/zod-resolver";
import { applyServerErrors } from "@/lib/forms/server-errors";
import { useChangePassword } from "./api";
import { changePasswordSchema } from "./schemas";
import type { ChangePasswordValues } from "./schemas";

export function ChangePasswordForm({
  currentLabel = "Current password",
  submitLabel = "Update password",
  onDone,
}: {
  currentLabel?: string;
  submitLabel?: string;
  onDone: (user: User) => void;
}) {
  const changePassword = useChangePassword();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });

  const onSubmit = handleSubmit(async ({ currentPassword, newPassword }) => {
    setFormError(null);
    try {
      const user = await changePassword.mutateAsync({ currentPassword, newPassword });
      reset();
      onDone(user);
    } catch (error) {
      // The API says "current password is incorrect" with a code we can pin to the field.
      const message = applyServerErrors(error, setError, ["currentPassword", "newPassword"]);
      if (message && (error as { code?: string }).code === "CURRENT_PASSWORD_INCORRECT") {
        setError("currentPassword", { type: "server", message: "That isn't your current password." });
      } else {
        setFormError(message);
      }
    }
  });

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
      <FormError message={formError} />
      <PasswordField
        label={currentLabel}
        autoComplete="current-password"
        error={errors.currentPassword?.message}
        {...register("currentPassword")}
      />
      <PasswordField
        label="New password"
        autoComplete="new-password"
        hint="At least 10 characters. A short phrase only you would know works well."
        error={errors.newPassword?.message}
        {...register("newPassword")}
      />
      <PasswordField
        label="Confirm new password"
        autoComplete="new-password"
        error={errors.confirmPassword?.message}
        {...register("confirmPassword")}
      />
      <Button type="submit" loading={changePassword.isPending} className="mt-1 self-start">
        {submitLabel}
      </Button>
    </form>
  );
}
