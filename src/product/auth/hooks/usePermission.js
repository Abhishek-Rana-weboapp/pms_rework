import { useAuth } from "@/app/providers/AuthContext";
import {
  hasAnyPermission,
  hasPermission,
} from "@/product/auth/config/permissions";

/**
 * Compare the signed-in user's permissions against a required codename
 * (or list of codenames) from `PERMISSIONS`.
 *
 *   const canEdit = usePermission(PERMISSIONS.USER.CHANGE);
 *   const canManage = usePermission([PERMISSIONS.USER.CHANGE, PERMISSIONS.USER.DELETE]);
 */
export const usePermission = (required) => {
  const { permissions } = useAuth();
  return hasPermission(permissions, required);
};

export const useAnyPermission = (required) => {
  const { permissions } = useAuth();
  return hasAnyPermission(permissions, required);
};
