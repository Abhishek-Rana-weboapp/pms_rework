import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { otpLoginSchema } from "../config/LoginSchema";
import OtpDialog from "./OtpDialog";
import { useOtpLogin } from "../api/authMutations";
import { Button } from "@/shared/components/ui/button";

const getSendErrorMessage = (error) => {
  const res = error?.response;
  if (!res) return "Network error. Please try again.";
  if (res.status >= 500) return "Something went wrong. Please try again.";
  return (
    res.data?.detail ??
    res.data?.email?.[0] ??
    res.data?.message ??
    "Could not send OTP. Please try again."
  );
};

const OtpLoginForm = ({ handleModeChange }) => {
  const [isDailogOpen, setIsDialogOpen] = useState(false);
  const [email, setEmail] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(otpLoginSchema),
  });

  const { send } = useOtpLogin();

  const handleReqOtp = (data) => {
    send.mutate(
      { email: data.email, purpose: "login" },
      {
        // Success: remember the email and open the verify dialog.
        onSuccess: () => {
          setEmail(data.email);
          setIsDialogOpen(true);
        },
        // Error is rendered below from send.error — nothing extra needed here.
      },
    );
  };

  return (
    <>
      <form onSubmit={handleSubmit(handleReqOtp)} className="w-full max-w-105 space-y-3">
        <div className="flex flex-col gap-1 mb-2">
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

        <div className="flex justify-between items-center text-sm">
        <button
          className="text-blue-600 hover:underline cursor-pointer"
          type="button"
          onClick={handleModeChange}
        >Login with Password</button>

      </div>

        {send.isError && (
          <p role="alert" className="text-sm text-red-500">
            {getSendErrorMessage(send.error)}
          </p>
        )}

        <Button type="submit" className={"w-full"} disabled={send.isPending}>
          {send.isPending ? "Sending OTP…" : "Send OTP"}
        </Button>
      </form>

       <OtpDialog
         isOpen={isDailogOpen}
         onChange={setIsDialogOpen}
         email={email}
         purpose="login"
       />
    </>
  );
};

export default OtpLoginForm;
