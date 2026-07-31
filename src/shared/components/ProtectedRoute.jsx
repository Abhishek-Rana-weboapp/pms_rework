import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/app/providers/AuthContext";

// Gates the authenticated route tree. While the boot refresh is in flight we hold
// (don't redirect), so a hard reload of a valid session doesn't flash /login.
const ProtectedRoute = () => {
  const { status, sessionExpired } = useAuth();
  const location = useLocation();

  if (status === "loading") {
    return (
      <div className="shimmer grid min-h-screen place-items-center text-gray-500">
        Checking session…
      </div>
    );
  }

  if (status !== "authenticated") {
    // AuthProvider owns the redirect after the user acknowledges the dialog.
    // Returning null keeps a blank shell under the overlay instead of jolting
    // straight to /login.
    if (sessionExpired) return null;
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
