import { z } from "zod";

// Shared by the schema and the Dropzone props, so the browser-side file picker
// and the validation rule can't drift apart.
export const MAX_DOCUMENT_SIZE = 10 * 1024 * 1024;
export const MAX_DOCUMENT_SIZE_LABEL = `${MAX_DOCUMENT_SIZE / (1024 * 1024)}MB`;

export const ACCEPTED_DOCUMENT_TYPES =
  ".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png";

export const documentSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, "Title is required")
      .max(150, "Title must be at most 150 characters"),
    attachment_link: z
      .url({
        protocol: /^https?$/,
        hostname: z.regexes.domain,
        error: "Enter a valid link starting with http:// or https://",
      })
      .optional()
      .or(z.literal("")),
    // The Dropzone is a File[] even when single-select, so the field mirrors it.
    files: z
      .array(
        z
          .instanceof(File)
          .refine(
            (file) => file.size <= MAX_DOCUMENT_SIZE,
            `Each file must be under ${MAX_DOCUMENT_SIZE_LABEL}`,
          ),
      )
      .max(1, "Upload one document at a time"),
  })
  // A document is either the file itself or a pointer to one, so at least one
  // of the two has to be filled in.
  .refine((values) => values.files.length > 0 || !!values.attachment_link, {
    message: "Upload a file or paste an attachment link",
    path: ["files"],
  });

export const documentDefaultValues = {
  title: "",
  attachment_link: "",
  files: [],
};
