import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { defaultSignUpValues, signupSchema } from "../config/SIgnUpSchema";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { PhoneInput } from "react-international-phone";
import "react-international-phone/style.css";
import { NavLink } from "react-router-dom";
import { useSignUp } from "../hooks/useSIgnUp";
import { toast } from "sonner";
import OtpDialog from "./OtpDialog";

const SignUpForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [emailToVerify, setEmailToVerify] = useState(null);
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(signupSchema),
    defaultValues: defaultSignUpValues,
  });

  const signupMutation = useSignUp({ needEmailVarify: setEmailToVerify });

  const handleClick = (data) => {
    signupMutation.mutate(data);
  };

  return (
    <>
      <form onSubmit={handleSubmit(handleClick)} className="w-full space-y-3">
        <div>
          <input
            {...register("full_name")}
            className="p-2 border border-neutral-300 w-full rounded-md placeholder:text-sm"
            type="text"
            placeholder="Full Name"
          />
          {errors.full_name && (
            <span className="text-xs text-red-500">
              {errors.full_name.message}
            </span>
          )}
        </div>
        <div>
          <input
            {...register("company_name")}
            className="p-2 border border-neutral-300 w-full rounded-md placeholder:text-sm"
            type="text"
            placeholder="Company Name"
          />
          {errors.company_name && (
            <span className="text-xs text-red-500">
              {errors.company_name.message}
            </span>
          )}
        </div>
        <div>
          <Controller
            name="company_size"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="p-4 py-5 w-full">
                  <SelectValue placeholder="Company Size" />
                </SelectTrigger>

                <SelectContent position="popper">
                  <SelectGroup>
                    <SelectItem value="0-10">0-10</SelectItem>
                    <SelectItem value="10-20">10-20</SelectItem>
                    <SelectItem value="20-30">20-30</SelectItem>
                    <SelectItem value="30-50">30-50</SelectItem>
                    <SelectItem value="50-100">50-100</SelectItem>
                    <SelectItem value="100+">100+</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            )}
          />
          {errors.company_size && (
            <span className="text-xs text-red-500">
              {errors.company_size.message}
            </span>
          )}
        </div>

        <div>
          <Controller
            control={control}
            name="contact_number"
            render={({ field }) => (
              <div
                className={`w-full flex items-center rounded-md border transition-all ${
                  errors.contact_number ? "border-red-500" : "border-gray-300"
                } focus-within:border-2 focus-within:border-blue-500`}
              >
                <PhoneInput
                  defaultCountry="in"
                  value={field.value}
                  onChange={field.onChange}
                  className="w-full "
                  inputClass="!border-none !shadow-none !outline-none !w-full !bg-transparent !text-[16px]"
                  inputStyle={{
                    border: "none",
                    outline: "none",
                    background: "transparent",
                    boxShadow: "none",
                    height: "40px",
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
            <span className="text-xs text-red-500">
              {errors.contact_number.message}
            </span>
          )}
        </div>

        <div className="flex flex-col">
          <input
            {...register("email")}
            className={`p-3 border border-neutral-300 rounded-md text-sm  ${errors.email ? "outline-red-500 outline" : "focus:outline outline-blue-600"}`}
            type="text"
            placeholder="Email"
          />
          {errors.email && (
            <span className="text-xs text-red-500">{errors.email.message}</span>
          )}
        </div>

        <div className="flex flex-col relative">
          <input
            {...register("password")}
            className={`p-3 border border-neutral-300 rounded-md text-sm  ${errors.password ? "outline-red-500 outline" : "focus:outline outline-blue-600"}`}
            type={showPassword ? "text" : "password"}
            placeholder="Password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer p-2"
          >
            {showPassword ? (
              <Eye className="size-4" />
            ) : (
              <EyeOff className="size-4" />
            )}
          </button>
          {errors.password && (
            <span className="text-xs text-red-500">
              {errors.password.message}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 text-sm">
          <input type="checkbox" {...register("agreeToTerms")} />
          <p>
            I agree to the
            <NavLink className=" text-blue-600 hover:underline font-medium">
              &nbsp;Terms of Service &nbsp;
            </NavLink>
            and{" "}
            <NavLink className=" text-blue-600 hover:underline font-medium">
              {" "}
              &nbsp;Privacy Policy &nbsp;
            </NavLink>
            .
          </p>
        </div>

        <Button className={"w-full"} disabled={signupMutation.isPending}>
          {signupMutation.isPending ? "Submitting" : "Sign Up"}
        </Button>
      </form>

      <OtpDialog
        isOpen={!!emailToVerify}
        onChange={(open) => {
          if (!open) setEmailToVerify(null);
        }}
        email={emailToVerify ?? ""}
        purpose="email_verify"
      />
    </>
  );
};

export default SignUpForm;
