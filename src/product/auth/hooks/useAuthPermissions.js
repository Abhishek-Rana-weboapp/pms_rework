import { useAuth } from "@/app/providers/AuthContext";

/**
 * Authz-only surface over AuthContext.
 *
 * Prefer this (or `<PermissionGate>`) over `useAuth()` when a component only
 * needs permission checks.
 *
 * Named `useAuthPermissions` to avoid clashing with settings'
 * `usePermissions` (the permission *catalog* query for profile forms).
 *
 *   const { can, canAny } = useAuthPermissions();
 *   if (can(PERMISSIONS.USER.CHANGE)) { ... }
 *   if (canAny([PERMISSIONS.USER.VIEW, PERMISSIONS.USER.ADD])) { ... }
 */
export const useAuthPermissions = () => {
  const { permissions, permissionSet, can, canAny } = useAuth();
  return { permissions, permissionSet, can, canAny };
};
