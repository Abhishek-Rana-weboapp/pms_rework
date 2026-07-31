import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Eye, EyeOff } from "lucide-react";
import { NavLink } from "react-router-dom";

import { Button } from "@/shared/components/ui/button";
import { passwordLoginSchema } from "../config/LoginSchema";
import {
  usePasswordLogin,
} from "../api/authMutations";
import OtpDialog from "./OtpDialog";
import { getLoginErrorMessage } from "@/shared/lib/authHelpers";

const PasswordLoginForm = ({ handleModeChange }) => {
  const [showPassword, setShowPassword] = useState(false);
  // Holds the email that needs verifying; non-null = open the verify dialog.
  const [verifyEmail, setVerifyEmail] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(passwordLoginSchema),
    defaultValues: { email: "", password: "" },
    mode: "onChange",
  });

  // The hook signals an unverified email via this callback; we open the dialog.
  // On a verified login it runs finalizeLogin itself (navigates away).
  const login = usePasswordLogin({
    onNeedEmailVerify: (email) => setVerifyEmail(email),
  });

  const onSubmit = (data) => login.mutate(data);

  return (
    <>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-105 space-y-4 p-4"
      >
        <div className="flex flex-col">
          <label className="text-sm text-gray-500 mb-0.5" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            disabled={login.isPending}
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
          <label className="text-sm text-gray-500 mb-0.5" htmlFor="password">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              disabled={login.isPending}
              {...register("password")}
              className={`p-3 border w-full border-neutral-300 rounded-md text-sm  ${errors.password ? "outline-red-500 outline" : "focus:outline outline-blue-600"}`}
              type={showPassword ? "text" : "password"}
              placeholder="Password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer p-2"
            >
              {showPassword ? (
                <Eye className="size-4" />
              ) : (
                <EyeOff className="size-4" />
              )}
            </button>
          </div>
          {errors.password && (
            <span className="text-xs text-red-500">
              {errors.password.message}
            </span>
          )}
        </div>

        <div className="flex justify-between items-center text-sm">
          <button
            className="text-blue-600 hover:underline cursor-pointer"
            type="button"
            onClick={handleModeChange}
          >
            Login with OTP
          </button>
          <NavLink
            className="text-blue-600 hover:underline cursor-pointer"
            to={"/forgot-password"}
          >
            Forgot Password?
          </NavLink>
        </div>

        {/* Hide the error when we're routing to the verify dialog instead. */}
        {login.isError && !verifyEmail && (
          <p role="alert" className="text-sm text-red-500">
            {getLoginErrorMessage(login.error)}
          </p>
        )}

        <Button
          size="lg"
          type="submit"
          className={"w-full"}
          disabled={login.isPending}
        >
          {login.isPending ? "Signing in…" : "Sign In"}
        </Button>
      </form>

      <OtpDialog
        isOpen={!!verifyEmail}
        onChange={(open) => {
          if (!open) setVerifyEmail(null);
        }}
        email={verifyEmail ?? ""}
        purpose="email_verify"
      />
    </>
  );
};

export default PasswordLoginForm;
