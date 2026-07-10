import axios from "axios";
import { BASE_URL } from "@/shared/config/env";

// Unauthenticated client for the auth endpoints. Deliberately separate from the
// authed `api` instance so these calls never carry a stale bearer header or trip
// the refresh interceptor. withCredentials lets the server set/read the HttpOnly
// refresh_token cookie.
const authClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

// purpose is "login" | "email_verify".
export const login = (payload) =>
  authClient.post("auth/login/", payload).then((r) => r.data);

export const sendOtp = (payload) =>
  authClient.post("auth/send-otp/", payload).then((r) => r.data);

export const verifyOtp = (payload) =>
  authClient.post("auth/verify-otp/", payload).then((r) => r.data);

export const resendOtp = (payload) =>
  authClient.post("auth/resend-otp/", payload).then((r) => r.data);

export const signup = (payload) =>
  authClient.post("auth/org-user/signup/", payload).then((r) => r.data);
