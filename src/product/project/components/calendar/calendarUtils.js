import {
  addDays,
  eachDayOfInterval,
  endOfWeek,
  format,
  getDay,
  getDaysInMonth,
  isSameDay,
  startOfWeek,
} from "date-fns";

import { STATUS_HEX, TYPE_COLORS, TYPE_LABEL } from "./calendarConstants";

export const getWeekStart = (date) =>
  startOfWeek(date, { weekStartsOn: 1 });

export const getWeekDates = (weekStart) =>
  eachDayOfInterval({
    start: weekStart,
    end: endOfWeek(weekStart, { weekStartsOn: 1 }),
  });

export const formatMonthLabel = (year, month) =>
  format(new Date(year, month), "MMMM yyyy");

export const formatWeekRange = (weekStart) => {
  const weekEnd = addDays(weekStart, 6);
  const sameMonth = weekStart.getMonth() === weekEnd.getMonth();
  if (sameMonth) {
    return `${format(weekStart, "MMMM d")} - ${format(weekEnd, "d, yyyy")}`;
  }
  return `${format(weekStart, "MMM d")} - ${format(weekEnd, "MMM d, yyyy")}`;
};

export const getStartDayOffset = (year, month) => {
  const day = getDay(new Date(year, month, 1));
  return day === 0 ? 6 : day - 1;
};

export const parseArtifactDate = (value) => {
  if (!value) return null;
  if (value instanceof Date) return value;
  const raw = String(value).slice(0, 10);
  const [y, m, d] = raw.split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
};

export const getStatusCategory = (artifact) =>
  artifact?.status_detail?.category ||
  artifact?.status?.category ||
  artifact?.status_category ||
  "";

export const getStatusHex = (category) =>
  STATUS_HEX[category] || "#2563EB";

export const getArtifactType = (artifact) =>
  String(
    artifact?.task_type ||
      artifact?.artifact_type ||
      artifact?.type ||
      "",
  ).toUpperCase();

export const getTypeColor = (artifact) =>
  TYPE_COLORS[getArtifactType(artifact)] || "#34d399";

export const getTypeLabel = (artifact) => {
  const type = getArtifactType(artifact);
  return TYPE_LABEL[type] || type || "—";
};

export const getStatusLabel = (category) => {
  if (category === "TO DO") return "To Do";
  if (category === "IN PROGRESS") return "In Progress";
  if (category === "DONE") return "Done";
  return "Status";
};

const overlaps = (a1, a2, b1, b2) => !(a2 < b1 || b2 < a1);

export const buildMonthSegments = (artifact, offset) => {
  const segments = [];
  let cur = artifact.startDay;
  while (cur <= artifact.endDay) {
    const absoluteIndex = cur + offset - 1;
    const row = Math.floor(absoluteIndex / 7);
    const col = absoluteIndex % 7;
    const remaining = 7 - col;
    const span = Math.min(artifact.endDay - cur + 1, remaining);
    segments.push({ row, col, span });
    cur += span;
  }
  return segments;
};

export const assignMonthLanes = (visibleArtifacts, offset) => {
  const occupiedByRow = new Map();
  const out = [];
  const sorted = [...visibleArtifacts].sort((a, b) =>
    a.startDay !== b.startDay
      ? a.startDay - b.startDay
      : b.endDay - b.startDay - (a.endDay - a.startDay),
  );

  const canPlace = (row, lane, colStart, colEnd) => {
    const laneMap = occupiedByRow.get(row);
    if (!laneMap) return true;
    return !(laneMap.get(lane) || []).some(([s, e]) =>
      overlaps(s, e, colStart, colEnd),
    );
  };

  const occupy = (row, lane, colStart, colEnd) => {
    let laneMap = occupiedByRow.get(row);
    if (!laneMap) {
      laneMap = new Map();
      occupiedByRow.set(row, laneMap);
    }
    const arr = laneMap.get(lane) || [];
    arr.push([colStart, colEnd]);
    laneMap.set(lane, arr);
  };

  let maxLane = 0;
  for (const artifact of sorted) {
    const segments = buildMonthSegments(artifact, offset);
    let lane = 0;
    while (true) {
      if (
        segments.every((seg) =>
          canPlace(seg.row, lane, seg.col, seg.col + seg.span - 1),
        )
      ) {
        break;
      }
      lane += 1;
    }
    maxLane = Math.max(maxLane, lane);
    segments.forEach((seg) =>
      occupy(seg.row, lane, seg.col, seg.col + seg.span - 1),
    );
    out.push({ ...artifact, lane, segments });
  }

  return { items: out, maxLane };
};

export const assignWeekLanes = (weekArtifacts) => {
  const sorted = [...weekArtifacts].sort((a, b) =>
    a.startCol !== b.startCol ? a.startCol - b.startCol : b.span - a.span,
  );
  const occupied = new Map();

  const canPlace = (lane, start, end) =>
    !(occupied.get(lane) || []).some(([a, b]) => !(end < a || b < start));

  const occupy = (lane, start, end) => {
    const arr = occupied.get(lane) || [];
    arr.push([start, end]);
    occupied.set(lane, arr);
  };

  return sorted.map((art) => {
    let lane = 0;
    while (!canPlace(lane, art.startCol, art.endCol)) lane += 1;
    occupy(lane, art.startCol, art.endCol);
    return { ...art, lane };
  });
};

export const getVisibleMonthArtifacts = (artifacts, year, month) => {
  const daysInMonth = getDaysInMonth(new Date(year, month));
  const monthStart = new Date(year, month, 1);
  const monthEnd = new Date(year, month, daysInMonth);

  return artifacts
    .map((artifact) => {
      const start = parseArtifactDate(artifact.start_date);
      const end = parseArtifactDate(artifact.target_date || artifact.end_date);
      if (!start || !end) return null;
      if (end < monthStart || start > monthEnd) return null;

      const clippedStart = new Date(Math.max(start, monthStart));
      const clippedEnd = new Date(Math.min(end, monthEnd));

      return {
        ...artifact,
        startDay: clippedStart.getDate(),
        endDay: clippedEnd.getDate(),
      };
    })
    .filter(Boolean);
};

export const getWeekArtifacts = (artifacts, weekStart) => {
  const weekEnd = addDays(weekStart, 6);

  return artifacts
    .map((artifact) => {
      const start = parseArtifactDate(artifact.start_date);
      const end = parseArtifactDate(artifact.target_date || artifact.end_date);
      if (!start || !end) return null;
      if (end < weekStart || start > weekEnd) return null;

      const clippedStart = new Date(Math.max(start.getTime(), weekStart.getTime()));
      const clippedEnd = new Date(Math.min(end.getTime(), weekEnd.getTime()));
      const startCol = Math.round((clippedStart - weekStart) / 864e5);
      const endCol = Math.round((clippedEnd - weekStart) / 864e5);

      return {
        ...artifact,
        startCol,
        endCol,
        span: endCol - startCol + 1,
      };
    })
    .filter(Boolean);
};

export { getDaysInMonth, isSameDay };
