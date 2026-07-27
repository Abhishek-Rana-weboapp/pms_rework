import api from "@/shared/services/api/axios";

export const getSprints = async (projectId) => {
  const res = await api.get(`projects/${projectId}/sprints/`);
  return res.data;
};

export const getBacklog = async (projectId) => {
  const res = await api.get(`project/${projectId}/artifact-backlog/`);
  return res.data;
};

export const moveBacklogItem = async (projectId, sprintId, artifactIds) => {
  const res = await api.put(
    `projects/${projectId}/sprints/${sprintId}/assign_artifacts/`,
    { artifact_ids: [...artifactIds] },
  );
  return res.data;
};

export const removeBacklogItem = async (projectId, sprintId, artifactIds) => {
  const res = await api.put(
    `projects/${projectId}/sprints/${sprintId}/remove_artifacts/`,
    { artifact_ids: [...artifactIds] },
  );
  return res.data;
};

export const createSprint = async (projectId, data) => {
  const res = await api.post(`projects/${projectId}/sprints/`, data);
  return res.data;
};

export const updateSprint = async (projectId, data) => {
  const res = await api.put(
    `projects/${projectId}/sprints/${data?.id}/`,
    data,
  );
  return res.data;
};

export const deleteSprint = async (projectId, sprintId) => {
  const res = await api.delete(
    `projects/${projectId}/sprints/${sprintId}/`,
  );
  return res.data;
};

export const activateSprint = async (projectId, sprintId) => {
  const res = await api.put(
    `projects/${projectId}/sprints/${sprintId}/activate/`,
  );
  return res.data;
};
