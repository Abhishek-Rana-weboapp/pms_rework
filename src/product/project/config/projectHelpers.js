import { projectDefaultValues } from "./projectSchema";

// Find an option by id (either side may be a number or a string).
const findById = (options = [], value) =>
  options.find((o) => String(o.id) === String(value)) || null;

// Resolve a project's stored project_type to the matching option from the
// project-types list. `projectType` may be the option id, the project_type
// name, or an already-expanded option object. Returns the option or null.
export const mapProjectType = (projectType, projectTypeOptions = []) => {
  if (projectType == null) return null;
  if (typeof projectType === "object") return projectType;

  return (
    projectTypeOptions.find(
      (option) =>
        String(option.id) === String(projectType) ||
        option.project_type === projectType,
    ) || null
  );
};

// Resolve a project's stored priority (id OR display name) to the option.
export const mapPriority = (priority, priorityOptions = []) => {
  if (priority == null) return null;
  if (typeof priority === "object") return priority;

  return (
    findById(priorityOptions, priority) ||
    priorityOptions.find((option) => option.priority === priority) ||
    null
  );
};

// Build the form's default values from a project returned by the API.
//
// The option lists are needed because the API can hand back project_type /
// priority as either an id or a display name, while the <Select>s work in option
// ids. Resolving here — before the form mounts — is what lets each Select show
// its value on the first paint. `options` = { projectTypes, priorities }.
export const extractPrefilledProjectData = (
  project,
  { projectTypes = [], priorities = [] } = {},
) => {
  if (!project) return projectDefaultValues;

  const typeMatch = mapProjectType(project.project_type, projectTypes);
  const priorityMatch = mapPriority(project.priority, priorities);

  // Manager/client arrive as ids, directly or nested under *_details.
  const managerId = project.manager_details?.id ?? project.manager;
  const clientVal = project.client ?? project.client_details?.id;

  return {
    // Start from defaults so the form only ever holds its own fields (no stray
    // server-only keys leak into form state) and every input stays controlled.
    ...projectDefaultValues,
    project_name: project.project_name || "",
    project_type: typeMatch ? String(typeMatch.id) : "",
    priority: priorityMatch ? String(priorityMatch.id) : "",
    description: project.description || "",
    start_date: project.start_date ? new Date(project.start_date) : null,
    end_date: project.end_date ? new Date(project.end_date) : null,
    manager: managerId != null ? String(managerId) : "",
    client: clientVal != null ? String(clientVal) : "",
    // Existing attachments aren't re-uploaded; the Dropzone starts empty and only
    // newly-added files go up on save.
    attachments: [],
  };
};
