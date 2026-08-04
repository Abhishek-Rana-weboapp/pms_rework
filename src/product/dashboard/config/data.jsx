// Sidebar nav config. `to` holds the path SEGMENT only (no leading slash, no org).
//
// `prefetch` warms the route's lazily code-split chunk. The sidebar calls it on
// hover/focus so the page is already downloaded by the time the link is clicked,
// making the navigation feel instant. It must import the SAME module the route
// lazy-loads, otherwise Vite emits a separate chunk and the warm-up is wasted.

import { PERMISSIONS } from "@/product/auth/config/permissions";
import { ChartColumn, Folder, Home, IdCardLanyard, Users } from "lucide-react";

// The org is prepended at render time from the URL, so this config stays org-agnostic.
export const SideBarItems = [
  {
    title: "Dashboard",
    to: "",
    icon: <Home className="size-4" />,
    permission: PERMISSIONS.PROJECT.VIEW_DASHBOARD,
    prefetch: () => import("@/product/dashboard/pages/Dashboard"),
  },
  {
    title: "Employees",
    to: "employees",
    icon: <Users className="size-4" />,
    permission: PERMISSIONS.USER.VIEW_EMPLOYEE,
    prefetch: () => import("@/product/dashboard/pages/EmployeeList"),
  },
  {
    title: "Clients",
    to: "clients",
    icon: <IdCardLanyard className="size-4" />,
    permission: PERMISSIONS.USER.VIEW_CLIENT,
    prefetch: () => import("@/product/dashboard/pages/ClientList"),
  },
  {
    title: "Projects",
    to: "projects",
    icon: <Folder className="size-4" />,
    permission: PERMISSIONS.PROJECT.VIEW,
    prefetch: () => import("@/product/dashboard/pages/ProjectList"),
  },
  {
    title: "Reports",
    to: "reports",
    icon: <ChartColumn className="size-4" />,
    permission: PERMISSIONS.PROJECT.VIEW_REPORTS_HOME,
    prefetch: () => import("@/product/dashboard/pages/AllReports"),
  },
];
