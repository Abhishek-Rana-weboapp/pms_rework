import z from "zod";

export const DEFAULT_STATUS_NAMES = ["TO DO", "IN PROGRESS", "DONE"];

export const isDefaultStatus = (name) =>
  DEFAULT_STATUS_NAMES.includes((name || "").trim().toUpperCase());

export const projectStatusSchema = z.object({
  status_name: z.string().min(1, "Status name is required"),
  category: z.string().min(1, "Category is required"),
});

export const projectStatusDefaultValues = {
  status_name: "",
  category: "",
};

export const statusToFormValues = (status) => ({
  status_name: status?.status_name ?? "",
  category: status?.category ?? "",
});

export const projectStatusFormToApiPayload = (values) => ({
  status_name: values.status_name.trim(),
  // Form Select stores the category string; legacy UI used { value, label }.
  category: values.category?.value ?? values.category,
});
