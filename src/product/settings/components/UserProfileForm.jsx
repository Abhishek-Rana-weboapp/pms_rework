import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";
import { DatePicker } from "@/shared/components/ui/date-picker";
import { Button } from "@/shared/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { PhoneInput } from "react-international-phone";
import "react-international-phone/style.css";
import { format } from "date-fns";
import { useState } from "react";
import { profileSchema } from "../config.js/settingsSchemas";
import { useCurrentUser } from "@/product/auth/api/authQueries";
import { useAuth } from "@/app/providers/AuthContext";
import { useUpdateProfile } from "../api/settingsMutations";
import { Pencil } from "lucide-react";
import { Spinner } from "@/shared/components/ui/spinner";
import { toast } from "sonner";
import { applyServerFieldErrors } from "@/shared/lib/formErrors";
import PermissionGate from "@/product/auth/components/PermissionGate";
import { PERMISSIONS } from "@/product/auth/config/permissions";

// Fields this form renders — a backend error for any of these is shown inline;
// anything else falls back to a toast.
const FORM_FIELDS = ["first_name", "last_name", "contact_number", "date_of_birth"];

const UserProfileForm = () => {
  const { userId } = useAuth();
  const { data: user } = useCurrentUser(userId);
  const [isEditing, setIsEditing] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isDirty },
  } = useForm({
    resolver: zodResolver(profileSchema),
    // `values` (not `defaultValues`) so the form syncs once the async user loads.
    values: {
      first_name: user?.first_name ?? "",
      last_name: user?.last_name ?? "",
      contact_number: user?.contact_number ?? "",
      // DatePicker needs a Date; API stores a "yyyy-MM-dd" string.
      date_of_birth: user?.date_of_birth ? new Date(user.date_of_birth) : null,
    },
  });

  const { mutate, isPending } = useUpdateProfile();

  const onSubmit = (data) => {
    // Nothing actually changed (or changes were reverted) -> no request.
    if (!isDirty) {
      setIsEditing(false);
      return;
    }
    const payload = {
      ...data,
      // Convert Date back to the "yyyy-MM-dd" string the API expects.
      date_of_birth: data.date_of_birth
        ? format(data.date_of_birth, "yyyy-MM-dd")
        : "",
    };
    mutate(
      { data: payload, userId: user?.id },
      {
        onSuccess: () => {
          toast.success("User Profile Updated Successfully")
          setIsEditing(false);
        },
        onError: (error) =>
          applyServerFieldErrors(error, setError, { fields: FORM_FIELDS }),
      },
    );
  };

  const handleCancel = () => {
    reset(); // restore the last-loaded user values
    setIsEditing(false);
  };

  return (
    <form className="p-1" onSubmit={handleSubmit(onSubmit)}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-medium text-lg">Personal Information</h3>

        {isEditing ? (
          <></>
        ) : (
          <PermissionGate permission={PERMISSIONS.USER.CHANGE}>
            <Button type="button" onClick={() => setIsEditing(true)}>
              <Pencil className="size-3" /> Edit
            </Button>
          </PermissionGate>
        )}
      </div>

      <FieldGroup className="grid sm:grid-cols-2 gap-4">
        <Field
          className="sm:col-span-2 gap-2"
          data-invalid={!!errors.first_name}
        >
          <FieldLabel htmlFor="first_name">
            First Name<span className="text-destructive">*</span>
          </FieldLabel>
          <Input
            id="first_name"
            disabled={!isEditing || isPending}
            {...register("first_name")}
          />
          {errors.first_name && (
            <FieldError>{errors.first_name.message}</FieldError>
          )}
        </Field>

        <Field
          className="sm:col-span-2 gap-2"
          data-invalid={!!errors.last_name}
        >
          <FieldLabel htmlFor="last_name">Last Name</FieldLabel>
          <Input
            id="last_name"
            disabled={!isEditing || isPending}
            {...register("last_name")}
          />
          {errors.last_name && (
            <FieldError>{errors.last_name.message}</FieldError>
          )}
        </Field>

        <Field className="gap-2" data-invalid={!!errors.date_of_birth}>
          <FieldLabel htmlFor="date_of_birth">Date of Birth</FieldLabel>
          <Controller
            name="date_of_birth"
            control={control}
            render={({ field }) => (
              <DatePicker
                id="date_of_birth"
                disabled={!isEditing || isPending}
                value={field.value ?? undefined}
                onChange={(date) => field.onChange(date ?? null)}
                onBlur={field.onBlur}
                ref={field.ref}
              />
            )}
          />
          {errors.date_of_birth && (
            <FieldError>{errors.date_of_birth.message}</FieldError>
          )}
        </Field>

        <Field className="gap-2" data-invalid={!!errors.contact_number}>
          <FieldLabel htmlFor="contact_number">Contact Number</FieldLabel>
          <Controller
            control={control}
            name="contact_number"
            render={({ field }) => (
              <div
                data-disabled={!isEditing || isPending}
                className="flex h-9 w-full items-center rounded-md border border-input bg-transparent shadow-xs transition-colors focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50 data-[disabled=true]:opacity-50"
              >
                <PhoneInput
                  defaultCountry="in"
                  disabled={!isEditing || isPending}
                  value={field.value}
                  onChange={field.onChange}
                  className="w-full"
                  inputClassName="!border-none !shadow-none !outline-none !w-full !bg-transparent"
                  inputStyle={{
                    border: "none",
                    outline: "none",
                    background: "transparent",
                    boxShadow: "none",
                    height: "34px",
                  }}
                  countrySelectorStyleProps={{
                    border: "none",
                    outline: "none",
                  }}
                />
              </div>
            )}
          />
          {errors.contact_number && (
            <FieldError>{errors.contact_number.message}</FieldError>
          )}
        </Field>

        {/* Always read-only: shown for context, never editable or submitted */}
        <Field className="gap-2">
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input id="email" value={user?.email ?? ""} disabled readOnly />
        </Field>

        <Field className="gap-2">
          <FieldLabel htmlFor="role">Role</FieldLabel>
          <Input
            id="role"
            value={user?.role_details?.role_name ?? ""}
            disabled
            readOnly
          />
        </Field>
      </FieldGroup>

      {isEditing && (
        <div className="flex gap-2 justify-end mt-6">
          <Button type="button" variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isPending || !isDirty}>
            {isPending ? (
              <>
                <Spinner />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      )}
    </form>
  );
};

export default UserProfileForm;
