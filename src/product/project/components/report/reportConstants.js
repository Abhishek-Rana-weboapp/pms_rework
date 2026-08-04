/** Shared colors for project report charts. */

export const WORKLOAD_PALETTE = [
  "#3b82f6",
  "#ef4444",
  "#22c55e",
  "#f59e0b",
  "#8b5cf6",
  "#06b6d4",
];

export const TYPE_COLORS = {
  TASK: "#3b82f6",
  BUG: "#ef4444",
  BUGS: "#ef4444",
  SPIKE: "#22c55e",
  SPIKES: "#22c55e",
  TEST: "#f59e0b",
  STORY: "#8b5cf6",
  USER_STORY: "#8b5cf6",
};

export const CYCLE_LEGEND = [
  { label: "Task", color: "#3b82f6" },
  { label: "Bugs", color: "#ef4444" },
  { label: "Spikes", color: "#22c55e" },
  { label: "Test", color: "#f59e0b" },
];

export const colorForType = (label, index = 0) =>
  TYPE_COLORS[String(label).toUpperCase()] ??
  WORKLOAD_PALETTE[index % WORKLOAD_PALETTE.length];

export const EMPTY_FILTERS = {
  sprint: "",
  task_type: "",
  developer: "",
  status: "",
  start_date: "",
  end_date: "",
};

export const GROUP_BY_OPTIONS = ["Daily", "Weekly", "Monthly"];

/** Radix Select can't use ""; map empty filters through this sentinel. */
export const SELECT_ALL = "__all__";
