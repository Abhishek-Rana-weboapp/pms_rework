import { useAuthPermissions } from "@/product/auth/hooks/useAuthPermissions";

const PermissionGate = ({
  permission,
  mode = "all",
  fallback = null,
  children,
}) => {
  const { can, canAny } = useAuthPermissions();
  const allowed = mode === "any" ? canAny(permission) : can(permission);

  if (!allowed) return fallback;
  return children;
};

export default PermissionGate;
