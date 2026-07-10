// API base path. MUST stay relative ("/api/v1/") so every request is same-origin
// and the HttpOnly, SameSite=Lax refresh_token cookie is sent automatically.
// Dev: Vite proxy (vite.config.js -> /api). Prod: nginx `location /api/`.
// A hardcoded cross-origin URL would break the refresh cookie.
export const BASE_URL = "/api/v1/";
