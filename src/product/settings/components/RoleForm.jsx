import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { Button } from "@/shared/components/ui/button";
import { Spinner } from "@/shared/components/ui/spinner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { roleSchema } from "../config.js/settingsSchemas";

// Normalize a role record from the API into the shape the form fields expect.
// `shared_data_with_peers` may arrive as a boolean, a "yes"/"no" string, or null.
const toFormValues = (role) => {
  const shared = role?.shared_data_with_peers;
  return {
    role_name: role?.role_name ?? "",
    parent_role: role?.parent_role ?? role?.parent?.id ?? null,
    shared_data_with_peers:
      shared === true || shared === "yes"
        ? "yes"
        : shared === false || shared === "no"
        ? "no"
        : "",
    description: role?.description ?? "",
  };
};

const RoleForm = ({
  mode = "create",
  role = null,
  reportOptions = [],
  onSuccess,
  onError,
  onCancel,
}) => {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isDirty, isValid, isSubmitting },
  } = useForm({
    resolver: zodResolver(roleSchema),
    // In edit mode the dialog remounts this component (keyed on the role id in
    // RolesList), so computing defaults from `role` here is enough to prefill.
    defaultValues: toFormValues(role),
  });

  console.log(errors);
  

  // ───────────────────────────────────────────────────────────────
  // 🔌 Add your create/update role mutation here, then call it inside
  // `onSubmit`. Wire its callbacks to the props below so the dialog
  // closes on BOTH a successful and a failed request, e.g.:
  //
  //   const { mutate, isPending } = useSaveRole({
  //     onSuccess: () => onSuccess?.(),
  //     onError:   () => onError?.(),
  //   });
  //
  // Then swap `isSubmitting` for `isPending` on the submit button.
  // ───────────────────────────────────────────────────────────────

  const onSubmit = (values) => {
    // Create -> POST; edit -> PUT/PATCH with the role id. See the note in
    // RolesList for the recommended single-hook approach.
    // mutate(mode === "edit" ? { id: role.id, data: values } : values);
    void values;
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="mb-4">
        <label className="text-sm font-medium">
          Role Name <span className="text-red-500">*</span>
        </label>
        <Input
          {...register("role_name")}
          placeholder="Enter role name"
          className="mt-1 w-full"
          aria-invalid={!!errors.role_name}
        />
        {errors.role_name && (
          <p className="text-red-500 text-xs mt-1">
            {errors.role_name.message}
          </p>
        )}
      </div>

      <div className="mb-4">
        <label className="text-sm font-medium">
          Reports To <span className="text-red-500">*</span>
        </label>

        <Controller
          name="parent_role"
          control={control}
          render={({ field }) => (
            <Select
              value={field.value != null ? String(field.value) : undefined}
              onValueChange={(val) => field.onChange(Number(val))}
            >
              <SelectTrigger
                className="mt-1 w-full"
                aria-invalid={!!errors.parent_role}
              >
                <SelectValue placeholder="-Select report to-" />
              </SelectTrigger>
              <SelectContent>
                {reportOptions?.map((opt) => (
                  <SelectItem key={opt.value} value={String(opt.value)}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />

        {errors.parent_role && (
          <p className="text-red-500 text-xs mt-1">
            {errors.parent_role.message}
          </p>
        )}
      </div>

      <div className="mb-4">
        <label className="text-sm font-medium">
          Share Data with Peers <span className="text-red-500">*</span>
        </label>

        <div className="flex gap-4 mt-1">
          <label>
            <input
              type="radio"
              value="yes"
              {...register("shared_data_with_peers")}
            />{" "}
            Yes
          </label>
          <label>
            <input
              type="radio"
              value="no"
              {...register("shared_data_with_peers")}
            />{" "}
            No
          </label>
        </div>

        {errors.shared_data_with_peers && (
          <p className="text-red-500 text-xs mt-1">
            {errors.shared_data_with_peers.message}
          </p>
        )}
      </div>

      <div className="mb-4">
        <label className="text-sm font-medium">Description</label>
        <Textarea
          rows={5}
          {...register("description")}
          placeholder="Enter role description"
          className="mt-1 w-full"
          aria-invalid={!!errors.description}
        />
        {errors.description && (
          <p className="text-red-500 text-xs mt-1">
            {errors.description.message}
          </p>
        )}
      </div>

      <div className="flex justify-end gap-2 mt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting || !isDirty || !isValid}>
          {isSubmitting ? (
            <>
              <Spinner />
              Saving...
            </>
          ) : mode === "edit" ? (
            "Update Role"
          ) : (
            "Create Role"
          )}
        </Button>
      </div>
    </form>
  );
};

export default RoleForm;
