import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { Spinner } from "@/shared/components/ui/spinner";
import { Field, FieldError, FieldLabel } from "@/shared/components/ui/field";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { statusSchema } from "../config.js/settingsSchemas";
import { toast } from "sonner";
import { useCreateStatus, useUpdateStatus } from "../api/settingsMutations";
import { applyServerFieldErrors } from "@/shared/lib/formErrors";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { useGlobalStatus } from "../api/settingsQueries";

// Fields this form renders; errors for anything else fall back to a toast.
const FORM_FIELDS = ["status_name", "category"];
const defaultStatuses = ["TO DO", "DONE", "IN PROGRESS"]

// Normalize a status record from the API into the shape the form fields expect.
const toFormValues = (status) => ({
  status_name: status?.status_name ?? "",
  category: status?.category ?? "",
});

const StatusForm = ({ selectedItem = null, onSuccess, onCancel }) => {
  const { data: statusData = [] } = useGlobalStatus();
  const mode = selectedItem ? "edit" : "create";

  const categories = statusData
    .filter((stat) => defaultStatuses.includes(stat.status_name))
    .map((cat) => cat.status_name);

  const {
    register,
    control,
    setError,
    handleSubmit,
    formState: { errors, isDirty, isValid },
  } = useForm({
    resolver: zodResolver(statusSchema),
    defaultValues: toFormValues(selectedItem),
  });

  const { mutate: createMutate, isPending: isCreatePending } =
    useCreateStatus({
      onSuccess: () => {
        toast.success("Status created successfully");
        onSuccess?.();
      },
      onError: (error) =>
        applyServerFieldErrors(error, setError, { fields: FORM_FIELDS }),
    });

  const { mutate: updateMutate, isPending: isUpdatePending } =
    useUpdateStatus({
      onSuccess: () => {
        toast.success("Status updated successfully");
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
      // New statuses go to the end: order = current count + 1.
      createMutate({ ...values, order: statusData.length + 1 });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <Field data-invalid={!!errors.status_name}>
        <FieldLabel htmlFor="status_name">
          Status Name<span className="text-destructive">*</span>
        </FieldLabel>
        <Input
          id="status_name"
          placeholder="Enter status name"
          aria-invalid={!!errors.status_name}
          {...register("status_name")}
          disabled={isPending}
        />
        {errors.status_name && (
          <FieldError>{errors.status_name.message}</FieldError>
        )}
      </Field>

      <Field data-invalid={!!errors.category}>
        <FieldLabel>Category</FieldLabel>

        <Controller
          control={control}
          name="category"
          render={({ field }) => (
            <Select
              value={field.value || undefined}
              onValueChange={field.onChange}
              disabled={isPending}
            >
              <SelectTrigger
                className="w-full"
                aria-invalid={!!errors.category}
                onBlur={field.onBlur}
              >
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent position="popper">
                <SelectGroup>
                  <SelectLabel>Category</SelectLabel>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          )}
        />
        {errors.category && <FieldError>{errors.category.message}</FieldError>}
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
            "Update Status"
          ) : (
            "Create Status"
          )}
        </Button>
      </div>
    </form>
  );
};

export default StatusForm;
