import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Button } from "@/shared/components/ui/button";
import { Spinner } from "@/shared/components/ui/spinner";
import { toast } from "sonner";
import { applyServerFieldErrors } from "@/shared/lib/formErrors";
import { useGlobalStatus } from "@/product/settings/api/settingsQueries";
import {
  useCreateProjectStatus,
  useUpdateProjectStatus,
} from "../api/project/projectMutations";
import {
  DEFAULT_STATUS_NAMES,
  projectStatusDefaultValues,
  projectStatusFormToApiPayload,
  projectStatusSchema,
  statusToFormValues,
} from "../config/statusSchema";

const FORM_FIELDS = ["status_name", "category"];

/**
 * Prop-controlled create/edit status dialog for the board.
 * Open/close + mode owned by the parent (Board) — no context needed yet.
 *
 * @param {boolean} open
 * @param {(open: boolean) => void} onOpenChange
 * @param {"add"|"edit"} [mode="add"]
 * @param {{id: string|number, status_name?: string, category?: string}|null} [status]
 */
const StatusFormModal = ({
  open,
  onOpenChange,
  mode = "add",
  status = null,
}) => {
  const isEdit = mode === "edit";
  const close = () => onOpenChange?.(false);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-lg">
            {isEdit ? "Edit Status" : "Create Status"}
          </DialogTitle>
        </DialogHeader>

        {open && (
          <StatusFormBody
            key={isEdit ? `edit-${status?.id}` : "create"}
            mode={mode}
            status={status}
            onClose={close}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

const StatusFormBody = ({ mode, status, onClose }) => {
  const isEdit = mode === "edit";
  const { data: globalStatuses = [] } = useGlobalStatus();

  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors, isValid, isDirty },
  } = useForm({
    resolver: zodResolver(projectStatusSchema),
    defaultValues: isEdit
      ? statusToFormValues(status)
      : projectStatusDefaultValues,
    mode: "onChange",
  });

  const createStatus = useCreateProjectStatus({
    onSuccess: () => {
      toast.success("Status created successfully");
      onClose();
    },
    onError: (error) =>
      applyServerFieldErrors(error, setError, { fields: FORM_FIELDS }),
  });

  const updateStatus = useUpdateProjectStatus({
    onSuccess: () => {
      toast.success("Status updated successfully");
      onClose();
    },
    onError: (error) =>
      applyServerFieldErrors(error, setError, { fields: FORM_FIELDS }),
  });

  const isPending = createStatus.isPending || updateStatus.isPending;

  const categories = globalStatuses
    .filter((stat) => DEFAULT_STATUS_NAMES.includes(stat.status_name))
    .map((cat) => cat.status_name);

  const categoryOptions =
    categories.length > 0 ? categories : DEFAULT_STATUS_NAMES;

  const onSubmit = (values) => {
    const payload = projectStatusFormToApiPayload(values);

    if (isEdit) {
      updateStatus.mutate({ id: status.id, ...payload });
      return;
    }

    createStatus.mutate(payload);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <FieldGroup>
        <FieldSet>
          <Field data-invalid={!!errors.status_name}>
            <FieldLabel htmlFor="status_name">
              Status Name<span className="text-destructive">*</span>
            </FieldLabel>
            <Input
              id="status_name"
              placeholder="e.g. In Review"
              autoComplete="off"
              aria-invalid={!!errors.status_name}
              disabled={isPending}
              {...register("status_name")}
            />
            {errors.status_name && (
              <FieldError>{errors.status_name.message}</FieldError>
            )}
          </Field>

          <Field data-invalid={!!errors.category}>
            <FieldLabel>
              Category<span className="text-destructive">*</span>
            </FieldLabel>
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
                      {categoryOptions.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.category && (
              <FieldError>{errors.category.message}</FieldError>
            )}
          </Field>
        </FieldSet>
      </FieldGroup>

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={isPending}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isPending || !isValid || (isEdit && !isDirty)}
        >
          {isPending ? (
            <>
              <Spinner />
              {isEdit ? "Saving..." : "Creating..."}
            </>
          ) : isEdit ? (
            "Update Status"
          ) : (
            "Create Status"
          )}
        </Button>
      </div>
    </form>
  );
};

export default StatusFormModal;
