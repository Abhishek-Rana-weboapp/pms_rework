import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";

import { AuthContext } from "./AuthContext";
import { useCurrentUser } from "@/product/auth/api/authQueries";
import { refreshAccessToken } from "@/shared/services/api/refresh";
import { setAccessToken, clearAccessToken } from "@/shared/services/api/authToken";
import { onAuthLogout } from "@/shared/services/api/authEvents";
import { queryKeys } from "@/shared/services/api/queryKeys";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/components/ui/alert-dialog";

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
  // Shown when the refresh cookie itself dies mid-session. Stays up until the
  // user acknowledges — ProtectedRoute holds the redirect until then.
  const [sessionExpiredOpen, setSessionExpiredOpen] = useState(false);
  const sessionExpiredRef = useRef(false);

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

  const acknowledgeSessionExpired = () => {
    sessionExpiredRef.current = false;
    setSessionExpiredOpen(false);
    navigate("/login", { replace: true });
  };

  // Boot: rehydrate the in-memory access token from the HttpOnly refresh cookie.
  const bootRan = useRef(false);
  useEffect(() => {
    if (bootRan.current) return; // guard StrictMode's double-invoke in dev
    bootRan.current = true;

    refreshAccessToken()
      .then(() => {
        if (!localStorage.getItem(USER_ID_KEY)) {
          clearSession();
          return;
        }
        setStatus(STATUS.AUTHENTICATED);
      })
      .catch(clearSession);
    // clearSession only closes over stable setters/clients; run boot once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Forced logout dispatched by the axios interceptor when refresh fails.
  // Wipe credentials immediately, but park on the expiry dialog instead of
  // navigating — the user clicks OK to go to /login.
  useEffect(
    () =>
      onAuthLogout(() => {
        if (sessionExpiredRef.current) return;
        sessionExpiredRef.current = true;
        clearSession();
        setSessionExpiredOpen(true);
      }),
    // clearSession closes over stable setters/clients; subscribe once.
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

    sessionExpiredRef.current = false;
    setSessionExpiredOpen(false);

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
    sessionExpiredRef.current = false;
    setSessionExpiredOpen(false);
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
    sessionExpired: sessionExpiredOpen,
    finalizeLogin,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}

      <AlertDialog
        open={sessionExpiredOpen}
        // Escape / outside dismiss still counts as acknowledging — otherwise
        // the user could close the dialog and sit on a dead session.
        onOpenChange={(open) => {
          if (!open) acknowledgeSessionExpired();
        }}
      >
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Session expired</AlertDialogTitle>
            <AlertDialogDescription>
              Your session has expired. Please log in again to continue.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={acknowledgeSessionExpired}>
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AuthContext.Provider>
  );
};

export default AuthProvider;
