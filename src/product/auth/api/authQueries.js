import { useQuery } from "@tanstack/react-query";
import { api } from "@/shared/services/api/axios";
import { queryKeys } from "@/shared/services/api/queryKeys";

// Canonical current-user query. `userId` is passed in by the caller (sourced
// from AuthProvider's reactive state, which is the single source of truth) —
// never read from localStorage here. A direct localStorage read isn't reactive
// (and the React Compiler can memoize it), so it would go stale across a login
// as a different user and keep fetching the previous id.
// The cache is seeded from the login profile in AuthProvider.finalizeLogin;
// refetchOnMount:"always" revalidates against the server while keeping the
// seeded data if that fetch fails.
export const useCurrentUser = (userId) => {
  return useQuery({
    queryKey: queryKeys.currentUser.detail(userId),
    queryFn: () => api.get(`userprofile/${userId}/`).then((r) => r.data),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
    refetchOnMount: "always",
  });
};
