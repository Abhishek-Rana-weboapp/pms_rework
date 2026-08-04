import { Navigate, Outlet, useParams } from "react-router-dom";

import { useAuth } from "@/app/providers/AuthContext";
import { useAuthPermissions } from "@/product/auth/hooks/useAuthPermissions";

/**
 * Route-level permission gate. Missing permission → redirect to org home
 * without mounting the page (avoids gated API fetches).
 *
 * Use as a layout route element:
 *   { element: <RequirePermission permission={PERMISSIONS.USER.VIEW} />, children: [...] }
 *
 * Or wrap a single page via `children`.
 */
const RequirePermission = ({
  permission,
  mode = "all",
  children,
  redirectTo,
}) => {
  const { status } = useAuth();
  const { can, canAny } = useAuthPermissions();
  const { orgUuid } = useParams();

  if (status === "loading") {
    return (
      <div className="grid min-h-[40vh] place-items-center text-sm text-muted-foreground">
        Checking permissions…
      </div>
    );
  }

  const allowed = mode === "any" ? canAny(permission) : can(permission);

  if (!allowed) {
    const fallback = redirectTo ?? (orgUuid ? `/${orgUuid}` : "/");
    return <Navigate to={fallback} replace />;
  }

  return children ?? <Outlet />;
};

export default RequirePermission;
