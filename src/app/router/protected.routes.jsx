import ProtectedRoute from "@/shared/components/ProtectedRoute";
import { dashboardRoutes } from "@/product/dashboard/dashboardRoutes";
import { settingsRoutes } from "@/product/settings/settingsRoutes";
import OrgLayout from "../layouts/OrgLayout";

// Authenticated, org-scoped routes. ProtectedRoute gates the whole subtree.
export const protectedRoutes = {
  element: <ProtectedRoute />,
  children: [
    {
      path: "/:orgUuid",
      element: <OrgLayout />,
      children:[
         ...dashboardRoutes,
         ...settingsRoutes
      ]
    },
  ],
};
