// The access token is kept in memory ONLY — never localStorage/sessionStorage.
// This keeps the bearer credential out of any JS-readable persistent store, so an
// XSS payload can't exfiltrate a long-lived token. On reload the token is gone and
// is rehydrated by a single refresh call (see AuthProvider boot sequence).
let accessToken = null;

export const getAccessToken = () => accessToken;

export const setAccessToken = (token) => {
  accessToken = token ?? null;
};

export const clearAccessToken = () => {
  accessToken = null;
};
