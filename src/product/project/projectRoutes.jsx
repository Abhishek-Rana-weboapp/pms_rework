import { lazy } from "react";
import RequirePermission from "../auth/components/RequirePermission";
import { PERMISSIONS } from "../auth/config/permissions";
import { notFound } from "@/app/router/notfound.routes";
const History = lazy(() => import("./pages/History"));
const Documents = lazy(() => import("./pages/Documents"));
const Team = lazy(() => import("./pages/Team"));
const Backlog = lazy(() => import("./pages/Backlog"));
const Board = lazy(() => import("./pages/Board"));
const ArtifactList = lazy(() => import("./pages/ArtifactList"));
const ProjectOverview = lazy(() => import("./pages/ProjectOverview"));
const ArtifactDetails = lazy(() => import("./pages/ArtifactDetails"));
const ProjectReport = lazy(() => import("./pages/ProjectReport"));
const Timeline = lazy(() => import("./pages/Timeline"));
const Timelog = lazy(() => import("./pages/Timelog"));
const ProjectCalendar = lazy(() => import("./pages/ProjectCalendar"));

export const projectRoutes = [
  {
    index: true,
    element: <ProjectOverview />,
  },
  {
    path: "artifact/:artifactType",
    children: [
      { index: true, element:<RequirePermission permission={PERMISSIONS.ARTIFACT.VIEW_ALL}> <ArtifactList /> </RequirePermission> },
      {
        path: ":artifactId",
        element: <RequirePermission permission={PERMISSIONS.ARTIFACT.VIEW}> <ArtifactDetails /> </RequirePermission>,
      },
    ],
  },
  {
    path: "backlog",
    element: (
      <RequirePermission permission={PERMISSIONS.PROJECT.VIEW_BACKLOG}>
        <Backlog />
      </RequirePermission>
    ),
  },
  {
    path: "board",
    element: <RequirePermission permission={PERMISSIONS.SPRINT.MANAGE_BOARD}> <Board /> </RequirePermission>,
  },
  {
    path: "team",
    element: <RequirePermission permission={PERMISSIONS.PROJECT.VIEW_TEAM}> <Team /> </RequirePermission>,
  },
  {
    path: "documents",
    element: <RequirePermission permission={PERMISSIONS.PROJECT.VIEW_DOCUMENTS}> <Documents /> </RequirePermission>,
  },
  {
    path: "history",
    element: <RequirePermission permission={PERMISSIONS.ARTIFACT.VIEW_HISTORY}> <History /> </RequirePermission>,
  },
  {
    path: "timeline",
    element: <RequirePermission permission={PERMISSIONS.PROJECT.VIEW_TIMELINE}> <Timeline /> </RequirePermission>,
  },
  {
    path: "timelog",
    element: <RequirePermission permission={PERMISSIONS.PROJECT.VIEW_TIMELINE}> <Timelog /> </RequirePermission>,
  },
  {
    path: "project-report",
    element: <RequirePermission permission={PERMISSIONS.PROJECT.VIEW_REPORTS}> <ProjectReport /> </RequirePermission>,
  },
  {
    path: "calendar",
    element: <RequirePermission permission={PERMISSIONS.PROJECT.VIEW_CALENDAR}> <ProjectCalendar /> </RequirePermission>,
  },
  notFound
];
