import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";

import { AuthContext } from "./AuthContext";
import { useCurrentUser } from "@/product/auth/hooks/useCurrentUser";
import { refreshAccessToken } from "@/shared/services/api/refresh";
import { setAccessToken, clearAccessToken } from "@/shared/services/api/authToken";
import { onAuthLogout } from "@/shared/services/api/authEvents";
import { queryKeys } from "@/shared/services/api/queryKeys";

// Only a non-credential identifier is persisted — enough to drive the profile
// query after a boot refresh. The access token never touches storage.
const USER_ID_KEY = "user_id";

const STATUS = {
  LOADING: "loading",
  AUTHENTICATED: "authenticated",
  UNAUTHENTICATED: "unauthenticated",
};

const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // "loading" until the boot refresh settles, so ProtectedRoute doesn't bounce an
  // already-authenticated user to /login on a hard reload.
  const [status, setStatus] = useState(STATUS.LOADING);
  const [userId, setUserId] = useState(() => localStorage.getItem(USER_ID_KEY));

  // Only fetch the profile once we know the session is valid.
  const { data: user } = useCurrentUser(
    status === STATUS.AUTHENTICATED ? userId : null,
  );

  const clearSession = () => {
    clearAccessToken();
    localStorage.removeItem(USER_ID_KEY);
    queryClient.clear();
    setUserId(null);
    setStatus(STATUS.UNAUTHENTICATED);
  };

  // Boot: rehydrate the in-memory access token from the HttpOnly refresh cookie.
  const bootRan = useRef(false);
  useEffect(() => {
    if (bootRan.current) return; // guard StrictMode's double-invoke in dev
    bootRan.current = true;

    refreshAccessToken()
      .then(() => {
        // A valid refresh cookie can outlive localStorage (e.g. the user cleared
        // it). Without a user_id we can't load the profile, so "authenticated"
        // would be a dead end — the org-scoped redirect never resolves. Treat it
        // as an unusable session and force a fresh login instead of hanging.
        if (!localStorage.getItem(USER_ID_KEY)) {
          clearSession();
          return;
        }
        setStatus(STATUS.AUTHENTICATED);
      })
    //   // Refresh failed (expired/401/etc.) — the stored user_id is stale, so wipe
    //   // the whole client session (token + user_id + cache) rather than trust it.
      .catch(clearSession);
    // // clearSession only closes over stable setters/clients; run boot once.
    // // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Forced logout dispatched by the axios interceptor when refresh fails.
  useEffect(
    () =>
      onAuthLogout(() => {
        clearSession();
        navigate("/login", { replace: true });
      }),
    // navigate/queryClient are stable; intentionally run once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  // Called by the login / OTP-verify hooks on success.
  const finalizeLogin = (data) => {
    const profile = data?.profile;
    const orgUuid = profile?.organization_uuid;
    const profileId = profile?.id;
    if (!orgUuid || !profileId) {
      throw new Error("Login response missing profile or organization info.");
    }

    setAccessToken(data?.access);
    localStorage.setItem(USER_ID_KEY, profileId);

    // Seed the profile cache so user + permissions are available instantly;
    // useCurrentUser then revalidates against the server. Must use the same
    // key useCurrentUser reads from, or the seed is never picked up.
    queryClient.setQueryData(queryKeys.currentUser.detail(profileId), profile);
    setUserId(profileId);
    setStatus(STATUS.AUTHENTICATED);

    navigate(`/${orgUuid}`, { replace: true });
  };

  const logout = () => {
    clearSession();
    navigate("/login", { replace: true });
  };

  // Permissions come only from the authoritative server profile — never trusted
  // from client storage (the backend enforces authorization regardless).
  const permissions = user?.user_permissions ?? user?.permissions ?? [];

  const value = {
    status,
    userId,
    user: user ?? null,
    permissions,
    isAuthenticated: status === STATUS.AUTHENTICATED,
    isLoading: status === STATUS.LOADING,
    finalizeLogin,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
