import {
  buildArtifactColumns,
  DEFAULT_ARTIFACT_COLUMNS,
} from "./artifactColumns";

// "user_story" -> "User Story", "spike" -> "Spike".
export const humanize = (type = "") =>
  type
    .split("_")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

/**
 * Per-artifact-type configuration, keyed by the UPPERCASE backend `task_type`.
 *
 * Each entry declares only what's unique to that type:
 * - `label` / `addLabel` — page heading + create button copy.
 * - `columns(deps)`       — table columns. Pass an ORDERED array of builder keys
 *                           to buildArtifactColumns; the array order is the
 *                           column order, so adding/removing/reordering columns
 *                           is pure config. `deps` (onEdit, onDelete, …) is
 *                           forwarded to builders that need handlers.
 * - `emptyMessage`        — empty-state copy.
 * - `permission`          — reserved for RBAC (nothing reads it yet). When
 *                           permissions land, the page gate + tab visibility
 *                           read this single field. Keep it in sync per type.
 */
export const artifactConfig = {
  EPIC: {
    label: "Epic",
    addLabel: "Add Epic",
    permission: "",
    columns: (deps) =>
      buildArtifactColumns([...DEFAULT_ARTIFACT_COLUMNS, "priority", "actions"], {
        titleHeader: "Epic Title",
        ...deps,
      }),
    emptyMessage: "No epics yet.",
  },
  USER_STORY: {
    label: "User Story",
    addLabel: "Add Story",
    permission: "",
    // Different order + an extra column, all from config: story points sit right
    // after the title, project moves after developer.
    columns: (deps) =>
      buildArtifactColumns(
        ["id", "title", "storyPoint", "developer", "project", "status"],
        { titleHeader: "Story Title", ...deps },
      ),
    emptyMessage: "No stories yet.",
  },
  TASK: {
    label: "Task",
    addLabel: "Add Task",
    permission: "",
    columns: (deps) =>
      buildArtifactColumns(DEFAULT_ARTIFACT_COLUMNS, {
        titleHeader: "Task Title",
        ...deps,
      }),
    emptyMessage: "No tasks yet.",
  },
  SPIKE: {
    label: "Spike",
    addLabel: "Add Spike",
    permission: "",
    columns: (deps) =>
      buildArtifactColumns(DEFAULT_ARTIFACT_COLUMNS, {
        titleHeader: "Spike Title",
        ...deps,
      }),
    emptyMessage: "No spikes yet.",
  },
  ISSUE: {
    label: "Issue",
    addLabel: "Add Issue",
    permission: "",
    columns: (deps) =>
      buildArtifactColumns(DEFAULT_ARTIFACT_COLUMNS, {
        titleHeader: "Issue Title",
        ...deps,
      }),
    emptyMessage: "No Issues yet.",
  },
  TEST: {
    label: "Test",
    addLabel: "Add Test",
    permission: "",
    columns: (deps) =>
      buildArtifactColumns(DEFAULT_ARTIFACT_COLUMNS, {
        titleHeader: "Test Title",
        ...deps,
      }),
    emptyMessage: "No tests yet.",
  },
};

/**
 * Resolves the config for a route artifact type. `type` is the lowercase route
 * segment (e.g. "user_story"); it's uppercased to match the backend task_type.
 * Types not yet configured fall back to the default columns so the page renders
 * instead of crashing.
 */
export const getArtifactConfig = (type = "") => {
  const key = type.toUpperCase();
  return (
    artifactConfig[key] ?? {
      label: humanize(type),
      addLabel: `Add ${humanize(type)}`,
      permission: "",
      columns: (deps) =>
        buildArtifactColumns(DEFAULT_ARTIFACT_COLUMNS, {
          titleHeader: "Title",
          ...deps,
        }),
      emptyMessage: "No artifacts yet.",
    }
  );
};




