import { format, parseISO, isValid, startOfWeek, addDays, min, max } from "date-fns";

const STATUS_MAP = {
  "TO DO": "Todo",
  "IN PROGRESS": "In Progress",
  DONE: "Done",
};

const dayMs = 86400000;
const SPRINTS_ROOT_ID = "sprints-root";

export const parseTimelineDate = (value) => {
  if (!value) return null;
  if (value instanceof Date) return isValid(value) ? value : null;

  const raw = String(value).trim();
  if (!raw) return null;

  // Prefer local YYYY-MM-DD to avoid UTC shift.
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    const [y, m, d] = raw.split("-").map(Number);
    return new Date(y, m - 1, d);
  }

  try {
    const parsed = parseISO(raw);
    return isValid(parsed) ? parsed : null;
  } catch {
    return null;
  }
};

export const normalizeStatus = (status) => STATUS_MAP[status] || status;

export const normalizeTimeline = (items = []) =>
  items.map((item) => ({
    ...item,
    status: normalizeStatus(item.status),
    children_data: normalizeTimeline(item.children_data || []),
  }));

/**
 * API timeline mixes a SPRINT_INFO meta row with artifact trees:
 * [{ type: "SPRINT_INFO", sprints: [...] }, { type: "EPIC", children_data, ... }]
 */
export const splitTimelinePayload = (data) => {
  const timeline = data?.timeline || [];
  const sprintInfo = timeline.find((item) => item?.type === "SPRINT_INFO");
  const artifacts = timeline.filter((item) => item?.type !== "SPRINT_INFO");

  return {
    view: data?.view,
    range: {
      start: parseTimelineDate(data?.range?.start_date),
      end: parseTimelineDate(data?.range?.end_date),
    },
    sprints: sprintInfo?.sprints || [],
    artifacts: normalizeTimeline(artifacts),
  };
};

const durationBetween = (start, end) =>
  Math.max(1, Math.round((end.getTime() - start.getTime()) / dayMs) + 1);

const startOfToday = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

const boundsFromTasks = (tasks) => {
  const starts = tasks.map((t) => t.start).filter(Boolean);
  const ends = tasks.map((t) => t.end).filter(Boolean);
  if (!starts.length || !ends.length) return { start: null, end: null };
  return { start: min(starts), end: max(ends) };
};

const toGanttTask = ({
  id,
  text,
  start,
  end,
  parent = 0,
  type,
  status,
  open = false,
  storyPoints,
}) => {
  if (!start || !end) return null;

  const task = {
    // Keep ids as strings so sprint-* and numeric artifact ids coexist safely.
    id: String(id),
    text,
    start,
    end,
    duration: durationBetween(start, end),
    parent: parent === 0 ? 0 : String(parent),
    type,
    status: status || "",
    progress: 0,
    artifactType: type,
  };

  if (storyPoints != null && storyPoints !== "") {
    task.storyPoints = storyPoints;
  }

  // Only parents with children may set open — leaves crash SVAR's toArray().
  if (open) task.open = true;

  return task;
};

/**
 * Nest sprints under a single "Sprints" summary row (matches the mockup).
 */
export const transformSprintsToGanttTasks = (sprints = []) => {
  const sprintTasks = sprints
    .map((sprint) => {
      const start = parseTimelineDate(sprint.start_date);
      const end = parseTimelineDate(sprint.end_date);
      if (!start || !end) return null;
      return toGanttTask({
        id: `sprint-${sprint.id}`,
        text: sprint.name || `Sprint ${sprint.id}`,
        start,
        end,
        parent: SPRINTS_ROOT_ID,
        type: "SPRINT",
        status: sprint.status,
      });
    })
    .filter(Boolean);

  if (!sprintTasks.length) return [];

  const { start, end } = boundsFromTasks(sprintTasks);
  const root = toGanttTask({
    id: SPRINTS_ROOT_ID,
    text: "Sprints",
    start,
    end,
    parent: 0,
    type: "summary",
    status: "",
    open: true,
  });

  return root ? [root, ...sprintTasks] : sprintTasks;
};

/**
 * Flatten artifact trees into SVAR tasks with parent links.
 * Parents without own dates inherit bounds from children so nesting still shows.
 */
export const transformToGanttTasks = (tasks = [], parent = 0) =>
  tasks.flatMap((task) => {
    const childTasks = transformToGanttTasks(
      task.children_data || [],
      task.id,
    );
    const hasChildren = (task.children_data || []).length > 0;

    let start = parseTimelineDate(task.start_date);
    let end =
      parseTimelineDate(task.end_date) || parseTimelineDate(task.target_date);

    if ((!start || !end) && childTasks.length) {
      const childBounds = boundsFromTasks(childTasks);
      start = start || childBounds.start;
      end = end || childBounds.end;
    }

    // Keep undated leaves visible (old dhtmlx still listed them).
    if (!start) start = startOfToday();
    if (!end) end = start;

    const transformed = toGanttTask({
      id: task.id,
      text: task.name || task.title || `Artifact ${task.id}`,
      start,
      end,
      parent,
      type: task.type || "TASK",
      status: task.status,
      open: hasChildren,
      storyPoints: task.story_points ?? task.storyPoints,
    });

    if (!transformed) return childTasks;
    return [transformed, ...childTasks];
  });

/**
 * Chart window = API range ∪ all task dates, so bars aren't clipped out of view.
 */
export const resolveChartRange = (apiRange, tasks) => {
  const taskBounds = boundsFromTasks(tasks);
  const starts = [apiRange?.start, taskBounds.start].filter(Boolean);
  const ends = [apiRange?.end, taskBounds.end].filter(Boolean);

  if (!starts.length || !ends.length) {
    return { start: null, end: null };
  }

  return { start: min(starts), end: max(ends) };
};

export const buildGanttTasksFromPayload = (data) => {
  const { range: apiRange, sprints, artifacts } = splitTimelinePayload(data);
  const tasks = [
    ...transformSprintsToGanttTasks(sprints),
    ...transformToGanttTasks(artifacts),
  ];
  const range = resolveChartRange(apiRange, tasks);
  return { tasks, range };
};

const isSameDay = (a, b) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

export const todayScaleCss = (date) => {
  const today = new Date();
  return isSameDay(date, today) ? "gantt-today-cell" : "";
};

export const buildScales = (view) => {
  if (view === "today") {
    return [
      {
        unit: "day",
        step: 1,
        format: "%d %M",
        css: todayScaleCss,
      },
    ];
  }

  if (view === "weekly") {
    return [
      {
        unit: "week",
        step: 1,
        format: (date) => {
          const start = startOfWeek(date, { weekStartsOn: 1 });
          const end = addDays(start, 6);
          return `${format(start, "d MMM")} - ${format(end, "d MMM")}`;
        },
      },
      {
        unit: "day",
        step: 1,
        format: "%D",
        css: todayScaleCss,
      },
    ];
  }

  return [
    {
      unit: "month",
      step: 1,
      format: "%F %Y",
    },
    {
      unit: "day",
      step: 1,
      format: "%j",
      css: todayScaleCss,
    },
  ];
};

export const buildTimelineParams = ({
  view,
  search,
  typeFilter,
  statusFilter,
}) => {
  const params = { view };

  if (search?.trim()) params.search = search.trim();
  if (typeFilter) params.artifact_type = typeFilter;
  if (statusFilter) params.status = statusFilter;

  return params;
};

export const formatDateLabel = (value) => {
  const date = parseTimelineDate(value);
  return date ? format(date, "yyyy-MM-dd") : "—";
};
