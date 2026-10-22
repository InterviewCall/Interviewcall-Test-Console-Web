"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { FormError } from "@/components/ui/form-error";
import { PasswordField, TextField } from "@/components/ui/fields";
import { homeFor } from "@/features/shell/session";
import { ApiError, toApiError } from "@/lib/api/errors";
import { safeNextPath } from "@/lib/format";
import { zodResolver } from "@/lib/forms/zod-resolver";
import { useLogin, useMe } from "./api";
import { loginSchema } from "./schemas";
import type { LoginValues } from "./schemas";

function loginMessage(error: unknown): string {
  const apiError = toApiError(error);
  if (apiError.status === 401) return "That email and password don't match. Check both and try again.";
  return apiError.message;
}

export function LoginScreen() {
  const router = useRouter();
  const next = safeNextPath(useSearchParams().get("next"));
  const me = useMe();
  const login = useLogin();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  // Someone who is already signed in has no reason to see this page.
  useEffect(() => {
    if (!me.data) return;
    router.replace(me.data.status === "UNACTIVATED" ? "/change-password" : (next ?? homeFor(me.data.role)));
  }, [me.data, next, router]);

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      const user = await login.mutateAsync(values);
      router.replace(user.status === "UNACTIVATED" ? "/change-password" : (next ?? homeFor(user.role)));
    } catch (error) {
      setFormError(loginMessage(error));
    }
  });

  const redirecting = Boolean(me.data) || login.isSuccess;

  return (
    <>
      <h1 className="font-display text-3xl font-semibold leading-tight tracking-tight">Sign in to the console</h1>
      <p className="mt-2 text-sm text-ink-muted">Use the email and password your admin gave you.</p>

      <form onSubmit={onSubmit} noValidate className="mt-8 flex flex-col gap-5">
        <FormError message={formError} />
        <TextField
          label="Email"
          type="email"
          autoComplete="username"
          autoFocus
          inputMode="email"
          error={errors.email?.message}
          {...register("email")}
        />
        <PasswordField
          label="Password"
          autoComplete="current-password"
          error={errors.password?.message}
          {...register("password")}
        />
        <Button type="submit" loading={login.isPending || redirecting} className="mt-1 w-full">
          {redirecting ? "Signing you in" : "Sign in"}
        </Button>
      </form>

      <p className="mt-8 text-[13px] text-ink-muted">
        Forgot your password? Ask an admin to reset it. They will give you a temporary one.
      </p>
      {login.error instanceof ApiError && login.error.isNetwork ? null : null}
    </>
  );
}
