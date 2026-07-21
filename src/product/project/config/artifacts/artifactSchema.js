import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ARTIFACT_TYPES,
  getAllowedParents,
  getStepOneFields,
} from "./artifactFormConfig";

/**
 * Artifact form schema (step one).
 *
 * The schema for a type is BUILT FROM the same field list that renders the form
 * (getStepOneFields), so what renders, what validates, and what submits always
 * agree. Fields a type doesn't list are absent from its schema, and zod strips
 * unknown keys — so a value entered under one type and abandoned after a type
 * switch (e.g. a parent picked, then switched to Epic) can't ride along in the
 * payload.
 *
 * task_type is a form FIELD (not a prop): the form opens from a universal Add
 * button (type unset) or a scoped one (type pre-selected, still changeable),
 * and `artifactResolver` picks the schema per validation run from the values.
 *
 * The old implementation expressed this as a 6-branch discriminatedUnion whose
 * branches were identical except for step-two additions; deriving from the
 * field list replaces all of that.
 *
 * Step two (work_type / billing / flexible hours) is not wired yet — it will
 * extend the built schema for the types that have it.
 */

// Empty select ("") -> undefined BEFORE coercion, otherwise Number("") === 0
// slips past .optional() / required checks.
const emptyToUndefined = (v) => (v === "" || v == null ? undefined : v);

// Optional select id: absent is fine, but if present it must be a number.
const optionalId = z.preprocess(emptyToUndefined, z.coerce.number().optional());

// ─── Per-field schema fragments ────────────────────────────────────────────
// One entry per field. An entry is either a schema, or a function of task_type
// for the rare field whose RULE (not just presence) varies by type — see
// parent_type, whose allowed values come from getAllowedParents.
const FIELD_SCHEMAS = {
  task_type: z.enum(ARTIFACT_TYPES, { message: "Type is required" }),
  title: z.string().min(1, "Title is required"),
  description: z
    .string()
    .min(1, "Description is required")
    .max(1500, "Description cannot exceed 1500 characters"),
  priority: z.coerce.number().min(1, "Priority is required"),
  status: z.coerce.number().min(1, "Status is required"),
  developer: optionalId,
  start_date: z.date().nullable(),
  target_date: z.date().nullable(),
  story_point: z.preprocess(
    emptyToUndefined,
    z.coerce
      .number({ message: "Story point is required" })
      .min(0, "Story point cannot be negative"),
  ),
  acceptance_criteria: z
    .string()
    .max(1500, "Acceptance criteria cannot exceed 1500 characters")
    .optional(),
  implementation_plan: z
    .string()
    .max(1500, "Implementation plan cannot exceed 1500 characters")
    .optional(),
  implementation_approval: z.preprocess(
    emptyToUndefined,
    z.string().optional(),
  ),
  // Parent linkage is optional (matches the old schema), but when a parent
  // kind IS picked it must be one this type allows.
  parent_type: (type) => {
    const allowed = getAllowedParents(type);
    return z.preprocess(
      emptyToUndefined,
      (allowed.length ? z.enum(allowed) : z.string()).optional(),
    );
  },
  parent_artifact: optionalId,
  // File[] for new uploads; edit mode may mix in existing server attachments
  // ({ id, url }), so the array is deliberately loose.
  attachments: z.array(z.any()).optional(),
};

// ─── Field names, derived from the form config ─────────────────────────────
/** Ordered step-one field NAMES for a task_type (schema + payload shape). */
export const getArtifactFields = (type) =>
  getStepOneFields(type).map((f) => f.name);

// ─── Schema ─────────────────────────────────────────────────────────────────
// A FIELD_SCHEMAS entry is either a schema or a function of task_type; zod
// schemas are objects, so a function here is unambiguously the per-type form.
const resolveFieldSchema = (entry, type) =>
  typeof entry === "function" ? entry(type) : entry;

export const buildArtifactSchema = (type) =>
  z
    .object(
      Object.fromEntries(
        getArtifactFields(type).map((name) => [
          name,
          resolveFieldSchema(FIELD_SCHEMAS[name], type),
        ]),
      ),
    )
    // Cross-field rules live here, not in the field list.
    .refine(
      (data) =>
        !data.start_date ||
        !data.target_date ||
        data.target_date >= data.start_date,
      {
        message: "Target date cannot be before start date",
        path: ["target_date"],
      },
    );

// ─── Resolver ──────────────────────────────────────────────────────────────
/**
 * Values-driven resolver: `zodResolver(schema)` is just a function of
 * (values, context, options), so we pick the schema per validation run from the
 * task_type currently in the form. One resolver identity, correct schema even
 * as the user changes type mid-form.
 */
export const artifactResolver = (values, context, options) =>
  zodResolver(buildArtifactSchema(values?.task_type))(values, context, options);

// ─── Defaults ──────────────────────────────────────────────────────────────
// Superset of every field. Keys not in the active type's schema are stripped on
// submit, so one defaults object is safe for all types.
export const artifactDefaultValues = {
  task_type: "",
  title: "",
  description: "",
  priority: "",
  status: "",
  developer: "",
  start_date: null,
  target_date: null,
  story_point: "",
  acceptance_criteria: "",
  implementation_plan: "",
  implementation_approval: "",
  parent_type: "",
  parent_artifact: "",
  attachments: [],
};

/**
 * Default status for a NEW artifact. Statuses are project-defined (their names
 * are custom per project — see custom_statuses in projectSchema), so resolve by
 * the stable CATEGORY bucket first, then the conventional name, then the first
 * status, so a project can never end up with no default.
 */
export const getDefaultStatusId = (statuses = []) => {
  const byCategory = statuses.find(
    (s) => (s.category || "").trim().toUpperCase() === "TO DO",
  );
  const byName = statuses.find(
    (s) => (s.status_name || "").trim().toLowerCase() === "to do",
  );
  return (byCategory ?? byName ?? statuses[0])?.id ?? "";
};

/**
 * Form defaults for a given entry point.
 * - `presetType` pre-selects the type for type-scoped "Add" buttons (still
 *   changeable); omit it for the universal Add button.
 * - `artifact` populates edit mode.
 * - `statuses` (loaded BEFORE the form mounts — see ArtifactForm's data
 *   boundary) seeds the default status for new artifacts. Baking it into
 *   defaultValues is deterministic; a post-mount setValue proved timing-
 *   dependent across dialog reopens.
 */
export const buildArtifactDefaults = ({
  presetType = "",
  artifact,
  statuses = [],
  prefill = null,
} = {}) => {
  // The route param arrives lowercase ("task") but task_type values are
  // uppercase ("TASK") — normalize here so the type select matches its option.
  const preset = presetType?.toUpperCase() ?? "";

  if (!artifact) {
    return {
      ...artifactDefaultValues,
      task_type: preset,
      status: getDefaultStatusId(statuses),
      // Seed extra fields for context-aware "Add" (e.g. parent_type +
      // parent_artifact when creating a child from an artifact's children tab).
      ...prefill,
    };
  }

  // TODO(confirm): field shapes against a real edit payload (parent linkage,
  // attachments list).
  return {
    ...artifactDefaultValues,
    task_type: artifact.task_type ?? preset,
    title: artifact.title ?? "",
    description: artifact.description ?? "",
    priority: artifact.priority?.id ?? "",
    status: artifact.status_detail?.id ?? "",
    developer: artifact.developer?.id ?? "",
    start_date: artifact.start_date ? new Date(artifact.start_date) : null,
    target_date: artifact.target_date ? new Date(artifact.target_date) : null,
    story_point: artifact.story_point ?? "",
    acceptance_criteria: artifact.acceptance_criteria ?? "",
    implementation_plan: artifact.implementation_plan ?? "",
    implementation_approval: artifact.implementation_approval ?? "",
    parent_type: artifact.parent_type ?? "",
    parent_artifact: artifact.parent_artifact?.id ?? artifact.parent ?? "",
    attachments: artifact.attachments ?? [],
  };
};
