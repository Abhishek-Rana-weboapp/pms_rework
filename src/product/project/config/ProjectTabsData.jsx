export const projectTabsData = [
  {
    title: "Overview",
    to: "",
    permission: "",
    prefetch: () => import("@/product/project/pages/ProjectOverview"),
  },
  {
    title: "Backlog",
    to: "backlog",
    permission: "",
    prefetch: () => import("@/product/project/pages/Backlog"),
  },
  {
    title: "Epic",
    to: "artifact/epic",
    permission: "",
    prefetch: () => import("@/product/project/pages/ArtifactList"),
  },
  {
    title: "Stories",
    to: "artifact/user_story",
    permission: "",
    prefetch: () => import("@/product/project/pages/ArtifactList"),
  },
  {
    title: "Task",
    to: "artifact/task",
    permission: "",
    prefetch: () => import("@/product/project/pages/ArtifactList"),
  },
  {
    title: "Issue",
    to: "artifact/issue",
    permission: "",
    prefetch: () => import("@/product/project/pages/ArtifactList"),
  },
  {
    title: "Spike",
    to: "artifact/spike",
    permission: "",
    prefetch: () => import("@/product/project/pages/ArtifactList"),
  },
  {
    title: "Test",
    to: "artifact/test",
    permission: "",
    prefetch: () => import("@/product/project/pages/ArtifactList"),
  },
  {
    title: "Board",
    to: "board",
    permission: "",
    prefetch: () => import("@/product/project/pages/Board"),
  },
  {
    title: "Team",
    to: "team",
    permission: "",
    prefetch: () => import("@/product/project/pages/Team"),
  },
];


