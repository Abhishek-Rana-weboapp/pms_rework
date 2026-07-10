import { useMutation } from "@tanstack/react-query";

import { sendOtp, verifyOtp, resendOtp } from "../api/authApi";
import { useAuth } from "@/app/providers/AuthContext";

// OTP flows: request a code, verify it, resend it. verifyOtp shares the same
// finalizeLogin path as password login (used for both "login" and "email_verify").
export const useOtpLogin = () => {
  const { finalizeLogin } = useAuth();

  const send = useMutation({
    mutationFn: (payload) => sendOtp(payload),
  });

  const resend = useMutation({
    mutationFn: (payload) => resendOtp(payload),
  });

  const verify = useMutation({
    mutationFn: (payload) => verifyOtp(payload),
    onSuccess: (data) => finalizeLogin(data),
  });

  return { send, resend, verify };
};

export const getOtpErrorMessage = (error) =>
  error?.response?.data?.otp?.[0] ??
  error?.response?.data?.detail ??
  "OTP verification failed.";
