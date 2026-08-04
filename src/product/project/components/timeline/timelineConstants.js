export const TYPE_COLORS = {
  SPRINT: "#6366f1",
  EPIC: "#a78bfa",
  USER_STORY: "#38bdf8",
  TASK: "#34d399",
  TEST: "#fbbf24",
  ISSUE: "#fb7185",
  SPIKE: "#a3e635",
};

export const TYPE_LABEL = {
  SPRINT: "SPR",
  EPIC: "EPIC",
  USER_STORY: "US",
  TASK: "TSK",
  TEST: "TST",
  ISSUE: "ISS",
  SPIKE: "SPK",
};

export const ARTIFACT_TYPE_OPTIONS = [
  { value: "EPIC", label: "Epics" },
  { value: "USER_STORY", label: "User Stories" },
  { value: "TASK", label: "Tasks" },
  { value: "TEST", label: "Tests" },
  { value: "ISSUE", label: "Issues" },
  { value: "SPIKE", label: "Spikes" },
];

export const STATUS_OPTIONS = [
  { value: "TO DO", label: "Todo" },
  { value: "IN PROGRESS", label: "In Progress" },
  { value: "DONE", label: "Done" },
];

export const VIEW_OPTIONS = ["today", "weekly", "monthly"];

export const SELECT_ALL = "__all__";

export const TASK_TYPES = [
  { id: "summary", label: "Summary" },
  { id: "SPRINT", label: "Sprint" },
  { id: "EPIC", label: "Epic" },
  { id: "USER_STORY", label: "User Story" },
  { id: "TASK", label: "Task" },
  { id: "TEST", label: "Test" },
  { id: "ISSUE", label: "Issue" },
  { id: "SPIKE", label: "Spike" },
  { id: "task", label: "Task" },
];
