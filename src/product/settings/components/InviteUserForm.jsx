import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Upload } from "lucide-react";
import { PhoneInput } from "react-international-phone";
import "react-international-phone/style.css";
import { toast } from "sonner";

import { Field, FieldError, FieldLabel } from "@/shared/components/ui/field";
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
import { capitalizeFirst } from "@/shared/lib/helpers";
import { applyServerFieldErrors } from "@/shared/lib/formErrors";
import {
  inviteUserSchema,
  inviteUserDefaults,
} from "../config.js/settingsSchemas";
import { useUser, useProfiles } from "../api/settingsQueries";
import { useRolesTree } from "../api/rolesQueries";
import { useInviteUser, useUpdateUser } from "../api/settingsMutations";
import Wrapper from "@/shared/components/wrappers/Wrapper";

// Fields this form renders — a backend error for any of these is shown inline;
// anything else falls back to a toast (see applyServerFieldErrors).
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

// The roles API returns a tree; the Role select wants a flat list.
const flattenRoles = (nodes = [], acc = []) => {
  nodes.forEach((node) => {
    acc.push({ id: node.id, role_name: node.role_name });
    if (node.children?.length) flattenRoles(node.children, acc);
  });
  return acc;
};

const InviteUserForm = () => {
  const navigate = useNavigate();
  const { userId } = useParams();
  const isEdit = !!userId;

  const { data: rolesTree } = useRolesTree();
  const { data: profilesData } = useProfiles();
  const { data: editUser, isLoading: loadingUser } = useUser(userId);

  
  const roles = useMemo(() => flattenRoles(rolesTree ?? []), [rolesTree]);
  const profiles = useMemo(() => profilesData ?? [], [profilesData]);
  
  const [file, setFile] = useState(null);
  const [previewImage, setPreviewImage] = useState("");

  // Edit-mode prefill. Resolve role/profile against the option lists from
  // useRolesTree / useProfiles so the value always matches a real Select option,
  // and recompute once those lists finish loading. Returns undefined in create
  // mode so RHF keeps using defaultValues.
  const editValues = useMemo(() => {
    if (!editUser) return undefined;

    const roleMatch = roles.find(
      (r) => String(r.id) === String(editUser.role_details?.role_id),
    );
    const profileMatch = profiles.find(
      (p) => String(p.id) === String(editUser.profile_details?.profile_id),
    );

    console.log({
    editUser,
    roles,
    profiles,
    roleId: editUser?.role_details?.role_id,
    profileId: editUser?.profile_details?.profile_id,
  });
    return {
      first_name: editUser.first_name || "",
      last_name: editUser.last_name || "",
      gender: editUser.gender || "",
      role: roleMatch ? String(roleMatch.id) : "",
      profile: profileMatch ? String(profileMatch.id) : "",
      user_type: editUser.user_type || "",
      contact_number: editUser.contact_number || "",
      email: editUser.email || "",
      current_address: editUser.current_address || "",
      branch: editUser.branch ? String(editUser.branch) : "",
      is_add_to_branch: !!editUser.branch,
    };
  }, [editUser, roles, profiles]);

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
    defaultValues: inviteUserDefaults,
    values: editValues,
    resetOptions: { keepDirtyValues: true },
  });

  // CEO role and Administrator profile are fixed and can't be reassigned here.
  const roleValue = watch("role");
  const isCeoRole = roles.some(
    (r) =>
      String(r.id) === String(roleValue) &&
      r.role_name?.toLowerCase() === "ceo",
  );
  const profileValue = watch("profile");
  const isAdministratorProfile = profiles.some(
    (p) =>
      String(p.id) === String(profileValue) &&
      p.profile_name?.toLowerCase() === "administrator",
  );

  // The image preview isn't form state, so keep it synced on its own.
  useEffect(() => {
    if (editUser) setPreviewImage(editUser.user_image || "");
  }, [editUser]);

  const inviteMutation = useInviteUser();
  const updateMutation = useUpdateUser();
  const isPending = inviteMutation.isPending || updateMutation.isPending;

  const handleFileChange = (e) => {
    const imageFile = e.target.files?.[0];
    if (imageFile) {
      setFile(imageFile);
      setPreviewImage(URL.createObjectURL(imageFile));
    }
  };

  const removeFile = () => {
    setFile(null);
    setPreviewImage("");
  };

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
      // Image was removed and none re-selected -> clear it on the server.
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

  if (isEdit && loadingUser) {
    return (
      <div className="flex items-center justify-center gap-2 py-20 text-muted-foreground">
        <Spinner /> Loading user data...
      </div>
    );
  }

  return (
    <Wrapper className="space-y-6">
      {/* Header */}
      <div className=" border-b bg-white rounded-md shadow border-gray-200 p-4 flex items-start gap-3">
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft />
        </Button>
        <div>
          <h2 className="flex items-center gap-2 text-lg font-semibold md:text-lg">
            {isEdit ? "Update User" : "Invite New User"}
          </h2>
          <p className="text-sm text-gray-500">
            {isEdit
              ? "Fill in the details to update the user."
              : "Fill in the details to add a new user."}
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white rounded-md shadow"
      >
        <fieldset
          disabled={isPending}
          className="space-y-4 p-4 disabled:opacity-60"
        >
          <h3 className="text-lg font-medium">Personal Information</h3>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* First Name */}
            <Field data-invalid={!!errors.first_name}>
              <FieldLabel htmlFor="first_name">
                First Name <span className="text-destructive">*</span>
              </FieldLabel>
              <Input
                id="first_name"
                placeholder="Enter first name"
                {...register("first_name")}
                onChange={(e) =>
                  setValue("first_name", capitalizeFirst(e.target.value), {
                    shouldDirty: true,
                  })
                }
                aria-invalid={!!errors.first_name}
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
                {...register("last_name")}
                onChange={(e) =>
                  setValue("last_name", capitalizeFirst(e.target.value), {
                    shouldDirty: true,
                  })
                }
                aria-invalid={!!errors.last_name}
              />
              {errors.last_name && (
                <FieldError>{errors.last_name.message}</FieldError>
              )}
            </Field>

            {/* Gender */}
            <Field>
              <FieldLabel htmlFor="gender">Gender</FieldLabel>
              <Controller
                control={control}
                name="gender"
                render={({ field }) => (
                  <Select
                    value={field.value || undefined}
                    onValueChange={field.onChange}
                  >
                    {console.log(field)}
                    <SelectTrigger id="gender" className="w-full">
                      <SelectValue placeholder="--Select gender--" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
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
                    disabled={isCeoRole}
                  >
                    <SelectTrigger
                      id="role"
                      className="w-full"
                      aria-invalid={!!errors.role}
                    >
                      <SelectValue placeholder="--Select--" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles
                        .filter((r) => r.role_name?.toLowerCase() !== "ceo")
                        .map((r) => (
                          <SelectItem key={r.id} value={String(r.id)}>
                            {r.role_name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {isCeoRole && (
                <p className="text-xs text-muted-foreground">
                  CEO role cannot be changed.
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
                      <SelectValue placeholder="--Select User Type--" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Employee">Employee</SelectItem>
                      <SelectItem value="Client">Client</SelectItem>
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
                    disabled={isAdministratorProfile}
                  >
                    <SelectTrigger
                      id="profile"
                      className="w-full capitalize"
                      aria-invalid={!!errors.profile}
                    >
                      <SelectValue placeholder="--Select Profile--" />
                    </SelectTrigger>
                    <SelectContent>
                      {profiles
                        .filter(
                          (p) =>
                            p.profile_name?.toLowerCase() !== "administrator",
                        )
                        .map((p) => (
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
              {isAdministratorProfile && (
                <p className="text-xs text-muted-foreground">
                  Administrator profile cannot be changed.
                </p>
              )}
              {errors.profile && (
                <FieldError>{errors.profile.message}</FieldError>
              )}
            </Field>
          </div>

          {/* Upload Image */}
          <Field>
            <FieldLabel>Upload Profile Image</FieldLabel>
            {!previewImage ? (
              <label className="flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded border-2 border-dotted border-gray-300 bg-white transition hover:border-gray-500">
                <input
                  type="file"
                  accept="image/png, image/jpeg"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <Upload size={28} className="text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Upload Here</p>
                <p className="text-xs text-muted-foreground">
                  PNG, JPG up to 5MB
                </p>
              </label>
            ) : (
              <div className="relative flex h-32 w-full items-center justify-center rounded border-2 border-dotted border-gray-300">
                <img
                  src={previewImage}
                  alt="preview"
                  className="h-28 object-contain"
                />
                <button
                  type="button"
                  onClick={removeFile}
                  className="absolute top-2 right-2 cursor-pointer text-destructive hover:opacity-80"
                >
                  Remove
                </button>
              </div>
            )}
          </Field>

          {/* Contact Information */}
          <h3 className="text-lg font-bold">Contact Information</h3>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Phone */}
            <Field>
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
                {...register("email")}
                aria-invalid={!!errors.email}
              />
              {errors.email && <FieldError>{errors.email.message}</FieldError>}
            </Field>
          </div>

          {/* Address */}
          <Field data-invalid={!!errors.current_address}>
            <FieldLabel htmlFor="current_address">Address</FieldLabel>
            <Textarea
              id="current_address"
              rows={3}
              placeholder="Enter full address"
              {...register("current_address")}
              onBlur={(e) =>
                setValue("current_address", e.target.value.trim(), {
                  shouldDirty: true,
                })
              }
              aria-invalid={!!errors.current_address}
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
              "Update"
            ) : (
              "Send Invitation"
            )}
          </Button>
        </div>
      </form>
    </Wrapper>
  );
};

export default InviteUserForm;
