import z from "zod";

export const projectSchema = z
  .object({
    project_name: z.string().min(1, "Project name is required"),
    project_type: z.coerce.number().min(1, "Project type is required"),
    priority: z.string().min(1, "Priority is required"),
    description: z
      .string()
      .min(1, "Description is required")
      .max(1500, "Description cannot exceed 1500 characters"),
    start_date: z.date().nullable(),
    end_date: z.date().nullable(),
    manager: z.string().optional(),
    client: z.string().optional(),
    attachments: z.array(z.instanceof(File)).optional(),
    status: z.array(z.string()),
    custom_statuses: z
      .array(
        z.object({
          status_name: z.string().min(1),
          category: z.string().min(1),
        }),
      )
      .optional(),
  })
  .refine(
    (data) => {
      if (!data.start_date || !data.end_date) return true;
      return data.end_date >= data.start_date;
    },
    {
      message: "End date cannot be before start date",
      path: ["end_date"],
    },
  );

export const projectDefaultValues = {
  project_name: "",
  project_type: "",
  priority: "",
  description: "",
  start_date: null,
  end_date: null,
  manager: "",
  client: "",
  attachments: [],
  status: [],
  custom_statuses: [],
};

export const projectFirstStepTriggerArray = [
  "project_name",
  "project_type",
  "client",
  "attachments",
  "description",
  "manager",
  "start_date",
  "end_date",
  "priority"
];
