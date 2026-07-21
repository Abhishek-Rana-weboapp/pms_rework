import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PhoneInput } from "react-international-phone";
import "react-international-phone/style.css";
import axios from "axios";
import { Building2, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";

import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/shared/components/ui/field";
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

import { applyServerFieldErrors } from "@/shared/lib/formErrors";
import {
  orgDetailsSchema,
  mapApiToOrgDetails,
} from "../config.js/settingsSchemas";
import {
  COMPANY_SIZES,
  COUNTRIES,
  TIMEZONES,
} from "../config.js/organizationData";
import { useUpdateOrganizationSettings } from "../api/settingsMutations";

// Field names this form renders — a backend error for any of these is shown
// inline; anything else falls back to a toast.
const ORG_FIELDS = [
  "company_name",
  "company_size",
  "description",
  "contact_number",
  "website_link",
  "timezone",
  "street_address",
  "pincode",
  "state",
  "city",
  "country",
];

const OrganizationSection = ({ org, orgId }) => {
  // Logo is a File (or a URL string preview) kept outside RHF so the form only
  // holds serializable text fields.
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(org?.logo ?? "");
  const [logoError, setLogoError] = useState(false);
  const [pincodeLoading, setPincodeLoading] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    setError,
    formState: { errors, isDirty },
  } = useForm({
    resolver: zodResolver(orgDetailsSchema),
    // `values` (not defaultValues) so the form re-syncs when org loads / refetches.
    values: mapApiToOrgDetails(org),
  });

  const { mutate, isPending } = useUpdateOrganizationSettings(orgId);

  // Re-sync the local logo state whenever the server logo changes (e.g. after a
  // successful save + refetch), mirroring what `values` does for the RHF fields.
  useEffect(() => {
    setLogoPreview(org?.logo ?? "");
    setLogoFile(null);
    setLogoError(false);
  }, [org?.logo]);

  // Revoke the object URL created for a locally-picked logo.
  useEffect(() => {
    return () => {
      if (logoPreview?.startsWith("blob:")) URL.revokeObjectURL(logoPreview);
    };
  }, [logoPreview]);

  const pincode = watch("pincode");
  const country = watch("country");

  // Auto-fill city/state/country from a valid Indian pincode.
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

  const logoChanged = logoFile !== null || logoPreview !== (org?.logo ?? "");
  const hasChanges = isDirty || logoChanged;

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
    if (!hasChanges) return;

    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value === undefined || value === null) return;
      formData.append(key, value);
    });

    if (logoFile) {
      formData.append("logo", logoFile);
    } else if (!logoPreview) {
      // Logo was cleared and no new one chosen -> tell the server to clear it.
      formData.append("logo", "");
    }

    mutate(
      { orgId, formData },
      {
        onSuccess: () =>
          toast.success("Organization details updated successfully."),
        onError: (error) =>
          applyServerFieldErrors(error, setError, { fields: ORG_FIELDS }),
      },
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <fieldset disabled={isPending} className="space-y-6 disabled:opacity-60">
        <div className="border-b border-gray-200 pb-3">
          <h3 className="flex items-center gap-2 text-lg font-medium">
            <Building2 className="size-5 text-primary" />
            Organization Information
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Update your company details and contact information.
          </p>
        </div>

        {/* Logo */}
        <div className="flex flex-col items-start gap-3">
          <div className="flex size-24 items-center justify-center overflow-hidden rounded-lg border border-gray-200 bg-accent/40">
            {logoPreview && !logoError ? (
              <img
                src={logoPreview}
                alt="Organization logo"
                className="size-full object-contain"
                onError={() => setLogoError(true)}
              />
            ) : (
              <Building2 className="size-8 text-primary" />
            )}
          </div>

          <input
            type="file"
            id="logoUpload"
            accept="image/png, image/jpeg, image/svg+xml"
            className="hidden"
            onChange={handleLogoChange}
          />

          <div className="flex flex-wrap gap-3">
            <Button asChild type="button" variant="outline" size="sm">
              <label htmlFor="logoUpload" className="cursor-pointer">
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

        <FieldGroup className="grid gap-4 sm:grid-cols-2">
          {/* Organization name */}
          <Field data-invalid={!!errors.company_name}>
            <FieldLabel htmlFor="company_name">
              Organization Name <span className="text-destructive">*</span>
            </FieldLabel>
            <Input
              id="company_name"
              placeholder="TechCorp Solutions"
              aria-invalid={!!errors.company_name}
              {...register("company_name")}
            />
            {errors.company_name ? (
              <FieldError>{errors.company_name.message}</FieldError>
            ) : (
              <p className="text-xs text-muted-foreground">
                This cannot be changed for root organizations.
              </p>
            )}
          </Field>

          {/* Company size */}
          <Field data-invalid={!!errors.company_size}>
            <FieldLabel htmlFor="company_size">
              Company Size <span className="text-destructive">*</span>
            </FieldLabel>
            <Controller
              control={control}
              name="company_size"
              render={({ field }) => (
                <Select
                  value={field.value || undefined}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger
                    id="company_size"
                    className="w-full"
                    aria-invalid={!!errors.company_size}
                  >
                    <SelectValue placeholder="Select company size" />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    {COMPANY_SIZES.map((size) => (
                      <SelectItem key={size} value={size}>
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.company_size && (
              <FieldError>{errors.company_size.message}</FieldError>
            )}
          </Field>
        </FieldGroup>

        {/* Description */}
        <Field data-invalid={!!errors.description}>
          <FieldLabel htmlFor="description">Company Description</FieldLabel>
          <Textarea
            id="description"
            rows={3}
            placeholder="A leading technology solutions provider..."
            aria-invalid={!!errors.description}
            {...register("description")}
          />
          {errors.description && (
            <FieldError>{errors.description.message}</FieldError>
          )}
        </Field>

        <FieldGroup className="grid gap-4 sm:grid-cols-2">
          {/* Email (read-only, not submitted) */}
          <Field>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input id="email" value={org?.email ?? ""} disabled readOnly />
          </Field>

          {/* Phone */}
          <Field data-invalid={!!errors.contact_number}>
            <FieldLabel htmlFor="contact_number">
              Phone <span className="text-destructive">*</span>
            </FieldLabel>
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
            <FieldLabel htmlFor="website_link">Website</FieldLabel>
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

          {/* Timezone */}
          <Field data-invalid={!!errors.timezone}>
            <FieldLabel htmlFor="timezone">
              Timezone <span className="text-destructive">*</span>
            </FieldLabel>
            <Controller
              control={control}
              name="timezone"
              render={({ field }) => (
                <Select
                  value={field.value || undefined}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger
                    id="timezone"
                    className="w-full"
                    aria-invalid={!!errors.timezone}
                  >
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
        </FieldGroup>

        {/* Address */}
        <div className="border-b border-gray-200 pb-2">
          <h4 className="font-medium">Address Information</h4>
        </div>

        <Field data-invalid={!!errors.street_address}>
          <FieldLabel htmlFor="street_address">
            Street Address <span className="text-destructive">*</span>
          </FieldLabel>
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

        <FieldGroup className="grid gap-4 sm:grid-cols-2">
          {/* Pincode */}
          <Field data-invalid={!!errors.pincode}>
            <FieldLabel htmlFor="pincode">
              Pincode <span className="text-destructive">*</span>
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
                City, State &amp; Country auto-fill for valid Indian pincodes.
              </p>
            )}
          </Field>

          {/* State */}
          <Field data-invalid={!!errors.state}>
            <FieldLabel htmlFor="state">
              State <span className="text-destructive">*</span>
            </FieldLabel>
            <Input
              id="state"
              aria-invalid={!!errors.state}
              {...register("state")}
            />
            {errors.state && <FieldError>{errors.state.message}</FieldError>}
          </Field>

          {/* City */}
          <Field data-invalid={!!errors.city}>
            <FieldLabel htmlFor="city">
              City <span className="text-destructive">*</span>
            </FieldLabel>
            <Input
              id="city"
              aria-invalid={!!errors.city}
              {...register("city")}
            />
            {errors.city && <FieldError>{errors.city.message}</FieldError>}
          </Field>

          {/* Country */}
          <Field data-invalid={!!errors.country}>
            <FieldLabel htmlFor="country">
              Country <span className="text-destructive">*</span>
            </FieldLabel>
            <Controller
              control={control}
              name="country"
              render={({ field }) => (
                <Select
                  value={field.value || undefined}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger
                    id="country"
                    className="w-full"
                    aria-invalid={!!errors.country}
                  >
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
        </FieldGroup>
      </fieldset>

      <div className="mt-6 flex justify-end gap-2 border-t border-gray-200 pt-4">
        <Button type="submit" disabled={isPending || !hasChanges}>
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
    </form>
  );
};

export default OrganizationSection;
