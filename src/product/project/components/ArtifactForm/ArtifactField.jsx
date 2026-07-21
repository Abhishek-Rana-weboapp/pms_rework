import {
  Controller,
  useFormContext,
  useFormState,
  useWatch,
} from "react-hook-form";

import {
  Field,
  FieldError,
  FieldLabel,
} from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { DatePicker } from "@/shared/components/ui/date-picker";
import { Dropzone } from "@/shared/components/ui/dropzone";
import Tiptap from "@/shared/components/tiptap/Tiptap";
import { FIELD_CONFIG } from "../../config/artifacts/artifactFormConfig";

// Old DynamicField limits, carried over.
const ATTACHMENT_ACCEPT = "image/png,image/jpg,image/jpeg,application/pdf";
const ATTACHMENT_MAX_SIZE = 30 * 1024 * 1024; // 30MB per file

const ArtifactField = ({ name, options = [], isLoading = false, disabled = false }) => {
  const config = FIELD_CONFIG[name];
  const { control, register, resetField } = useFormContext();
  const { errors } = useFormState({ control, name });

  // For date fields clamped against a sibling date (config.minDateField).
  // Watching a non-existent name is harmless and keeps the hook unconditional.
  const minDate = useWatch({ control, name: config?.minDateField ?? "__none" });

  if (!config) return null;

  const error = errors[name];

  const renderControl = () => {
    switch (config.type) {
      case "text":
      case "number":
        return (
          <Input
            id={name}
            type={config.type}
            placeholder={config.placeholder}
            disabled={disabled}
            {...register(name)}
          />
        );

      case "textarea":
        return (
          <Textarea
            id={name}
            rows={4}
            className="field-sizing-fixed scrollbar-thin"
            placeholder={config.placeholder}
            disabled={disabled}
            {...register(name)}
          />
        );

      case "richtext":
        return (
          <Controller
            name={name}
            control={control}
            render={({ field }) => (
              <Tiptap
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                disabled={disabled}
              />
            )}
          />
        );

      case "select":
        return (
          <Controller
            name={name}
            control={control}
            render={({ field }) => (
              <Select
                value={field.value ? String(field.value) : ""}
                onValueChange={(value) => {
                  field.onChange(value);
                  config.resets?.forEach((dep) => resetField(dep));
                }}
                disabled={disabled || isLoading}
              >
                <SelectTrigger id={name} className="w-full">
                  <SelectValue
                    placeholder={isLoading ? "Loading..." : config.placeholder}
                  />
                </SelectTrigger>
                <SelectContent position="popper">
                  {(options.length ? options : (config.options ?? [])).map(
                    (opt) => (
                      <SelectItem key={opt.value} value={String(opt.value)}>
                        {opt.label}
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>
            )}
          />
        );

      case "date":
        return (
          <Controller
            name={name}
            control={control}
            render={({ field }) => (
              <DatePicker
                id={name}
                value={field.value ?? undefined}
                onChange={(date) => field.onChange(date ?? null)}
                onBlur={field.onBlur}
                ref={field.ref}
                disabled={disabled}
                calendarProps={
                  config.minDateField && minDate
                    ? { disabled: { before: minDate } }
                    : undefined
                }
              />
            )}
          />
        );

      case "file":
        return (
          <Controller
            name={name}
            control={control}
            render={({ field, fieldState }) => (
              <Dropzone
                id={name}
                value={field.value ?? []}
                onChange={field.onChange}
                onBlur={field.onBlur}
                ref={field.ref}
                accept={ATTACHMENT_ACCEPT}
                maxSize={ATTACHMENT_MAX_SIZE}
                disabled={disabled}
                aria-invalid={!!fieldState.error}
              />
            )}
          />
        );

      default:
        return null;
    }
  };

  return (
    <Field className="gap-2" data-invalid={!!error}>
      {config.label && (
        <FieldLabel htmlFor={name}>
          {config.label}
          {config.required && <span className="text-destructive">*</span>}
        </FieldLabel>
      )}
      {renderControl()}
      {error && <FieldError>{error.message}</FieldError>}
    </Field>
  );
};

export default ArtifactField;
