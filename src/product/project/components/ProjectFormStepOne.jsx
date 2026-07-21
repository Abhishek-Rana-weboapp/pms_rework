import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { DatePicker } from "@/shared/components/ui/date-picker";
import { Controller, useFormContext, useWatch } from "react-hook-form";
import { Dropzone } from "@/shared/components/ui/dropzone";
import Tiptap from "@/shared/components/tiptap/Tiptap";
import {
  usePriorities,
  useProjectTypes,
} from "@/product/settings/api/settingsQueries";
import { useClients, useEmployees } from "@/product/dashboard/api/queries";
import { createFullName } from "@/shared/lib/helpers";

const ProjectFormStepOne = () => {
  const { data: priorities = [] } = usePriorities();

  const {
    control,
    register,
    formState: { errors },
  } = useFormContext();

  const { data: projectTypeData } = useProjectTypes();
  // These drive selection dropdowns, so pull the full list (one large page)
  // rather than the default first page.
  const { data: employeesData } = useEmployees({ pageSize: 1000 });
  const { data: clientsData } = useClients({ pageSize: 1000 });
  const employees = employeesData?.results ?? [];
  const clients = clientsData?.results ?? [];
  const startDate = useWatch({ control, name: "start_date" });


  return (
    <FieldGroup className="grid sm:grid-cols-2 gap-4">
      <Field className="col-span-2 gap-2" data-invalid={!!errors.project_name}>
        <FieldLabel htmlFor="project_name">
          Project Name<span className="text-destructive">*</span>
        </FieldLabel>
        <Input id="project_name" {...register("project_name")} />
        {errors.project_name && (
          <FieldError>{errors.project_name.message}</FieldError>
        )}
      </Field>

      <Field
        className={"col-span-2 gap-2"}
        data-invalid={!!errors.project_type}
      >
        <FieldLabel htmlFor="project_type">
          Project Type<span className="text-destructive">*</span>
        </FieldLabel>
        <Controller
          name="project_type"
          control={control}
          render={({ field }) => (
            <Select
              value={field.value ? String(field.value) : ""}
              onValueChange={field.onChange}
            >
              <SelectTrigger id="project_type" className="w-full">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent position="popper">
                {projectTypeData?.map((type) => {
                  return (
                    <SelectItem key={type.id} value={String(type.id)}>
                      {type.project_type}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          )}
        />
        {errors.project_type && (
          <FieldError>{errors.project_type.message}</FieldError>
        )}
      </Field>

      <Field className="gap-2" data-invalid={!!errors.start_date}>
        <FieldLabel htmlFor="start_date">Start Date</FieldLabel>
        <Controller
          name="start_date"
          control={control}
          render={({ field }) => (
            <DatePicker
              id="start_date"
              value={field.value ?? undefined}
              onChange={(date) => field.onChange(date ?? null)}
              onBlur={field.onBlur}
              ref={field.ref}
            />
          )}
        />
        {errors.start_date && (
          <FieldError>{errors.start_date.message}</FieldError>
        )}
      </Field>

      <Field data-invalid={!!errors.end_date}>
        <FieldLabel htmlFor="end_date">End Date</FieldLabel>
        <Controller
          name="end_date"
          control={control}
          render={({ field }) => (
            <DatePicker
              id="end_date"
              value={field.value ?? undefined}
              onChange={(date) => field.onChange(date ?? null)}
              onBlur={field.onBlur}
              ref={field.ref}
              calendarProps={
                startDate ? { disabled: { before: startDate } } : undefined
              }
            />
          )}
        />
        {errors.end_date && <FieldError>{errors.end_date.message}</FieldError>}
      </Field>

      <Field className={"gap-2"} data-invalid={!!errors.manager}>
        <FieldLabel htmlFor="manager">Manager</FieldLabel>
        <Controller
          name="manager"
          control={control}
          render={({ field }) => (
            <Select
              value={field.value ? String(field.value) : ""}
              onValueChange={field.onChange}
            >
              <SelectTrigger id="manager" className="w-full">
                <SelectValue placeholder="Select manager" />
              </SelectTrigger>
              <SelectContent position="popper">
                {
                  employees.map((emp)=>{
                    return <SelectItem value={String(emp.id)} key={emp.id}>{createFullName(emp)}</SelectItem>
                  })
                }
              </SelectContent>
            </Select>
          )}
        />
        {errors.manager && <FieldError>{errors.manager.message}</FieldError>}
      </Field>

      <Field className={"gap-2"} data-invalid={!!errors.priority}>
        <FieldLabel htmlFor="priority">
          Priority<span className="text-destructive">*</span>
        </FieldLabel>
        <Controller
          name="priority"
          control={control}
          render={({ field }) => (
            <Select
              value={field.value ? String(field.value) : ""}
              onValueChange={field.onChange}
            >
              <SelectTrigger id="priority" className="w-full">
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent position="popper">
                {priorities?.map((priority) => (
                  <SelectItem key={priority.id} value={String(priority.id)}>
                    {priority.priority}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.priority && <FieldError>{errors.priority.message}</FieldError>}
      </Field>

      <Field className={"col-span-2 gap-2"} data-invalid={!!errors.client}>
        <FieldLabel htmlFor="client">Client</FieldLabel>
        <Controller
          name="client"
          control={control}
          render={({ field }) => (
            <Select
              value={field.value ? String(field.value) : ""}
              onValueChange={field.onChange}
            >
              <SelectTrigger id="client" className="w-full">
                <SelectValue placeholder="Select client" />
              </SelectTrigger>
              <SelectContent position="popper">
                {clients.map((client)=>{
                  return <SelectItem value={String(client.id)} key={client.id}>{createFullName(client)}</SelectItem>
                })}
              </SelectContent>
            </Select>
          )}
        />
        {errors.client && <FieldError>{errors.client.message}</FieldError>}
      </Field>

      <Field
        className={"col-span-2 gap-2"}
        data-invalid={!!errors.description}
      >
        <FieldLabel htmlFor="description">
          Description<span className="text-destructive">*</span>
        </FieldLabel>
        <Controller
          name="description"
          control={control}
          render={({ field }) => (
            <Tiptap
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
            />
          )}
        />
        {errors.description && (
          <FieldError>{errors.description.message}</FieldError>
        )}
      </Field>

      <Field className="col-span-2 gap-2" data-invalid={!!errors.attachments}>
        <FieldLabel htmlFor="attachments">Attachments</FieldLabel>
        <Controller
          name="attachments"
          control={control}
          render={({ field, fieldState }) => (
            <Dropzone
              id="attachments"
              value={field.value ?? []}
              onChange={field.onChange}
              onBlur={field.onBlur}
              ref={field.ref}
              accept="image/*,application/pdf"
              maxSize={5 * 1024 * 1024} // 5MB per file
              maxFiles={5}
              aria-invalid={!!fieldState.error}
            />
          )}
        />
        {errors.attachments && (
          <FieldError>{errors.attachments.message}</FieldError>
        )}
      </Field>
    </FieldGroup>
  );
};

export default ProjectFormStepOne;
