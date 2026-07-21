import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PhoneInput } from "react-international-phone";
import "react-international-phone/style.css";
import axios from "axios";
import { Building2, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { Spinner } from "@/shared/components/ui/spinner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { cn } from "@/shared/lib/utils";

import { applyServerFieldErrors } from "@/shared/lib/formErrors";
import {
  branchSchema,
  branchDefaults,
  mapApiToBranch,
} from "../config.js/settingsSchemas";
import {
  COUNTRIES,
  CURRENCIES,
  TIMEZONES,
  WORKING_DAYS,
} from "../config.js/organizationData";
import { useCreateBranch, useUpdateBranch } from "../api/settingsMutations";

// Field names this form renders. A backend validation error for any of these is
// shown inline; anything else falls back to a toast.
const BRANCH_FIELDS = [
  "branch_name",
  "email",
  "branch_code",
  "contact_number",
  "website_link",
  "timezone",
  "currency",
  "working_days",
  "start_time",
  "end_time",
  "pincode",
  "country",
  "state",
  "city",
  "street_address",
];

/**
 * Add / edit branch dialog. Ported from the legacy AddBranchModal onto the
 * project's design system (radix Dialog + shadcn Field/Input/Select).
 *
 * @param {boolean}  open              Dialog open state.
 * @param {(v:boolean)=>void} onOpenChange
 * @param {object}   selectedBranch    Branch record to edit; falsy = add mode.
 * @param {string|number} companySettingsId  FK sent as `company_settings`.
 */
const BranchForm = ({ open, onOpenChange, selectedBranch, companySettingsId }) => {
  const isEdit = Boolean(selectedBranch?.id);

  // Logo is a File (or a URL string preview) kept outside RHF so the form only
  // holds serializable text fields.
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState("");
  const [logoError, setLogoError] = useState(false);
  const [pincodeLoading, setPincodeLoading] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    setError,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(branchSchema),
    defaultValues: branchDefaults,
  });

  const createMutation = useCreateBranch();
  const updateMutation = useUpdateBranch();
  const isPending = createMutation.isPending || updateMutation.isPending;

  // Sync the form (and logo) each time the dialog opens or the target changes.
  useEffect(() => {
    if (!open) return;
    if (selectedBranch?.id) {
      reset(mapApiToBranch(selectedBranch));
      setLogoPreview(selectedBranch.logo ?? "");
    } else {
      reset(branchDefaults);
      setLogoPreview("");
    }
    setLogoFile(null);
    setLogoError(false);
  }, [open, selectedBranch, reset]);

  // Revoke the object URL created for a locally-picked logo.
  useEffect(() => {
    return () => {
      if (logoPreview?.startsWith("blob:")) URL.revokeObjectURL(logoPreview);
    };
  }, [logoPreview]);

  const pincode = watch("pincode");
  const country = watch("country");
  const workingDays = watch("working_days") || [];

  // Auto-fill city/state/country from a valid Indian pincode (India Post API).
  useEffect(() => {
    const pin = (pincode || "").toString();
    if (pin.length !== 6) return;
    const c = (country || "").trim().toLowerCase();
    if (c && c !== "india") return;

    let cancelled = false;
    const lookup = async () => {
      setPincodeLoading(true);
      try {
        const res = await axios.get(
          `https://api.postalpincode.in/pincode/${pin}`,
        );
        if (cancelled) return;
        const entry = Array.isArray(res?.data) ? res.data[0] : null;
        const po = entry?.PostOffice?.[0];
        if (entry?.Status === "Success" && po) {
          const set = (name, value) =>
            value &&
            setValue(name, value, { shouldDirty: true, shouldValidate: true });
          set("city", po.District);
          set("state", po.State);
          set("country", po.Country || country || "India");
        }
      } catch (err) {
        if (!cancelled) console.log("[Pincode lookup] failed:", err?.message);
      } finally {
        if (!cancelled) setPincodeLoading(false);
      }
    };
    lookup();
    return () => {
      cancelled = true;
    };
  }, [pincode, country, setValue]);

  const toggleDay = (day) => {
    const next = workingDays.includes(day)
      ? workingDays.filter((d) => d !== day)
      : [...workingDays, day];
    setValue("working_days", next, { shouldDirty: true });
  };

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-picking the same file
    if (!file) return;
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
    setLogoError(false);
  };

  const handleLogoRemove = () => {
    setLogoFile(null);
    setLogoPreview("");
  };

  const onSubmit = (data) => {
    const formData = new FormData();

    // working_days is JSON-encoded; skip it here and append below.
    const skip = new Set(["working_days"]);
    Object.entries(data).forEach(([key, value]) => {
      if (skip.has(key) || value === "" || value == null) return;
      formData.append(key, value);
    });

    if (data.working_days?.length > 0) {
      formData.append("working_days", JSON.stringify(data.working_days));
    }

    if (logoFile) {
      formData.append("logo", logoFile);
    } else if (!logoPreview) {
      // Logo was cleared and no new one chosen -> tell the server to clear it.
      formData.append("logo", "");
    }

    if (companySettingsId != null) {
      formData.append("company_settings", companySettingsId);
    }

    const onError = (error) =>
      applyServerFieldErrors(error, setError, { fields: BRANCH_FIELDS });

    if (isEdit) {
      updateMutation.mutate(
        { id: selectedBranch.id, formData },
        {
          onSuccess: () => {
            toast.success("Branch updated successfully.");
            onOpenChange(false);
          },
          onError,
        },
      );
    } else {
      createMutation.mutate(formData, {
        onSuccess: () => {
          toast.success("Branch added successfully.");
          onOpenChange(false);
        },
        onError,
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto scrollbar-thin sm:max-w-2xl lg:max-w-4xl">
        <DialogHeader>
          <DialogTitle className={"text-lg"}>{isEdit ? "Edit Branch" : "Add Branch"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update this branch's details and preferences."
              : "Add a new branch with its contact and schedule details."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <fieldset
            disabled={isPending}
            className="space-y-6 disabled:opacity-60"
          >
            {/* Logo */}
            <div className="flex flex-col items-start gap-3">
              <FieldLabel>Branch Logo</FieldLabel>
              <div className="flex size-24 items-center justify-center overflow-hidden rounded-lg border border-gray-200 bg-accent/40">
                {logoPreview && !logoError ? (
                  <img
                    src={logoPreview}
                    alt="Branch logo"
                    className="size-full object-contain"
                    onError={() => setLogoError(true)}
                  />
                ) : (
                  <Building2 className="size-8 text-primary" />
                )}
              </div>

              <input
                type="file"
                id="branchLogoUpload"
                accept="image/png, image/jpeg, image/svg+xml"
                className="hidden"
                onChange={handleLogoChange}
              />

              <div className="flex flex-wrap gap-3">
                <Button asChild type="button" variant="outline" size="sm">
                  <label htmlFor="branchLogoUpload" className="cursor-pointer">
                    <Upload className="size-4" /> Upload Logo
                  </label>
                </Button>
                {logoPreview && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={handleLogoRemove}
                  >
                    <Trash2 className="size-4" /> Remove
                  </Button>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                PNG transparent logo recommended (512×312px).
              </p>
            </div>

            {/* Core details */}
            <FieldGroup className="grid gap-4 sm:grid-cols-2">
              {/* Branch name */}
              <Field data-invalid={!!errors.branch_name}>
                <FieldLabel htmlFor="branch_name">
                  Branch Name <span className="text-destructive">*</span>
                </FieldLabel>
                <Input
                  id="branch_name"
                  placeholder="Enter branch name"
                  aria-invalid={!!errors.branch_name}
                  {...register("branch_name")}
                />
                {errors.branch_name && (
                  <FieldError>{errors.branch_name.message}</FieldError>
                )}
              </Field>

              {/* Email */}
              <Field data-invalid={!!errors.email}>
                <FieldLabel htmlFor="branch_email">
                  Email <span className="text-destructive">*</span>
                </FieldLabel>
                <Input
                  id="branch_email"
                  placeholder="johndoe@gmail.com"
                  aria-invalid={!!errors.email}
                  {...register("email")}
                />
                {errors.email && <FieldError>{errors.email.message}</FieldError>}
              </Field>

              {/* Phone */}
              <Field data-invalid={!!errors.contact_number}>
                <FieldLabel htmlFor="branch_contact_number">Phone</FieldLabel>
                <Controller
                  control={control}
                  name="contact_number"
                  render={({ field }) => (
                    <div
                      data-invalid={!!errors.contact_number}
                      className="flex h-9 w-full items-center rounded-md border border-input bg-transparent shadow-xs transition-colors focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50 data-[invalid=true]:border-destructive"
                    >
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

              {/* Website */}
              <Field data-invalid={!!errors.website_link}>
                <FieldLabel htmlFor="website_link">
                  Website <span className="text-destructive">*</span>
                </FieldLabel>
                <Input
                  id="website_link"
                  placeholder="https://companywebsite.com"
                  aria-invalid={!!errors.website_link}
                  {...register("website_link")}
                />
                {errors.website_link && (
                  <FieldError>{errors.website_link.message}</FieldError>
                )}
              </Field>

              {/* Branch code */}
              <Field data-invalid={!!errors.branch_code}>
                <FieldLabel htmlFor="branch_code">
                  Branch Code <span className="text-destructive">*</span>
                </FieldLabel>
                <Input
                  id="branch_code"
                  placeholder="branch-a9824"
                  aria-invalid={!!errors.branch_code}
                  {...register("branch_code")}
                />
                {errors.branch_code && (
                  <FieldError>{errors.branch_code.message}</FieldError>
                )}
              </Field>

              {/* Timezone */}
              <Field data-invalid={!!errors.timezone}>
                <FieldLabel htmlFor="branch_timezone">Timezone</FieldLabel>
                <Controller
                  control={control}
                  name="timezone"
                  render={({ field }) => (
                    <Select
                      value={field.value || undefined}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger id="branch_timezone" className="w-full">
                        <SelectValue placeholder="Select timezone" />
                      </SelectTrigger>
                      <SelectContent position="popper">
                        {TIMEZONES.map((tz) => (
                          <SelectItem key={tz.value} value={tz.value}>
                            {tz.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.timezone && (
                  <FieldError>{errors.timezone.message}</FieldError>
                )}
              </Field>

              {/* Currency */}
              <Field data-invalid={!!errors.currency}>
                <FieldLabel htmlFor="branch_currency">Currency</FieldLabel>
                <Controller
                  control={control}
                  name="currency"
                  render={({ field }) => (
                    <Select
                      value={field.value || undefined}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger id="branch_currency" className="w-full">
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent position="popper">
                        {CURRENCIES.map((c) => (
                          <SelectItem key={c.value} value={c.value}>
                            {c.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.currency && (
                  <FieldError>{errors.currency.message}</FieldError>
                )}
              </Field>
            </FieldGroup>

            {/* Working days */}
            <Field data-invalid={!!errors.working_days}>
              <FieldLabel>Working Days</FieldLabel>
              <div className="flex flex-wrap gap-2">
                {WORKING_DAYS.map((day) => {
                  const selected = workingDays.includes(day);
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleDay(day)}
                      aria-pressed={selected}
                      className={cn(
                        "rounded-md border px-3 py-1.5 text-sm transition-colors",
                        selected
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-input bg-transparent hover:bg-accent",
                      )}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
              {errors.working_days ? (
                <FieldError>{errors.working_days.message}</FieldError>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Hours per day: 8 hours (auto-calculated).
                </p>
              )}
            </Field>

            {/* Schedule + address */}
            <FieldGroup className="grid gap-4 sm:grid-cols-2">
              {/* Start time */}
              <Field data-invalid={!!errors.start_time}>
                <FieldLabel htmlFor="start_time">Start Time</FieldLabel>
                <Input
                  id="start_time"
                  type="time"
                  aria-invalid={!!errors.start_time}
                  {...register("start_time")}
                />
                {errors.start_time && (
                  <FieldError>{errors.start_time.message}</FieldError>
                )}
              </Field>

              {/* End time */}
              <Field data-invalid={!!errors.end_time}>
                <FieldLabel htmlFor="end_time">End Time</FieldLabel>
                <Input
                  id="end_time"
                  type="time"
                  aria-invalid={!!errors.end_time}
                  {...register("end_time")}
                />
                {errors.end_time && (
                  <FieldError>{errors.end_time.message}</FieldError>
                )}
              </Field>

              {/* Pincode */}
              <Field data-invalid={!!errors.pincode}>
                <FieldLabel htmlFor="pincode">
                  Pincode
                  {pincodeLoading && (
                    <span className="ml-2 animate-pulse text-xs font-normal text-primary">
                      Looking up…
                    </span>
                  )}
                </FieldLabel>
                <Input
                  id="pincode"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="560001"
                  aria-invalid={!!errors.pincode}
                  {...register("pincode")}
                  onChange={(e) =>
                    setValue("pincode", e.target.value.replace(/\D/g, ""), {
                      shouldDirty: true,
                      shouldValidate: !!errors.pincode,
                    })
                  }
                />
                {errors.pincode ? (
                  <FieldError>{errors.pincode.message}</FieldError>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    City, State &amp; Country auto-fill for valid Indian
                    pincodes.
                  </p>
                )}
              </Field>

              {/* Country */}
              <Field data-invalid={!!errors.country}>
                <FieldLabel htmlFor="branch_country">Country</FieldLabel>
                <Controller
                  control={control}
                  name="country"
                  render={({ field }) => (
                    <Select
                      value={field.value || undefined}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger id="branch_country" className="w-full">
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent position="popper">
                        {COUNTRIES.map((c) => (
                          <SelectItem key={c} value={c}>
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.country && (
                  <FieldError>{errors.country.message}</FieldError>
                )}
              </Field>

              {/* State */}
              <Field data-invalid={!!errors.state}>
                <FieldLabel htmlFor="state">State</FieldLabel>
                <Input
                  id="state"
                  aria-invalid={!!errors.state}
                  {...register("state")}
                />
                {errors.state && <FieldError>{errors.state.message}</FieldError>}
              </Field>

              {/* City */}
              <Field data-invalid={!!errors.city}>
                <FieldLabel htmlFor="city">City</FieldLabel>
                <Input
                  id="city"
                  aria-invalid={!!errors.city}
                  {...register("city")}
                />
                {errors.city && <FieldError>{errors.city.message}</FieldError>}
              </Field>
            </FieldGroup>

            {/* Street address */}
            <Field data-invalid={!!errors.street_address}>
              <FieldLabel htmlFor="street_address">Street Address</FieldLabel>
              <Input
                id="street_address"
                placeholder="123 Business Street"
                aria-invalid={!!errors.street_address}
                {...register("street_address")}
              />
              {errors.street_address && (
                <FieldError>{errors.street_address.message}</FieldError>
              )}
            </Field>
          </fieldset>

          <DialogFooter className="mt-6 border-t border-gray-200 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <>
                  <Spinner />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BranchForm;
