import { useMutation } from "@tanstack/react-query";

import { sendOtp, verifyOtp, resendOtp, login, signup, setPassword } from "./authEndpoints";
import { useAuth } from "@/app/providers/AuthContext";
import { toast } from "sonner";

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

// Password login. If the account's email isn't verified — signalled either by
// profile.is_email_verified === false, or a 401 with is_verified:"False" — we kick
// off an email-verification OTP and let the caller open the verify modal instead.
export const usePasswordLogin = ({ onNeedEmailVerify } = {}) => {
  const { finalizeLogin } = useAuth();

  return useMutation({
    mutationFn: ({ email, password }) => login({ email, password }),
    onSuccess: async (data) => {
      const profile = data?.profile;
      if (profile && !profile.is_email_verified) {
        await sendOtp({ email: profile.email, purpose: "email_verify" });
        onNeedEmailVerify?.(profile.email);
        return;
      }
      finalizeLogin(data);
    },
    onError: async (error, variables) => {
      const res = error?.response;
      console.log(variables);
      if (res?.status === 401 && error?.response?.data?.message === "Email not verified. Please verify your email before logging in.") {
        await sendOtp({ email: variables.email, purpose: "email_verify" });
        onNeedEmailVerify?.(variables.email);
      }
      // Other errors are surfaced to the form via mutation.error.
    },
  });
};

export const useSignUp = ({ needEmailVarify }) => {
  return useMutation({
    mutationFn: (payload) => signup(payload),
    onSuccess: async (data) => {
      if (data.otp_sent) needEmailVarify(data.email);
      toast.success("SignUp successfull");
    },
  });
};


export const useSetPassword = () => {
  return useMutation({
    mutationFn: ({ password, confirm_password, email, token }) =>
      setPassword({ password, confirm_password, email , token}),
  });
};