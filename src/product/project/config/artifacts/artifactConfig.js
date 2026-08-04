import { PERMISSIONS } from "@/product/auth/config/permissions";
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

/** Shared across every artifact type — override per type only if RBAC ever diverges. */
const ARTIFACT_PERMISSIONS = {
  permission: PERMISSIONS.ARTIFACT.VIEW,
  addPermission: PERMISSIONS.ARTIFACT.ADD,
  editPermission: PERMISSIONS.ARTIFACT.CHANGE,
  deletePermission: PERMISSIONS.ARTIFACT.DELETE,
};

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
 *
 * Permissions come from `ARTIFACT_PERMISSIONS` via `getArtifactConfig`.
 */
export const artifactConfig = {
  EPIC: {
    label: "Epic",
    addLabel: "Add Epic",
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
 * instead of crashing. Shared permissions are always merged in.
 */
export const getArtifactConfig = (type = "") => {
  const key = type.toUpperCase();
  const typeConfig = artifactConfig[key] ?? {
    label: humanize(type),
    addLabel: `Add ${humanize(type)}`,
    columns: (deps) =>
      buildArtifactColumns(DEFAULT_ARTIFACT_COLUMNS, {
        titleHeader: "Title",
        ...deps,
      }),
    emptyMessage: "No artifacts yet.",
  };

  return { ...ARTIFACT_PERMISSIONS, ...typeConfig };
};
