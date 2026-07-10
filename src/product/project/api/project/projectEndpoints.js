import api from "@/shared/services/api/axios"

export const getProject = async(projectId)=>{
    const res = await api.get(`project/${projectId}`)
    return res.data.data
}

export const createProject = async(data)=>{
  const res = await api.post(`project/`, data);
  return res.data.data
}



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

