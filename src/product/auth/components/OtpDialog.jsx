import { useState } from "react";

import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/shared/components/ui/input-otp";

import { useOtpLogin } from "../api/authMutations";
import { getOtpErrorMessage } from "@/shared/lib/authHelpers";

const OtpDialog = ({ isOpen, onChange, email, purpose = "login" }) => {
  const [otp, setOtp] = useState("");
  const { verify, resend } = useOtpLogin();

  const submit = () => {
    if (otp.length !== 6 || verify.isPending) return;
    verify.mutate({ otp, email, purpose });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    submit();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            Enter OTP
          </DialogTitle>
          <DialogDescription className="text-center">
            OTP sent to {email || "your email"}, please verify to continue
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex justify-center my-3">
            <InputOTP
              maxLength={6}
              value={otp}
              onChange={setOtp}
              onComplete={submit}
              autoFocus
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
          </div>

          {verify.isError && (
            <p role="alert" className="text-center text-sm text-red-500">
              {getOtpErrorMessage(verify.error)}
            </p>
          )}

          <Button type="submit" disabled={otp.length !== 6 || verify.isPending}>
            {verify.isPending ? "Verifying…" : "Verify"}
          </Button>

          <button
            type="button"
            onClick={() => resend.mutate({ email, purpose })}
            disabled={resend.isPending}
            className="text-sm text-blue-600 hover:underline disabled:opacity-50"
          >
            {resend.isPending ? "Resending…" : "Resend code"}
          </button>
          {resend.isSuccess && (
            <p className="text-center text-xs text-green-600">OTP resent.</p>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default OtpDialog;
