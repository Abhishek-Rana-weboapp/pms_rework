export const getOtpErrorMessage = (error) =>
  error?.response?.data?.otp?.[0] ??
  error?.response?.data?.detail ??
  "OTP verification failed.";

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


export const getSetPasswordErrorMessage = (error) => {
  if (!error) return null;
  const res = error.response;
  if (!res) return "Network error. Please try again.";
  if (res.status >= 500) return "Something went wrong. Please try again.";
  return (
    res.data?.detail ??
    res.data?.non_field_errors?.[0] ??
    res.data?.message ??
    "Invalid password."
  );
};