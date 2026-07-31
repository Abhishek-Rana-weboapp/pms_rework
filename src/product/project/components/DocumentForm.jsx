import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/shared/components/ui/button";
import { Dropzone } from "@/shared/components/ui/dropzone";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";
import { Spinner } from "@/shared/components/ui/spinner";
import {
  applyServerFieldErrors,
  getErrorMessage,
} from "@/shared/lib/formErrors";
import { useUpdateArtifact } from "../api/artifact/artifactMutations";
import { useUpdateProject } from "../api/project/projectMutations";
import {
  ACCEPTED_DOCUMENT_TYPES,
  MAX_DOCUMENT_SIZE,
  documentDefaultValues,
  documentSchema,
} from "../config/documentSchema";

// Names this form actually renders: anything else the server complains about
// (e.g. `attachments`) is surfaced as a toast rather than an orphaned inline
// message no one can see.
const FORM_FIELDS = ["title", "attachment_link", "files"];

// Attachments ride along on the parent record's update endpoint as an indexed
// array; one document per submit means index 0. Blank optional values are left
// out so the server doesn't store empty strings.
const buildDocumentFormData = ({ title, attachment_link, files }) => {
  const formData = new FormData();
  formData.append("attachments[0].title", title);
  if (attachment_link) {
    formData.append("attachments[0].attachment_link", attachment_link);
  }
  if (files[0]) formData.append("attachments[0].file", files[0]);
  return formData;
};

/**
 * Adds one document to a project or an artifact. Both live behind their parent
 * record's update endpoint, so `target` chooses the mutation while the payload
 * stays identical.
 */
const DocumentForm = ({ target = "project", targetId, onSuccess, onCancel }) => {
  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(documentSchema),
    defaultValues: documentDefaultValues,
    mode: "onSubmit",
  });

  const mutationOptions = {
    onSuccess: () => {
      toast.success("Document uploaded successfully");
      onSuccess?.();
    },
    onError: (error) => {
      if (!applyServerFieldErrors(error, setError, { fields: FORM_FIELDS })) {
        toast.error(getErrorMessage(error, "Failed to upload document."));
      }
    },
  };

  // Both hooks run unconditionally; only the one matching `target` is fired.
  // Each already invalidates its own caches, so the preview refreshes on its own.
  const projectMutation = useUpdateProject(mutationOptions);
  const artifactMutation = useUpdateArtifact(mutationOptions);

  const isArtifact = target === "artifact";
  const isPending = projectMutation.isPending || artifactMutation.isPending;

  const onSubmit = (values) => {
    const formData = buildDocumentFormData(values);
    if (isArtifact) {
      artifactMutation.mutate({ id: targetId, payload: formData });
    } else {
      projectMutation.mutate({ id: targetId, formData });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      <FieldGroup className="gap-5">
        <Field data-invalid={!!errors.title}>
          <FieldLabel htmlFor="document-title">
            Title<span className="text-destructive">*</span>
          </FieldLabel>
          <Input
            id="document-title"
            placeholder="Enter document title"
            aria-invalid={!!errors.title}
            disabled={isPending}
            {...register("title")}
          />
          {errors.title && <FieldError>{errors.title.message}</FieldError>}
        </Field>

        <Field data-invalid={!!errors.attachment_link}>
          <FieldLabel htmlFor="document-link">Attachment link</FieldLabel>
          <Input
            id="document-link"
            type="url"
            placeholder="https://example.com/document.pdf"
            aria-invalid={!!errors.attachment_link}
            disabled={isPending}
            {...register("attachment_link")}
          />
          <FieldDescription>
            Point at a document hosted elsewhere, or upload the file below.
          </FieldDescription>
          {errors.attachment_link && (
            <FieldError>{errors.attachment_link.message}</FieldError>
          )}
        </Field>

        <Field data-invalid={!!errors.files}>
          <FieldLabel htmlFor="document-file">File</FieldLabel>
          <Controller
            name="files"
            control={control}
            render={({ field, fieldState }) => (
              <Dropzone
                id="document-file"
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                ref={field.ref}
                multiple={false}
                maxFiles={1}
                accept={ACCEPTED_DOCUMENT_TYPES}
                maxSize={MAX_DOCUMENT_SIZE}
                disabled={isPending}
                aria-invalid={!!fieldState.error}
              />
            )}
          />
          {/* The "file or link" rule reports on the array itself, while a
              rejected file reports on files[0] — normalise both to a list. */}
          {errors.files && (
            <FieldError
              errors={
                Array.isArray(errors.files) ? errors.files : [errors.files]
              }
            />
          )}
        </Field>
      </FieldGroup>

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isPending}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? (
            <>
              <Spinner />
              Uploading...
            </>
          ) : (
            "Add"
          )}
        </Button>
      </div>
    </form>
  );
};

export default DocumentForm;
