// Every project status — the three defaults and every custom one a project adds —
// belongs to exactly one of these categories, and that category is what decides
// its colour. So "In Review" (category IN PROGRESS) is blue like IN PROGRESS
// itself, and nothing has to be recoloured when a project invents a new status.
//
// `dot` is a solid swatch (board column headers); `badge` is a soft
// background + readable text pair for pills.
export const STATUS_CATEGORY_COLORS = {
  "TO DO": {
    dot: "bg-gray-400",
    badge: "bg-gray-200 text-gray-800",
  },
  "IN PROGRESS": {
    dot: "bg-blue-500",
    badge: "bg-blue-200 text-blue-800",
  },
  DONE: {
    dot: "bg-green-500",
    badge: "bg-green-200 text-green-700",
  },
};

/** Left-to-right board order: all TO DO columns, then IN PROGRESS, then DONE. */
export const STATUS_CATEGORY_ORDER = Object.keys(STATUS_CATEGORY_COLORS);

// Used when the category is missing or unrecognised, so an unmapped status still
// renders as a neutral pill rather than an unstyled one.
const NEUTRAL = {
  dot: "bg-muted-foreground/40",
  badge: "bg-secondary text-secondary-foreground",
};

const normalize = (value) => (value ?? "").trim().toUpperCase();

/**
 * Colours for a status, resolved through its category.
 *
 * `statusName` is a fallback for the defaults (TO DO / IN PROGRESS / DONE), whose
 * name IS their category — that covers the case where a payload carries the name
 * but not the category.
 *
 * @returns {{ dot: string, badge: string }} Tailwind class strings.
 */
export const getStatusCategoryColors = (category, statusName) =>
  STATUS_CATEGORY_COLORS[normalize(category)] ??
  STATUS_CATEGORY_COLORS[normalize(statusName)] ??
  NEUTRAL;

/**
 * Sort key for grouping board columns by category (TO DO → IN PROGRESS → DONE).
 * Unknown categories sort after the known ones; within a category the caller
 * should keep the original relative order (stable sort).
 */
export const getStatusCategoryOrder = (category, statusName) => {
  const key = normalize(category) || normalize(statusName);
  const index = STATUS_CATEGORY_ORDER.indexOf(key);
  return index === -1 ? STATUS_CATEGORY_ORDER.length : index;
};
