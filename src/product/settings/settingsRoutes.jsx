import { lazy } from "react";
import { notFound } from "@/app/router/notfound.routes";
import UsersDetails from "./pages/UsersDetails";
import InviteUserForm from "./components/InviteUserForm";
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
        element: <></>,
      },
      {
        path: "metadata",
        element: <MetaData />,
      },
      {
        path: "auditlogs",
        element: <></>,
      },

      notFound,
    ],
  },
];
