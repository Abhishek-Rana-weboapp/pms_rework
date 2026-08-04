// Sidebar nav config. `to` holds the path SEGMENT only (no leading slash, no org).
//
// `prefetch` warms the route's lazily code-split chunk. The sidebar calls it on
// hover/focus so the page is already downloaded by the time the link is clicked,
// making the navigation feel instant. It must import the SAME module the route

import { PERMISSIONS } from "@/product/auth/config/permissions";
import { Lock, Shield, User, Users, Building, Database, History } from "lucide-react";
// lazy-loads, otherwise Vite emits a separate chunk and the warm-up is wasted.
export const settingsSidebarItems = [
  {
    title: "Profile Settings",
    to: "",
    prefetch: () => import("@/product/settings/pages/ProfileOverview"),
    icon: <User className="w-4 h-4" />,
  },
  {
    title: "Security & Appearance",
    to: "security-appearance",
    prefetch: () => import("@/product/settings/pages/SecurityAndAppearance"),
    icon: <Lock className="w-4 h-4" />,
  },
  {
    title: "Profile",
    to: "profile",
    permission: PERMISSIONS.PROFILE.VIEW,
    prefetch: () => import("@/product/settings/pages/ProfileList"),
    icon: <User className="w-4 h-4" />,
    mode: "all",
  },
  {
    title: "Roles",
    to: "roles",
    permission: PERMISSIONS.ROLE.VIEW,
    prefetch: () => import("@/product/settings/pages/RolesList"),
    icon: <Shield className="w-4 h-4" />,
    mode: "all",
    },
  {
    title: "Users",
    to: "users",
    permission: PERMISSIONS.ORGANIZATION.VIEW_USERS,
    prefetch: () => import("@/product/settings/pages/UsersList"),
    icon: <Users className="w-4 h-4" />,
    mode: "all",
  },
  {
    title: "Company Settings",
    to: "company-settings",
    permission: PERMISSIONS.COMPANY_SETTINGS.VIEW,
    prefetch: () => import("@/product/settings/pages/CompanySettings"),
    icon: <Building className="w-4 h-4" />,
    mode:"all"
  },
  {
    title: "Metadata",
    to: "metadata",
    permission:[
      PERMISSIONS.ORGANIZATION_STATUS_TEMPLATE.VIEW,
      PERMISSIONS.PRIORITY.VIEW,
      PERMISSIONS.PROJECT_TYPE.VIEW,
    ],
    mode: "any",
    prefetch: () => import("@/product/settings/pages/MetaData"),
    icon: <Database className="w-4 h-4" />,
  },
  {
    title: "Audit Logs",
    to: "auditlogs",
    permission: PERMISSIONS.AUDIT_LOG.VIEW,
    prefetch: () => import("@/product/settings/pages/AuditLogs"),
    icon: <History className="w-4 h-4" />,
    mode: "all",
  },
];
