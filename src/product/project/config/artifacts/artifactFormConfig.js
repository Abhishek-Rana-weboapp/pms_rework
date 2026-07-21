/**
 * Form configuration for the shared artifact create/edit form.
 *
 * The old implementation repeated a near-identical stepOneFields array for all
 * six types. Here the base list is declared ONCE and the per-type difference
 * (the parent-linkage pair) is spliced in, so a layout tweak is a one-line
 * change instead of six. The schema derives its field names from these same
 * lists (see artifactSchema.js), so what renders, what validates, and what
 * submits can never drift apart.
 *
 * Step two (work_type / billing / flexible hours for TASK/ISSUE/SPIKE/TEST) is
 * not wired yet — it plugs in as `getStepTwoFields` alongside this.
 */

// All backend task_type values with their display labels. Order = dropdown
// order. This is the single source for the type list — ARTIFACT_TYPES and the
// label lookup derive from it.
export const ARTIFACT_TYPE_OPTIONS = [
  { label: "Epic", value: "EPIC" },
  { label: "User Story", value: "USER_STORY" },
  { label: "Task", value: "TASK" },
  { label: "Spike", value: "SPIKE" },
  { label: "Test", value: "TEST" },
  { label: "Issue", value: "ISSUE" },
];

export const ARTIFACT_TYPES = ARTIFACT_TYPE_OPTIONS.map((o) => o.value);

export const getArtifactTypeLabel = (value) =>
  ARTIFACT_TYPE_OPTIONS.find((o) => o.value === value)?.label ?? value;

// Which parent KINDS an artifact can hang off. Epics are top-level (no parent
// fields at all); a user story sits under an epic; everything else can sit
// under an epic or a story. Both the parent_type options and the schema rule
// read from this single map.
const ALLOWED_PARENTS = {
  EPIC: [],
  USER_STORY: ["EPIC"],
  DEFAULT: ["EPIC", "USER_STORY"],
};

export const getAllowedParents = (type) =>
  ALLOWED_PARENTS[type?.toUpperCase()] ?? ALLOWED_PARENTS.DEFAULT;

/**
 * How each field renders: control type, label, placeholder. `required` only
 * drives the label asterisk — the actual rule lives in the schema.
 *
 * Extras understood by ArtifactField:
 * - `minDateField` (date): clamp the calendar to be >= that field's value.
 * - `resets` (select): field names cleared when this select changes — used by
 *   parent_type so a stale parent_artifact can't survive a parent-kind switch.
 * - `options` (select): static options; async ones are passed in by the form.
 */
export const FIELD_CONFIG = {
  task_type: {
    type: "select",
    label: "Type",
    placeholder: "Select Type",
    required: true,
    // Changing the kind invalidates the whole parent chain.
    resets: ["parent_type", "parent_artifact"],
  },
  title: {
    type: "text",
    label: "Title",
    placeholder: "Enter Title",
    required: true,
  },
  start_date: {
    type: "date",
    label: "Start Date",
    placeholder: "Enter Start Date",
  },
  target_date: {
    type: "date",
    label: "Target Date",
    placeholder: "Enter Target Date",
    minDateField: "start_date",
  },
  developer: {
    type: "select",
    label: "Developer",
    placeholder: "Select Developer",
  },
  priority: {
    type: "select",
    label: "Priority",
    placeholder: "Select Priority",
    required: true,
  },
  parent_type: {
    type: "select",
    label: "Parent Type",
    placeholder: "Select Parent Type",
    resets: ["parent_artifact"],
  },
  parent_artifact: {
    type: "select",
    label: "Parent Artifact",
    placeholder: "Select Parent Artifact",
  },
  status: {
    type: "select",
    label: "Status",
    placeholder: "Select Status",
    required: true,
  },
  acceptance_criteria: {
    type: "richtext",
    label: "Acceptance Criteria",
    placeholder: "Enter Acceptance Criteria",
  },
  implementation_plan: {
    type: "richtext",
    label: "Implementation Plan",
    placeholder: "Enter Implementation Plan",
  },
  story_point: {
    type: "number",
    label: "Story Point",
    placeholder: "Enter Story Point",
    required: true,
  },
  implementation_approval: {
    type: "select",
    label: "Implementation Approval",
    placeholder: "Select Implementation Approval",
    // TODO: options — the old form rendered this select with none.
  },
  description: {
    type: "richtext",
    label: "Description",
    placeholder: "Enter Description",
    required: true,
  },
  attachments: {
    type: "file",
    label: "Attachments",
  },
};

// Grid spans for the two-column form layout.
export const layoutMap = {
  full: "col-span-1 sm:col-span-2",
  half: "col-span-1",
};

// ─── Step-one field lists ───────────────────────────────────────────────────
const TASK_TYPE_FIELD = { name: "task_type", layout: "full" };

const BASE_STEP_ONE = [
  TASK_TYPE_FIELD,
  { name: "title", layout: "full" },
  { name: "start_date", layout: "half" },
  { name: "target_date", layout: "half" },
  { name: "developer", layout: "half" },
  { name: "priority", layout: "half" },
  { name: "status", layout: "full" },
  { name: "acceptance_criteria", layout: "full" },
  { name: "implementation_plan", layout: "full" },
  { name: "story_point", layout: "half" },
  { name: "implementation_approval", layout: "half" },
  { name: "description", layout: "full" },
  { name: "attachments", layout: "full" },
];

const PARENT_FIELDS = [
  { name: "parent_type", layout: "half" },
  { name: "parent_artifact", layout: "half" },
];

const insertAfter = (list, afterName, items) => {
  const i = list.findIndex((f) => f.name === afterName);
  return [...list.slice(0, i + 1), ...items, ...list.slice(i + 1)];
};

const STEP_ONE_WITH_PARENTS = insertAfter(
  BASE_STEP_ONE,
  "priority",
  PARENT_FIELDS,
);

/**
 * Ordered step-one field descriptors for a task_type. With no type chosen yet,
 * only the type select shows — the rest of the form appears once the user (or
 * a scoped Add button) picks one.
 */
export const getStepOneFields = (type) => {
  if (!type) return [TASK_TYPE_FIELD];
  return getAllowedParents(type).length ? STEP_ONE_WITH_PARENTS : BASE_STEP_ONE;
};
