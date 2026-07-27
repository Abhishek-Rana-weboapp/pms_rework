import api from "@/shared/services/api/axios"

export const getProject = async(projectId)=>{
    const res = await api.get(`project/${projectId}`)
    return res.data.data
}

export const createProject = async(data)=>{
  const res = await api.post(`project/`, data);
  return res.data.data
}


// Edit an existing project. Sends multipart FormData (so new attachments can
// ride along); the axios client sets the multipart content-type automatically.
export const updateProject = async ({ id, formData }) => {
  const res = await api.put(`project/${id}/`, formData);
  return res.data.data;
};



export const getArtifactsList = async ({
  projectId,
  searchData,
  filterStatus,
  page,
  page_size,
  type,
} = {}) => {
  if (!projectId) {
    throw new Error("projectId is required");
  }

  const params = {
    ...(searchData && { search: searchData }),
    ...(filterStatus && { status: filterStatus }),
    ...(type && { task_type: type }),
    ...(page !== undefined && { page }),
    ...(page_size !== undefined && { page_size }),
  };

  const res = await api.get(`project/${projectId}/artifacts/`, { params });
  return res.data?.data;
};



export const getProjectStatuses = async (projectId) => {
    const res  = await api.get(`project-status/?project_id=${projectId}`);
    return res.data?.data?.results;
}

// Create a project-scoped status (board column).
// Legacy shape: POST project-status/ with { ...fields, project, category }.
export const createProjectStatus = async ({ projectId, ...data }) => {
    const res = await api.post(`project-status/`, {
        ...data,
        project: projectId,
        category:
            typeof data.category === "object"
                ? data.category?.value
                : data.category,
    });
    return res.data?.data;
};

// Update an existing project-scoped status.
// Legacy shape: PUT project-status/:id/ with { ...fields, project, category }.
export const updateProjectStatus = async ({ id, projectId, ...data }) => {
    const res = await api.put(`project-status/${id}/`, {
        ...data,
        id,
        project: projectId,
        category:
            typeof data.category === "object"
                ? data.category?.value
                : data.category,
    });
    return res.data?.data;
};



// Board = the active sprint's columns (statuses) + their artifacts (items),
// plus sprint_details. Shape: { columns: [{ status_id, status_name, items }], sprint_details }.
export const getBoards = async (projectId) => {
    const res = await api.get(`project/${projectId}/board/`);
    return res.data?.data ?? {};
};

// Persist a drag: move artifact `id` to `status` (a status_id) at `position`
// (its index within the destination column).
export const moveArtifact = async ({ id, status, position }) => {
    const res = await api.patch(`artifact/${id}/move/`, { status, position });
    return res.data?.data;
};

