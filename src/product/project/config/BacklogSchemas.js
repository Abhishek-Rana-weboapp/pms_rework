import z from "zod";

import { toApiDate } from "@/shared/lib/helpers";

export const sprintSchema = z
  .object({
    sprint_name: z.string().min(1, "Sprint name is required"),
    start_date: z
      .date()
      .nullable()
      .refine((v) => v !== null, "Start date is required"),
    end_date: z
      .date()
      .nullable()
      .refine((v) => v !== null, "End date is required"),
    duration: z.string(),
    sprint_goal: z.string().optional().or(z.literal("")),
  })
  .refine((d) => !d.start_date || !d.end_date || d.end_date > d.start_date, {
    message: "End date must be after start date",
    path: ["end_date"],
  });


export const sprintDefaultValues = {
  sprint_name: "",
  start_date: null,
  end_date: null,
  duration: "1",
  sprint_goal: "",
};

export const sprintToFormValues = (sprint = {}) => ({
  sprint_name: sprint.sprint_name ?? "",
  start_date: sprint.start_date ? new Date(sprint.start_date) : null,
  end_date: sprint.end_date ? new Date(sprint.end_date) : null,
  duration: String(sprint.duration ?? 1),
  sprint_goal: sprint.sprint_goal ?? "",
});

export const sprintFormToApiPayload = (data, { id } = {}) => ({
  ...(id != null ? { id } : {}),
  sprint_name: data.sprint_name,
  start_date: toApiDate(data.start_date),
  end_date: toApiDate(data.end_date),
  duration: Number(data.duration),
  sprint_goal: data.sprint_goal ?? "",
});