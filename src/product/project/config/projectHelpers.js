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

// Build the form's default values from a project returned by the API.
// Handles the shape differences the <ProjectForm> cares about: dates become
// Date objects (the pickers expect them) and project_type is resolved to the
// option id the <Select> uses. Any other fields pass through unchanged.
export const extractPrefilledProjectData = (project, projectTypeOptions = []) => {
  if (!project) return null;

  const { start_date, end_date, ...rest } = project;
  const matchedType = mapProjectType(project.project_type, projectTypeOptions);

  return {
    ...rest,
    start_date: start_date ? new Date(start_date) : null,
    end_date: end_date ? new Date(end_date) : null,
    project_type: matchedType ? matchedType.id : "",
  };
};
