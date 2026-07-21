import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Upload } from "lucide-react";
import { PhoneInput } from "react-international-phone";
import "react-international-phone/style.css";
import { toast } from "sonner";

import Wrapper from "@/shared/components/wrappers/Wrapper";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { Spinner } from "@/shared/components/ui/spinner";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/shared/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";

import { capitalizeFirst } from "@/shared/lib/helpers";
import { applyServerFieldErrors } from "@/shared/lib/formErrors";
import {
  inviteUserSchema,
  inviteUserDefaults,
} from "../config.js/settingsSchemas";
import { useUser, useProfiles } from "../api/settingsQueries";
import { useRolesTree } from "../api/rolesQueries";
import { useInviteUser, useUpdateUser } from "../api/settingsMutations";

const GENDERS = ["Male", "Female"];
const USER_TYPES = ["Employee", "Client"];

// CEO role and Administrator profile are assigned automatically and can't be
// picked/reassigned from this form, so they're hidden from the option lists.
const HIDDEN_ROLE = "ceo";
const HIDDEN_PROFILE = "administrator";

// Field names this form renders. A backend validation error for any of them is
// shown inline; anything else (e.g. non_field_errors) falls back to a toast.
const FORM_FIELDS = [
  "first_name",
  "last_name",
  "gender",
  "role",
  "profile",
  "user_type",
  "email",
  "contact_number",
  "current_address",
  "branch",
];

// The roles endpoint returns a nested tree; the Role <Select> needs a flat list.
const flattenRoles = (nodes = [], acc = []) => {
  nodes.forEach((node) => {
    acc.push({ id: node.id, role_name: node.role_name });
    if (node.children?.length) flattenRoles(node.children, acc);
  });
  return acc;
};

// Map a loaded user record onto the form's shape. Ids arrive as `*_details.*_id`
// and are stored as strings because that's what the <Select> options use.
const userToFormValues = (user) => {
  const roleId = user.role_details?.role_id ?? user.role;
  const profileId = user.profile_details?.profile_id ?? user.profile;
  return {
    first_name: user.first_name || "",
    last_name: user.last_name || "",
    gender: user.gender || "",
    role: roleId != null ? String(roleId) : "",
    profile: profileId != null ? String(profileId) : "",
    user_type: user.user_type || "",
    email: user.email || "",
    contact_number: user.contact_number || "",
    current_address: user.current_address || "",
    branch: user.branch != null ? String(user.branch) : "",
    is_add_to_branch: !!user.branch,
  };
};

/**
 * The actual form. Rendered only once every data dependency is loaded, so
 * `defaultValues` already holds the resolved role/profile ids — that's what lets
 * the Selects show the right option on first paint (no reset/effect race).
 */
const UserFormFields = ({
  isEdit,
  userId,
  roles,
  profiles,
  defaultValues,
  initialImage,
}) => {
  const navigate = useNavigate();

  const [file, setFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(initialImage);

  const inviteMutation = useInviteUser();
  const updateMutation = useUpdateUser();
  const isPending = inviteMutation.isPending || updateMutation.isPending;

  const {
    register,
    handleSubmit,
    control,
    setValue,
    setError,
    watch,
    formState: { errors, isDirty },
  } = useForm({
    resolver: zodResolver(inviteUserSchema),
    defaultValues,
  });

  // Show a local preview for a newly-picked file and revoke its object URL.
  useEffect(() => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreviewImage(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  // The current role/profile may be CEO/Administrator (hidden from the choices).
  // When so, keep that option visible but lock the field so it can't be changed.
  const roleValue = watch("role");
  const profileValue = watch("profile");
  const isHiddenRole =
    roles
      .find((r) => String(r.id) === String(roleValue))
      ?.role_name?.toLowerCase() === HIDDEN_ROLE;
  const isHiddenProfile =
    profiles
      .find((p) => String(p.id) === String(profileValue))
      ?.profile_name?.toLowerCase() === HIDDEN_PROFILE;

  const roleOptions = roles.filter(
    (r) =>
      r.role_name?.toLowerCase() !== HIDDEN_ROLE ||
      String(r.id) === String(roleValue),
  );
  const profileOptions = profiles.filter(
    (p) =>
      p.profile_name?.toLowerCase() !== HIDDEN_PROFILE ||
      String(p.id) === String(profileValue),
  );

  const onSubmit = (data) => {
    if (isEdit && !isDirty && !file) {
      toast.info("No changes made.");
      return;
    }

    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, value ?? "");
    });
    if (file) {
      formData.append("user_image", file);
    } else if (!previewImage) {
      // Image cleared and no new one chosen -> tell the server to clear it.
      formData.append("user_image", "");
    }

    const onError = (error) =>
      applyServerFieldErrors(error, setError, { fields: FORM_FIELDS });

    if (isEdit) {
      updateMutation.mutate(
        { id: userId, formData },
        {
          onSuccess: () => {
            toast.success("User updated successfully.");
            navigate(-1);
          },
          onError,
        },
      );
    } else {
      inviteMutation.mutate(formData, {
        onSuccess: () => {
          toast.success("User invited successfully.");
          navigate(-1);
        },
        onError,
      });
    }
  };

  return (
    <Wrapper className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-3 rounded-md border border-gray-200 bg-white p-4 shadow">
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft />
        </Button>
        <div>
          <h1 className="text-lg font-semibold">
            {isEdit ? "Update User" : "Invite New User"}
          </h1>
          <p className="text-sm text-gray-500">
            {isEdit
              ? "Fill in the details to update the user."
              : "Fill in the details to invite a new user."}
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="rounded-md bg-white shadow"
      >
        <fieldset
          disabled={isPending}
          className="space-y-6 p-4 disabled:opacity-60"
        >
          <h2 className="text-base font-semibold">Personal Information</h2>

          <FieldGroup className="grid gap-4 md:grid-cols-2">
            {/* First Name */}
            <Field data-invalid={!!errors.first_name}>
              <FieldLabel htmlFor="first_name">
                First Name <span className="text-destructive">*</span>
              </FieldLabel>
              <Input
                id="first_name"
                placeholder="Enter first name"
                aria-invalid={!!errors.first_name}
                {...register("first_name")}
                onChange={(e) =>
                  setValue("first_name", capitalizeFirst(e.target.value), {
                    shouldDirty: true,
                    shouldValidate: !!errors.first_name,
                  })
                }
              />
              {errors.first_name && (
                <FieldError>{errors.first_name.message}</FieldError>
              )}
            </Field>

            {/* Last Name */}
            <Field data-invalid={!!errors.last_name}>
              <FieldLabel htmlFor="last_name">
                Last Name <span className="text-destructive">*</span>
              </FieldLabel>
              <Input
                id="last_name"
                placeholder="Enter last name"
                aria-invalid={!!errors.last_name}
                {...register("last_name")}
                onChange={(e) =>
                  setValue("last_name", capitalizeFirst(e.target.value), {
                    shouldDirty: true,
                    shouldValidate: !!errors.last_name,
                  })
                }
              />
              {errors.last_name && (
                <FieldError>{errors.last_name.message}</FieldError>
              )}
            </Field>

            {/* Gender */}
            <Field data-invalid={!!errors.gender}>
              <FieldLabel htmlFor="gender">Gender</FieldLabel>
              <Controller
                control={control}
                name="gender"
                render={({ field }) => (
                  <Select
                    value={field.value || undefined}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger id="gender" className="w-full">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent position="popper">
                      {GENDERS.map((g) => (
                        <SelectItem key={g} value={g}>
                          {g}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.gender && <FieldError>{errors.gender.message}</FieldError>}
            </Field>

            {/* Role */}
            <Field data-invalid={!!errors.role}>
              <FieldLabel htmlFor="role">
                Role <span className="text-destructive">*</span>
              </FieldLabel>
              <Controller
                control={control}
                name="role"
                render={({ field }) => (
                  <Select
                    value={field.value ? String(field.value) : undefined}
                    onValueChange={field.onChange}
                    disabled={isHiddenRole}
                  >
                    <SelectTrigger
                      id="role"
                      className="w-full"
                      aria-invalid={!!errors.role}
                    >
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent position="popper">
                      {roleOptions.map((r) => (
                        <SelectItem key={r.id} value={String(r.id)}>
                          {r.role_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {isHiddenRole && (
                <p className="text-xs text-muted-foreground">
                  This role is assigned automatically and can't be changed.
                </p>
              )}
              {errors.role && <FieldError>{errors.role.message}</FieldError>}
            </Field>

            {/* User Type */}
            <Field data-invalid={!!errors.user_type}>
              <FieldLabel htmlFor="user_type">
                User Type <span className="text-destructive">*</span>
              </FieldLabel>
              <Controller
                control={control}
                name="user_type"
                render={({ field }) => (
                  <Select
                    value={field.value || undefined}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger
                      id="user_type"
                      className="w-full"
                      aria-invalid={!!errors.user_type}
                    >
                      <SelectValue placeholder="Select user type" />
                    </SelectTrigger>
                    <SelectContent position="popper">
                      {USER_TYPES.map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.user_type && (
                <FieldError>{errors.user_type.message}</FieldError>
              )}
            </Field>

            {/* Profile */}
            <Field data-invalid={!!errors.profile}>
              <FieldLabel htmlFor="profile">
                Profile <span className="text-destructive">*</span>
              </FieldLabel>
              <Controller
                control={control}
                name="profile"
                render={({ field }) => (
                  <Select
                    value={field.value ? String(field.value) : undefined}
                    onValueChange={field.onChange}
                    disabled={isHiddenProfile}
                  >
                    <SelectTrigger
                      id="profile"
                      className="w-full capitalize"
                      aria-invalid={!!errors.profile}
                    >
                      <SelectValue placeholder="Select profile" />
                    </SelectTrigger>
                    <SelectContent position="popper">
                      {profileOptions.map((p) => (
                        <SelectItem
                          key={p.id}
                          value={String(p.id)}
                          className="capitalize"
                        >
                          {p.profile_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {isHiddenProfile && (
                <p className="text-xs text-muted-foreground">
                  This profile is assigned automatically and can't be changed.
                </p>
              )}
              {errors.profile && (
                <FieldError>{errors.profile.message}</FieldError>
              )}
            </Field>
          </FieldGroup>

          {/* Profile image */}
          <Field>
            <FieldLabel>Profile Image</FieldLabel>
            {previewImage ? (
              <div className="relative flex h-32 w-full items-center justify-center rounded-md border-2 border-dashed border-gray-300">
                <img
                  src={previewImage}
                  alt="Profile preview"
                  className="h-28 object-contain"
                />
                <button
                  type="button"
                  onClick={() => {
                    setFile(null);
                    setPreviewImage("");
                  }}
                  className="absolute right-2 top-2 text-sm font-medium text-destructive hover:opacity-80"
                >
                  Remove
                </button>
              </div>
            ) : (
              <label className="flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed border-gray-300 bg-white transition hover:border-gray-500">
                <input
                  type="file"
                  accept="image/png, image/jpeg"
                  className="hidden"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                />
                <Upload size={26} className="text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Click to upload</p>
                <p className="text-xs text-muted-foreground">PNG or JPG</p>
              </label>
            )}
          </Field>

          <h2 className="text-base font-semibold">Contact Information</h2>

          <FieldGroup className="grid gap-4 md:grid-cols-2">
            {/* Contact number */}
            <Field data-invalid={!!errors.contact_number}>
              <FieldLabel htmlFor="contact_number">
                Primary Contact Number
              </FieldLabel>
              <Controller
                control={control}
                name="contact_number"
                render={({ field }) => (
                  <div className="flex h-9 w-full items-center rounded-md border border-input bg-transparent shadow-xs focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50">
                    <PhoneInput
                      defaultCountry="in"
                      value={field.value || ""}
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

            {/* Email */}
            <Field data-invalid={!!errors.email}>
              <FieldLabel htmlFor="email">
                Email Address <span className="text-destructive">*</span>
              </FieldLabel>
              <Input
                id="email"
                type="email"
                placeholder="Enter email address"
                aria-invalid={!!errors.email}
                {...register("email")}
              />
              {errors.email && <FieldError>{errors.email.message}</FieldError>}
            </Field>
          </FieldGroup>

          {/* Address */}
          <Field data-invalid={!!errors.current_address}>
            <FieldLabel htmlFor="current_address">Address</FieldLabel>
            <Textarea
              id="current_address"
              rows={3}
              placeholder="Enter full address"
              aria-invalid={!!errors.current_address}
              {...register("current_address")}
              onBlur={(e) =>
                setValue("current_address", e.target.value.trim(), {
                  shouldDirty: true,
                })
              }
            />
            {errors.current_address && (
              <FieldError>{errors.current_address.message}</FieldError>
            )}
          </Field>
        </fieldset>

        {/* Footer */}
        <div className="flex justify-end gap-3 border-t border-gray-200 p-4">
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isPending || (isEdit && !isDirty && !file)}
          >
            {isPending ? (
              <>
                <Spinner />
                {isEdit ? "Updating..." : "Sending..."}
              </>
            ) : isEdit ? (
              "Update User"
            ) : (
              "Send Invitation"
            )}
          </Button>
        </div>
      </form>
    </Wrapper>
  );
};

/**
 * Data + loading boundary. Fetches the option lists (and the user in edit mode),
 * waits until everything is present, then mounts the form with fully-resolved
 * `defaultValues`. Keyed by user id so switching users remounts a clean form.
 */
const InviteUserForm = () => {
  const { userId } = useParams();
  const isEdit = !!userId;

  const { data: rolesTree, isLoading: loadingRoles } = useRolesTree();
  const { data: profilesData, isLoading: loadingProfiles } = useProfiles();
  const { data: editUser, isLoading: loadingUser } = useUser(userId);

  const roles = useMemo(() => flattenRoles(rolesTree ?? []), [rolesTree]);
  const profiles = useMemo(() => profilesData ?? [], [profilesData]);

  const isLoading =
    loadingRoles || loadingProfiles || (isEdit && loadingUser);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-2 py-20 text-muted-foreground">
        <Spinner /> Loading...
      </div>
    );
  }

  const defaultValues = editUser
    ? userToFormValues(editUser)
    : inviteUserDefaults;

  return (
    <UserFormFields
      key={userId ?? "new"}
      isEdit={isEdit}
      userId={userId}
      roles={roles}
      profiles={profiles}
      defaultValues={defaultValues}
      initialImage={editUser?.user_image || ""}
    />
  );
};

export default InviteUserForm;
