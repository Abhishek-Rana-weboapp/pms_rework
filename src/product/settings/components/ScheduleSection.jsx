import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Clock } from "lucide-react";
import { toast } from "sonner";

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
import { scheduleSchema, mapApiToSchedule } from "../config.js/settingsSchemas";
import { CURRENCIES, WORKING_DAYS } from "../config.js/organizationData";
import { useUpdateOrganizationSettings } from "../api/settingsMutations";

const SCHEDULE_FIELDS = ["currency", "start_time", "end_time", "working_days"];

const ScheduleSection = ({ org, orgId }) => {
  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    setError,
    formState: { errors, isDirty },
  } = useForm({
    resolver: zodResolver(scheduleSchema),
    // `values` so the form re-syncs when org loads / refetches.
    values: mapApiToSchedule(org),
  });

  const { mutate, isPending } = useUpdateOrganizationSettings(orgId);

  const workingDays = watch("working_days") || [];

  const toggleDay = (day) => {
    const next = workingDays.includes(day)
      ? workingDays.filter((d) => d !== day)
      : [...workingDays, day];
    setValue("working_days", next, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const onSubmit = (data) => {
    if (!isDirty) return;

    const formData = new FormData();
    formData.append("currency", data.currency);
    formData.append("start_time", data.start_time);
    formData.append("end_time", data.end_time);
    formData.append("working_days", JSON.stringify(data.working_days));

    mutate(
      { orgId, formData },
      {
        onSuccess: () => toast.success("Schedule updated successfully."),
        onError: (error) =>
          applyServerFieldErrors(error, setError, { fields: SCHEDULE_FIELDS }),
      },
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <fieldset disabled={isPending} className="space-y-6 disabled:opacity-60">
        <div className="border-b border-gray-200 pb-3">
          <h3 className="flex items-center gap-2 text-lg font-medium">
            <Clock className="size-5 text-primary" />
            Working Hours &amp; Schedule
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Set your organization's currency and working schedule.
          </p>
        </div>

        <FieldGroup className="grid gap-4 sm:grid-cols-3">
          {/* Currency */}
          <Field data-invalid={!!errors.currency}>
            <FieldLabel htmlFor="currency">
              Currency <span className="text-destructive">*</span>
            </FieldLabel>
            <Controller
              control={control}
              name="currency"
              render={({ field }) => (
                <Select
                  value={field.value || undefined}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger
                    id="currency"
                    className="w-full"
                    aria-invalid={!!errors.currency}
                  >
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

          {/* Start time */}
          <Field data-invalid={!!errors.start_time}>
            <FieldLabel htmlFor="start_time">
              Start Time <span className="text-destructive">*</span>
            </FieldLabel>
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
            <FieldLabel htmlFor="end_time">
              End Time <span className="text-destructive">*</span>
            </FieldLabel>
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
        </FieldGroup>

        {/* Working days */}
        <Field data-invalid={!!errors.working_days}>
          <FieldLabel>
            Working Days <span className="text-destructive">*</span>
          </FieldLabel>
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
      </fieldset>

      <div className="mt-6 flex justify-end gap-2 border-t border-gray-200 pt-4">
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
    </form>
  );
};

export default ScheduleSection;
