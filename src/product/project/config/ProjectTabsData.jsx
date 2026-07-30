// `id` is the key a saved tab order is stored under, so it must stay stable even
// if a tab's route or title changes. `to` can't serve as the id: Overview's is
// an empty string, which is unusable as a React key or a drag id.
export const projectTabsData = [
  {
    id: "overview",
    title: "Overview",
    to: "",
    permission: "",
    prefetch: () => import("@/product/project/pages/ProjectOverview"),
  },
  {
    id: "backlog",
    title: "Backlog",
    to: "backlog",
    permission: "",
    prefetch: () => import("@/product/project/pages/Backlog"),
  },
  {
    id: "epic",
    title: "Epic",
    to: "artifact/epic",
    permission: "",
    prefetch: () => import("@/product/project/pages/ArtifactList"),
  },
  {
    id: "user_story",
    title: "Stories",
    to: "artifact/user_story",
    permission: "",
    prefetch: () => import("@/product/project/pages/ArtifactList"),
  },
  {
    id: "task",
    title: "Task",
    to: "artifact/task",
    permission: "",
    prefetch: () => import("@/product/project/pages/ArtifactList"),
  },
  {
    id: "issue",
    title: "Issue",
    to: "artifact/issue",
    permission: "",
    prefetch: () => import("@/product/project/pages/ArtifactList"),
  },
  {
    id: "spike",
    title: "Spike",
    to: "artifact/spike",
    permission: "",
    prefetch: () => import("@/product/project/pages/ArtifactList"),
  },
  {
    id: "test",
    title: "Test",
    to: "artifact/test",
    permission: "",
    prefetch: () => import("@/product/project/pages/ArtifactList"),
  },
  {
    id: "board",
    title: "Board",
    to: "board",
    permission: "",
    prefetch: () => import("@/product/project/pages/Board"),
  },
  {
    id: "team",
    title: "Team",
    to: "team",
    permission: "",
    prefetch: () => import("@/product/project/pages/Team"),
  },
];
