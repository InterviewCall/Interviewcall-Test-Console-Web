"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { FormError } from "@/components/ui/form-error";
import { SelectField, TextField } from "@/components/ui/fields";
import { useToast } from "@/components/ui/toast";
import type { User, UserWithTemporaryPassword } from "@/lib/api/types";
import { USER_ROLES } from "@/lib/api/types";
import { toApiError } from "@/lib/api/errors";
import { applyServerErrors } from "@/lib/forms/server-errors";
import { zodResolver } from "@/lib/forms/zod-resolver";
import { useCreateUser, useUpdateUser } from "./api";
import { ROLE_HINT, ROLE_LABEL } from "./labels";
import { createUserSchema, updateUserSchema } from "./schemas";
import type { CreateUserValues } from "./schemas";
import { TemporaryPasswordPanel } from "./temporary-password-panel";

// Email is shown but never sent when editing, so it only needs to be a string here.
const editSchema = updateUserSchema.extend({ email: z.string() });

type Mode = { kind: "create" } | { kind: "edit"; user: User; isSelf: boolean };

function UserForm({ mode, onDone, onCreated }: { mode: Mode; onDone: () => void; onCreated: (result: UserWithTemporaryPassword) => void }) {
  const toast = useToast();
  const create = useCreateUser();
  const update = useUpdateUser();
  const editing = mode.kind === "edit";
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<CreateUserValues>({
    resolver: zodResolver(editing ? editSchema : createUserSchema),
    defaultValues: editing
      ? { fullName: mode.user.fullName, email: mode.user.email, phone: mode.user.phone, role: mode.user.role }
      : { fullName: "", email: "", phone: "", role: "" },
  });

  const pending = create.isPending || update.isPending;

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      if (mode.kind === "create") {
        onCreated(await create.mutateAsync({ ...values, role: values.role as (typeof USER_ROLES)[number] }));
      } else {
        await update.mutateAsync({
          id: mode.user.id,
          body: { fullName: values.fullName, phone: values.phone, role: values.role as (typeof USER_ROLES)[number] },
        });
        toast({ title: "Changes saved", description: values.fullName });
        onDone();
      }
    } catch (error) {
      const apiError = toApiError(error);
      if (apiError.status === 409) setError("email", { type: "server", message: "Someone already has this email." });
      else setFormError(applyServerErrors(error, setError, ["fullName", "email", "phone", "role"]));
    }
  });

  const roleLocked = mode.kind === "edit" && mode.isSelf;

  return (
    <form id="user-form" onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      <FormError message={formError} />
      <TextField label="Full name" autoComplete="off" autoFocus error={errors.fullName?.message} {...register("fullName")} />
      <TextField
        label="Email"
        type="email"
        autoComplete="off"
        readOnly={editing}
        className={editing ? "bg-sunken text-ink-muted" : undefined}
        aria-readonly={editing || undefined}
        hint={editing ? "Email can't be changed. Create a new account instead." : "They'll sign in with this."}
        error={errors.email?.message}
        {...register("email")}
      />
      <TextField label="Phone" type="tel" autoComplete="off" placeholder="+91 98765 43210" error={errors.phone?.message} {...register("phone")} />
      <SelectField
        label="Role"
        disabled={roleLocked}
        hint={roleLocked ? "You can't change your own role." : undefined}
        error={errors.role?.message}
        {...register("role")}
      >
        <option value="">Choose a role</option>
        {USER_ROLES.map((role) => (
          <option key={role} value={role}>
            {ROLE_LABEL[role]} — {ROLE_HINT[role]}
          </option>
        ))}
      </SelectField>
      <FormActions pending={pending} editing={editing} onCancel={onDone} />
    </form>
  );
}

function FormActions({ pending, editing, onCancel }: { pending: boolean; editing: boolean; onCancel: () => void }) {
  return (
    <div className="mt-2 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
      <Button variant="secondary" onClick={onCancel} disabled={pending}>
        Cancel
      </Button>
      <Button type="submit" loading={pending}>
        {editing ? "Save changes" : "Create account"}
      </Button>
    </div>
  );
}

export function UserFormDialog({ mode, onClose }: { mode: Mode | null; onClose: () => void }) {
  const [created, setCreated] = useState<UserWithTemporaryPassword | null>(null);

  function close() {
    setCreated(null);
    onClose();
  }

  if (created) {
    return (
      <Dialog
        open
        onClose={close}
        dismissible={false}
        title="Account created"
        description={`${created.user.fullName} can sign in now.`}
        footer={<Button onClick={close}>I&apos;ve copied it</Button>}
      >
        <TemporaryPasswordPanel
          name={created.user.fullName}
          email={created.user.email}
          password={created.temporaryPassword}
          intro="Share this temporary password with them securely."
          emailQueued={created.emailQueued}
        />
      </Dialog>
    );
  }

  return (
    <Dialog
      open={mode !== null}
      onClose={close}
      title={mode?.kind === "edit" ? "Edit staff member" : "Add a staff member"}
      description={mode?.kind === "edit" ? undefined : "We'll generate a temporary password for their first sign-in."}
    >
      {mode ? <UserForm key={mode.kind === "edit" ? mode.user.id : "new"} mode={mode} onDone={close} onCreated={setCreated} /> : null}
    </Dialog>
  );
}
