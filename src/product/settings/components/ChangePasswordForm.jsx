import { Field, FieldError, FieldGroup, FieldLabel } from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { Spinner } from "@/shared/components/ui/spinner";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { CheckCircle2, Eye, EyeOff, Lock } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { passwordSchema } from "../config.js/settingsSchemas";
import { useMutation } from "@tanstack/react-query";
import api from "@/shared/services/api/axios";
import { toast } from "sonner";

// Live checklist shown under the fields; each rule turns green as it's satisfied.
const RULES = [
  { label: "At least 8 characters", test: (v) => v.length >= 8 },
  { label: "At least one uppercase letter (A-Z)", test: (v) => /[A-Z]/.test(v) },
  { label: "At least one lowercase letter (a-z)", test: (v) => /[a-z]/.test(v) },
  { label: "At least one number (0-9)", test: (v) => /[0-9]/.test(v) },
  { label: "At least one special character (!@#$%^&*)", test: (v) => /[!@#$%^&*]/.test(v) },
];

// Password input with a show/hide toggle.
const PasswordField = ({ id, label, placeholder, error, register }) => {
  const [show, setShow] = useState(false);
  return (
    <Field data-invalid={!!error}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <div className="relative">
        <Input
          id={id}
          type={show ? "text" : "password"}
          placeholder={placeholder}
          className="pr-10"
          {...register}
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setShow((s) => !s)}
          aria-label={show ? "Hide password" : "Show password"}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        >
          {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      </div>
      {error && <FieldError>{error.message}</FieldError>}
    </Field>
  );
};

const ChangePasswordForm = ({ onCancel, onSuccess }) => {
  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(passwordSchema),
    defaultValues: { old_password: "", new_password: "", confirm_password: "" },
    mode: "onBlur",
  });

  const newPassword = watch("new_password") || "";

  const {mutate} = useMutation({
    mutationFn:async(payload)=>{
      const res = await api.post(`auth/change-password/`, payload);
      return res.data
    },
    onSuccess:()=>{
      toast.success("Password updated successfully");
      onSuccess?.();
    },
    onError:(err)=>{
      const data = err.response?.data;
      const fieldErrors = data?.errors;
      let mapped = false;

      // Map each server field error onto the matching RHF field.
      if (fieldErrors && typeof fieldErrors === "object") {
        Object.entries(fieldErrors).forEach(([field, messages]) => {
          setError(field, {
            type: "server",
            message: Array.isArray(messages) ? messages[0] : String(messages),
          });
          mapped = true;
        });
      }

      // Only toast when there's no field-specific error to show inline.
      if (!mapped) {
        toast.error(data?.message || "Failed to update password");
      }
    }
  })

  const onSubmit = (data) => {
     mutate(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      <FieldGroup className="gap-4">
        <PasswordField
          id="old_password"
          label="Current Password"
          placeholder="Current Password"
          error={errors.old_password}
          register={register("old_password")}
        />
        <PasswordField
          id="new_password"
          label="New Password"
          placeholder="New Password"
          error={errors.new_password}
          register={register("new_password")}
        />
        <PasswordField
          id="confirm_password"
          label="Confirm New Password"
          placeholder="Confirm New Password"
          error={errors.confirm_password}
          register={register("confirm_password")}
        />
      </FieldGroup>

      <ul className="flex flex-col gap-2 rounded-md bg-muted p-4">
        {RULES.map((rule) => {
          const passed = rule.test(newPassword);
          return (
            <li
              key={rule.label}
              className={cn(
                "flex items-center gap-2 text-sm transition-colors",
                passed ? "text-foreground" : "text-muted-foreground"
              )}
            >
              <CheckCircle2
                className={cn(
                  "size-4 shrink-0",
                  passed ? "text-green-500" : "text-muted-foreground/40"
                )}
              />
              {rule.label}
            </li>
          );
        })}
      </ul>

      <div className="flex flex-col gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Spinner />
              Updating...
            </>
          ) : (
            "Update Password"
          )}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default ChangePasswordForm;
