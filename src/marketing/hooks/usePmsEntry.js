import { useAuth } from "@/app/providers/AuthContext";

// Landing-page CTA logic in one place.
//
// The AuthProvider boot sequence already does exactly what the landing page
// needs: it reads `user_id` from localStorage and calls the refresh endpoint
// (which only succeeds while the HttpOnly refresh token is still valid). When
// that succeeds the user is `authenticated` and `useCurrentUser` loads the
// profile — so `organization_uuid` is available here without re-implementing any
// of that flow.
//
// `canEnterPms` is only true once we actually have the org uuid, so the CTA
// falls back to the signed-out state (no flash to a broken /undefined link)
// during the brief window while the profile is still loading.
export const usePmsEntry = () => {
  const { isAuthenticated, user } = useAuth();
  const orgUuid = user?.organization_uuid ?? null;

  return {
    canEnterPms: isAuthenticated && !!orgUuid,
    orgUuid,
  };
};
