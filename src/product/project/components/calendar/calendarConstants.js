export const WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export const STATUS_HEX = {
  "TO DO": "#9CA3AF",
  "IN PROGRESS": "#2563EB",
  DONE: "#10B981",
};

// Keep in sync with timeline TYPE_COLORS so calendar + gantt read the same.
export const TYPE_COLORS = {
  EPIC: "#a78bfa",
  USER_STORY: "#38bdf8",
  TASK: "#34d399",
  TEST: "#fbbf24",
  ISSUE: "#fb7185",
  SPIKE: "#a3e635",
};

export const TYPE_LABEL = {
  EPIC: "EPIC",
  USER_STORY: "US",
  TASK: "TSK",
  TEST: "TST",
  ISSUE: "ISS",
  SPIKE: "SPK",
};

export const TYPE_LEGEND = [
  { label: "Epic", color: TYPE_COLORS.EPIC },
  { label: "Story", color: TYPE_COLORS.USER_STORY },
  { label: "Task", color: TYPE_COLORS.TASK },
  { label: "Test", color: TYPE_COLORS.TEST },
  { label: "Issue", color: TYPE_COLORS.ISSUE },
  { label: "Spike", color: TYPE_COLORS.SPIKE },
];

export const ARTIFACT_TYPE_OPTIONS = [
  { value: "EPIC", label: "Epic" },
  { value: "USER_STORY", label: "User Story" },
  { value: "TASK", label: "Task" },
  { value: "ISSUE", label: "Issue" },
  { value: "SPIKE", label: "Spike" },
  { value: "TEST", label: "Test" },
];

export const SELECT_ALL = "__all__";

export const EMPTY_CALENDAR_FILTERS = {
  task_type: "",
  developer: "",
  status: "",
};

export const MAX_VISIBLE_LANES = 3;
export const MONTH_BAR_HEIGHT = 18;
export const MONTH_LANE_GAP = 6;
export const MONTH_ROW_PAD = 24;
export const MONTH_MORE_HEIGHT = 16;
export const MONTH_LANE_HEIGHT = MONTH_BAR_HEIGHT + MONTH_LANE_GAP;
export const MONTH_ROW_HEIGHT =
  MONTH_ROW_PAD + MAX_VISIBLE_LANES * MONTH_LANE_HEIGHT + MONTH_MORE_HEIGHT;

export const WEEK_BAR_HEIGHT = 28;
export const WEEK_LANE_GAP = 8;
export const WEEK_LANE_HEIGHT = WEEK_BAR_HEIGHT + WEEK_LANE_GAP;
export const WEEK_TOP_PAD = 40;
