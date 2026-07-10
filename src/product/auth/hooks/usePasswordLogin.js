import { useMutation } from "@tanstack/react-query";

import { login, sendOtp } from "../api/authApi";
import { useAuth } from "@/app/providers/AuthContext";

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
    onError: async (error) => {
      const res = error?.response;
      if (res?.status === 401 && res?.data?.is_verified === "False") {
        await sendOtp({ email: res.data.email, purpose: "email_verify" });
        onNeedEmailVerify?.(res.data.email);
      }
      // Other errors are surfaced to the form via mutation.error.
    },
  });
};

// Maps a backend error into a single user-facing message for the form.
export const getLoginErrorMessage = (error) => {
  if (!error) return null;
  const res = error.response;
  if (!res) return "Network error. Please try again.";
  if (res.status >= 500) return "Something went wrong. Please try again.";
  return (
    res.data?.detail ??
    res.data?.non_field_errors?.[0] ??
    res.data?.message ??
    "Invalid email or password."
  );
};
