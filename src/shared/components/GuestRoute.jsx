import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/app/providers/AuthContext";

// Gates the auth pages (login / signup). An already-authenticated user must not
// reach these — even by typing the URL — so we bounce them to their org home.
// While the boot refresh is in flight (or the profile that yields the org uuid
// is still loading) we hold, so a valid session never flashes the login form.
const GuestRoute = () => {
  const { status, user } = useAuth();

  console.log(status, user);
  

  if (status === "loading") {
    return (
      <div className="grid min-h-screen place-items-center text-gray-500">
        Checking session…
      </div>
    );
  }

  if (status === "authenticated") {
    const orgUuid = user?.organization_uuid;
    // Wait for the profile before redirecting to the org-scoped home, so we
    // don't navigate to `/undefined`.
    if (!orgUuid) {
      return (
        <div className="grid min-h-screen place-items-center text-gray-500">
          Redirecting…
        </div>
      );
    }
    return <Navigate to={`/${orgUuid}`} replace />;
  }

  return <Outlet />;
};

export default GuestRoute;
