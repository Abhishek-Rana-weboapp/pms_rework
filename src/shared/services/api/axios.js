import axios from "axios";
import { BASE_URL } from "@/shared/config/env";
import { getAccessToken, clearAccessToken } from "./authToken";
import { refreshAccessToken } from "./refresh";
import { emitAuthLogout } from "./authEvents";

// Authenticated client. Import this for every authenticated request.
// withCredentials lets the browser send the HttpOnly refresh cookie when needed.
export const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

// Attach the in-memory bearer token + JSON content-type (unless sending FormData).
api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (!(config.data instanceof FormData)) {
    config.headers["Content-Type"] = "application/json";
  }
  return config;
});

// On 401: refresh the access token once (single-flight) and replay the request.
// If refresh fails, drop the token and broadcast auth:logout (AuthProvider redirects).
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    if (
      error.response?.status !== 401 ||
      original?._retry ||
      original?.url?.includes("auth/token/refresh/")
    ) {
      return Promise.reject(error);
    }

    original._retry = true;

    try {
      const token = await refreshAccessToken();
      original.headers.Authorization = `Bearer ${token}`;
      return api(original);
    } catch (refreshError) {
      clearAccessToken();
      emitAuthLogout();
      return Promise.reject(refreshError);
    }
  },
);

export default api;
