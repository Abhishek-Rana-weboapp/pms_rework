import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { Spinner } from "@/shared/components/ui/spinner";
import ColorSelector from "@/shared/components/ui/ColorSelector";
import { Field, FieldError, FieldLabel } from "@/shared/components/ui/field";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { prioritySchema } from "../config.js/settingsSchemas";
import { toast } from "sonner";
import { useCreatePriority, useUpdatePriority } from "../api/settingsMutations";
import { applyServerFieldErrors } from "@/shared/lib/formErrors";

// Fields this form renders; errors for anything else fall back to a toast.
const FORM_FIELDS = ["priority", "bg_color", "text_color"];

// Normalize a priority record from the API into the shape the form fields expect.
const toFormValues = (priority) => ({
  priority: priority?.priority ?? "",
  bg_color: priority?.bg_color ?? "#E5E7EB",
  text_color: priority?.text_color ?? "#374151",
});

const PriorityForm = ({ selectedItem = null, onSuccess, onCancel }) => {
  const mode = selectedItem ? "edit" : "create";

  const {
    register,
    watch,
    setValue,
    setError,
    handleSubmit,
    formState: { errors, isDirty, isValid },
  } = useForm({
    resolver: zodResolver(prioritySchema),
    defaultValues: toFormValues(selectedItem),
  });

  const { mutate: createMutate, isPending: isCreatePending } = useCreatePriority(
    {
      onSuccess: () => {
        toast.success("Priority created successfully");
        onSuccess?.();
      },
      onError: (error) =>
        applyServerFieldErrors(error, setError, { fields: FORM_FIELDS }),
    },
  );

  const { mutate: updateMutate, isPending: isUpdatePending } =
    useUpdatePriority({
      onSuccess: () => {
        toast.success("Priority updated successfully");
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
        <FieldLabel htmlFor="priority">
          Priority Name<span className="text-destructive">*</span>
        </FieldLabel>
        <Input
          id="priority"
          placeholder="Enter priority name"
          aria-invalid={!!errors.priority}
          {...register("priority")}
          disabled={isPending}
        />
        {errors.priority && <FieldError>{errors.priority.message}</FieldError>}
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
            "Update Priority"
          ) : (
            "Create Priority"
          )}
        </Button>
      </div>
    </form>
  );
};

export default PriorityForm;
