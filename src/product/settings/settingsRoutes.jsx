import { lazy } from "react";
import { notFound } from "@/app/router/notfound.routes";
const AuditLogs = lazy(()=>import("./pages/AuditLogs")) ;
const UsersDetails = lazy(() => import("./pages/UsersDetails"));
const InviteUserForm = lazy(() => import("./components/InviteUserForm"));
const CompanySettings = lazy(() => import("./pages/CompanySettings"));
const BranchDetails = lazy(() => import("./pages/BranchDetails"));
const UsersList = lazy(() => import("./pages/UsersList"));
const ProfileOverview = lazy(() => import("./pages/ProfileOverview"));
const SecurityAndAppearance = lazy(
  () => import("./pages/SecurityAndAppearance"),
);
const ProfileList = lazy(() => import("./pages/ProfileList"));
const ProfileForm = lazy(() => import("./components/ProfileForm"));
const RolesList = lazy(() => import("./pages/RolesList"));
const SettingsLayout = lazy(() => import("@/app/layouts/SettingsLayout"));
const MetaData = lazy(() => import("./pages/MetaData"));

export const settingsRoutes = [
  {
    path: "profile-settings",
    element: <SettingsLayout />,
    children: [
      {
        index: true,
        element: <ProfileOverview />,
      },
      {
        path: "security-appearance",
        element: <SecurityAndAppearance />,
      },
      {
        path: "profile",
        children: [
          {
            index: true,
            element: <ProfileList />,
          },
          {
            path: "new",
            element: <ProfileForm />,
          },
          {
            path: ":profileId/edit",
            element: <ProfileForm />,
          },
        ],
      },
      {
        path: "roles",
        element: <RolesList />,
      },
      {
        path: "users",
        children: [
          { index: true, element: <UsersList /> },
          {
            path: ":userId",
            element: <UsersDetails />,
          },
          {
            path: "userform",
            element: <InviteUserForm />,
          },
          {
            path: "userform/:userId",
            element: <InviteUserForm />,
          },
        ],
      },
      {
        path: "company-settings",
        children: [
          { index: true, element: <CompanySettings /> },
          {
            path: "branch/:branchId",
            element: <BranchDetails />,
          },
        ],
      },
      {
        path: "metadata",
        element: <MetaData />,
      },
      {
        path: "auditlogs",
        element: <AuditLogs/>,
      },

      notFound,
    ],
  },
];
