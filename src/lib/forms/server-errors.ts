import type { FieldValues, Path, UseFormSetError } from "react-hook-form";
import { toApiError } from "@/lib/api/errors";

/**
 * Puts the API's per-field validation messages on the matching inputs.
 * Returns a message for the form banner when nothing could be attached to a field.
 */
export function applyServerErrors<T extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<T>,
  fields: readonly Path<T>[],
): string | null {
  const apiError = toApiError(error);
  let attached = 0;

  for (const issue of apiError.fieldIssues) {
    const field = fields.find((name) => name === issue.path);
    if (field) {
      setError(field, { type: "server", message: issue.message });
      attached += 1;
    }
  }

  return attached > 0 ? null : apiError.message;
}
