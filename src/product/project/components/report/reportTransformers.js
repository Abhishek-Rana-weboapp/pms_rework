import { format, isValid, parseISO } from "date-fns";

import { colorForType } from "./reportConstants";

export const toApiDate = (date) => {
  if (!date || !isValid(date)) return "";
  return format(date, "yyyy-MM-dd");
};

export const fromApiDate = (str) => {
  if (!str) return undefined;
  const parsed = parseISO(str);
  return isValid(parsed) ? parsed : undefined;
};

/** Drop empty filter values before hitting the API. */
export const buildReportParams = ({ groupBy, filters }) => {
  const params = { group_by: groupBy };
  for (const [key, value] of Object.entries(filters ?? {})) {
    if (value !== "" && value != null) params[key] = value;
  }
  return params;
};

export const transformTaskReport = (report) => {
  const tr = report?.task_report;
  if (!tr?.labels?.length) return [];
  return tr.labels.map((label, i) => ({
    label: String(label),
    value: tr.values?.[i] ?? 0,
  }));
};

export const transformVelocity = (report) => {
  const vc = report?.velocity_chart;
  if (!vc?.sprint_names?.length) return [];
  const avg = vc.average_velocity ?? 0;
  return vc.sprint_names.map((sprint, i) => ({
    sprint,
    committed: vc.committed?.[i] ?? 0,
    delivered: vc.completed?.[i] ?? 0,
    avg,
  }));
};

export const transformBurndown = (report) => {
  const bd = report?.burndown_chart;
  if (!bd?.days?.length) return [];
  return bd.days.map((day, i) => ({
    day,
    ideal: bd.ideal?.[i] ?? null,
    actual: bd.actual?.[i] ?? null,
    projected: bd.projected?.[i] ?? null,
  }));
};

export const transformCycleTime = (report) => {
  const ct = report?.cycle_time_chart;
  if (!ct || typeof ct !== "object") return [];
  // New: { TASK: 1.0 }. Legacy: { labels, values }.
  if (Array.isArray(ct.labels)) {
    return ct.labels.map((type, i) => ({
      type: String(type),
      days: Number(ct.values?.[i]) || 0,
    }));
  }
  return Object.entries(ct).map(([type, days]) => ({
    type,
    days: Number(days) || 0,
  }));
};

export const transformWorkload = (report) => {
  const wl = report?.workload_breakdown_chart;
  if (!wl?.labels?.length) return [];
  return wl.labels.map((name, i) => ({
    name,
    value: wl.values?.[i] ?? 0,
    color: colorForType(name, i),
  }));
};
