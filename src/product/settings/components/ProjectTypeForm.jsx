import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { Spinner } from "@/shared/components/ui/spinner";
import ColorSelector from "@/shared/components/ui/ColorSelector";
import {
  Field,
  FieldError,
  FieldLabel,
} from "@/shared/components/ui/field";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { projectTypeSchema } from "../config.js/settingsSchemas";
import { toast } from "sonner";
import { useCreateProjectType, useUpdateProjectType } from "../api/settingsMutations";
import { applyServerFieldErrors } from "@/shared/lib/formErrors";

// Fields this form renders; errors for anything else fall back to a toast.
const FORM_FIELDS = ["project_type", "bg_color", "text_color"];

// Normalize a project type record from the API into the shape the form fields expect.
const toFormValues = (projectType) => ({
  project_type: projectType?.project_type ?? "",
  bg_color: projectType?.bg_color ?? "#E5E7EB",
  text_color: projectType?.text_color ?? "#374151",
});

const ProjectTypeForm = ({ selectedItem = null, onSuccess, onCancel }) => {
  const mode = selectedItem ? "edit" : "create";

  const {
    register,
    watch,
    setValue,
    setError,
    handleSubmit,
    formState: { errors, isDirty, isValid },
  } = useForm({
    resolver: zodResolver(projectTypeSchema),
    defaultValues: toFormValues(selectedItem),
  });

  const { mutate: createMutate, isPending: isCreatePending } =
    useCreateProjectType({
      onSuccess: () => {
        toast.success("Project Type created successfully");
        onSuccess?.();
      },
      onError: (error) =>
        applyServerFieldErrors(error, setError, { fields: FORM_FIELDS }),
    });

  const { mutate: updateMutate, isPending: isUpdatePending } =
    useUpdateProjectType({
      onSuccess: () => {
        toast.success("Project Type updated successfully");
        onSuccess?.();
      },
      onError: (error) =>
        applyServerFieldErrors(error, setError, { fields: FORM_FIELDS }),
    });

  const isPending = isCreatePending || isUpdatePending;

  const onSubmit = (values) => {
    if (mode === "edit") {
      updateMutate({ id: selectedItem.id, data: values });
    } else {
      createMutate(values);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <Field data-invalid={!!errors.priority}>
        <FieldLabel htmlFor="project_type">
          Project Type Name<span className="text-destructive">*</span>
        </FieldLabel>
        <Input
          id="project_type"
          placeholder="Enter project type name"
          aria-invalid={!!errors.project_type}
          {...register("project_type")}
          disabled={isPending}
        />
        {errors.project_type && <FieldError>{errors.project_type.message}</FieldError>}
      </Field>

      <Field data-invalid={!!errors.bg_color}>
        <FieldLabel>Color</FieldLabel>
        <ColorSelector
          disabled={isPending}
          value={{
            bg_color: watch("bg_color"),
            text_color: watch("text_color"),
          }}
          onChange={({ bg_color, text_color }) => {
            setValue("bg_color", bg_color, {
              shouldValidate: true,
              shouldDirty: true,
            });
            setValue("text_color", text_color, {
              shouldValidate: true,
              shouldDirty: true,
            });
          }}
          aria-invalid={!!errors.bg_color}
        />
        {errors.bg_color && <FieldError>{errors.bg_color.message}</FieldError>}
      </Field>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isPending || !isDirty || !isValid}>
          {isPending ? (
            <>
              <Spinner />
              Saving...
            </>
          ) : mode === "edit" ? (
            "Update Project Type"
          ) : (
            "Create Project Type"
          )}
        </Button>
      </div>
    </form>
  );
};

export default ProjectTypeForm;
