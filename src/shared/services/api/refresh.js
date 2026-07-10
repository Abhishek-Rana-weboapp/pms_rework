import axios from "axios";
import { BASE_URL } from "@/shared/config/env";
import { setAccessToken } from "./authToken";

// Bare client (no interceptors) so the refresh call can never recurse back through
// the response interceptor. withCredentials sends the HttpOnly refresh_token cookie.
const refreshClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

// Read the access token defensively — the backend has historically nested it a few
// different ways. Keep this tolerant unless the contract is locked down.
const readAccessToken = (data) =>
  data?.data?.access_token ??
  data?.data?.access ??
  data?.access_token ??
  data?.access;

// Single-flight: while a refresh is in flight, all callers share the same promise
// so concurrent 401s (and the boot call) trigger exactly one network request.
let refreshPromise = null;

export const refreshAccessToken = () => {
  if (!refreshPromise) {
    refreshPromise = refreshClient
      .post("auth/token/refresh/", {})
      .then(({ data }) => {
        const token = readAccessToken(data);
        if (!token) throw new Error("No access token in refresh response");
        setAccessToken(token);
        return token;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
};
