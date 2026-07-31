import { toast } from "sonner";

// True when the error carries a non-empty field-error object, i.e. the backend's
// 400 "Validation Error" shape: { errors: { field: ["msg"], ... } }. This is the
// single source of truth for "is this a field error?" — both the inline mapper
// below and the mutation wrapper's toast decision key off it, so they can't drift.
export const hasFieldErrors = (error) => {
  const fieldErrors = error?.response?.data?.errors;
  return (
    !!fieldErrors &&
    typeof fieldErrors === "object" &&
    Object.keys(fieldErrors).length > 0
  );
};

// Best-effort human-readable message for an error that ISN'T a field error:
// the backend's top-level `message`, else the first entry of a plain `errors`
// array, else the caller's fallback.
export const getErrorMessage = (error, fallback) =>
  error?.response?.data?.message ||
  (Array.isArray(error?.response?.data?.errors) &&
    error.response.data.errors[0]) ||
  fallback;

// Maps a backend validation-error response onto react-hook-form fields.
//
// Backend shape (from the API's 400 "Validation Error"):
//   { errors: { date_of_birth: ["Date has wrong format..."], first_name: "..." } }
//
// - `error`     the caught error (axios error, or anything with response.data).
// - `setError`  react-hook-form's setError.
// - `fields`    the field names this form actually renders. Errors for these are
//               shown inline; any other key (e.g. non_field_errors) falls back to
//               `onUnknown` (defaults to a toast). Omit to set every key inline.
//
// Returns true when at least one field error was found, so callers can decide
// whether a generic fallback message is still needed.
export const applyServerFieldErrors = (
  error,
  setError,
  { fields, onUnknown } = {},
) => {
  if (!hasFieldErrors(error)) return false;
  const fieldErrors = error.response.data.errors;

  const notify = onUnknown ?? ((_field, message) => toast.error(message));

  let firstInline = true;
  Object.entries(fieldErrors).forEach(([field, messages]) => {
    const message = Array.isArray(messages)
      ? messages.join(" ")
      : String(messages);

    const isRendered = !fields || fields.includes(field);
    if (isRendered) {
      setError(field, { type: "server", message }, { shouldFocus: firstInline });
      firstInline = false;
    } else {
      notify(field, message);
    }
  });

  return true;
};
