import { PERMISSIONS } from "@/product/auth/config/permissions";

// `id` is the key a saved tab order is stored under, so it must stay stable even
// if a tab's route or title changes. `to` can't serve as the id: Overview's is
// an empty string, which is unusable as a React key or a drag id.
//
// `permission` gates tab visibility (and should match the page's RequirePermission
// when one is added). Empty string = no gate (visible to any authenticated user).
export const projectTabsData = [
  {
    id: "overview",
    title: "Overview",
    to: "",
    permission: PERMISSIONS.PROJECT.VIEW,
    prefetch: () => import("@/product/project/pages/ProjectOverview"),
  },
  {
    id: "backlog",
    title: "Backlog",
    to: "backlog",
    permission: PERMISSIONS.ARTIFACT.VIEW_BACKLOG,
    prefetch: () => import("@/product/project/pages/Backlog"),
  },
  {
    id: "epic",
    title: "Epic",
    to: "artifact/epic",
    permission: PERMISSIONS.ARTIFACT.VIEW_ALL,
    prefetch: () => import("@/product/project/pages/ArtifactList"),
  },
  {
    id: "user_story",
    title: "Stories",
    to: "artifact/user_story",
    permission: PERMISSIONS.ARTIFACT.VIEW_ALL,
    prefetch: () => import("@/product/project/pages/ArtifactList"),
  },
  {
    id: "task",
    title: "Task",
    to: "artifact/task",
    permission: PERMISSIONS.ARTIFACT.VIEW_ALL,
    prefetch: () => import("@/product/project/pages/ArtifactList"),
  },
  {
    id: "issue",
    title: "Issue",
    to: "artifact/issue",
    permission: PERMISSIONS.ARTIFACT.VIEW_ALL,
    prefetch: () => import("@/product/project/pages/ArtifactList"),
  },
  {
    id: "spike",
    title: "Spike",
    to: "artifact/spike",
    permission: PERMISSIONS.ARTIFACT.VIEW_ALL,
    prefetch: () => import("@/product/project/pages/ArtifactList"),
  },
  {
    id: "test",
    title: "Test",
    to: "artifact/test",
    permission: PERMISSIONS.ARTIFACT.VIEW_ALL,
    prefetch: () => import("@/product/project/pages/ArtifactList"),
  },
  {
    id: "board",
    title: "Board",
    to: "board",
    permission: PERMISSIONS.SPRINT.MANAGE_BOARD,
    prefetch: () => import("@/product/project/pages/Board"),
  },
  {
    id: "team",
    title: "Team",
    to: "team",
    permission: PERMISSIONS.PROJECT.VIEW_TEAM,
    prefetch: () => import("@/product/project/pages/Team"),
  },
  {
    id: "documents",
    title: "Documents",
    to: "documents",
    permission: PERMISSIONS.PROJECT.VIEW_DOCUMENTS,
    prefetch: () => import("@/product/project/pages/Documents"),
  },
  {
    id: "history",
    title: "History",
    to: "history",
    permission: PERMISSIONS.ARTIFACT.VIEW_HISTORY,
    prefetch: () => import("@/product/project/pages/History"),
  },
  {
    id: "timeline",
    title: "Timeline",
    to: "timeline",
    permission: PERMISSIONS.PROJECT.VIEW_TIMELINE,
    prefetch: () => import("@/product/project/pages/Timeline"),
  },
  {
    id: "timelog",
    title: "Timelog",
    to: "timelog",
    permission: PERMISSIONS.PROJECT.VIEW_TIMELINE,
    prefetch: () => import("@/product/project/pages/Timelog"),
  },
  {
    id: "project-report",
    title: "Report",
    to: "project-report",
    permission: PERMISSIONS.PROJECT.VIEW_REPORTS,
    prefetch: () => import("@/product/project/pages/ProjectReport"),
  },
  {
    id: "calendar",
    title: "Calendar",
    to: "calendar",
    permission: PERMISSIONS.PROJECT.VIEW_CALENDAR,
    prefetch: () => import("@/product/project/pages/ProjectCalendar"),
  },
];
