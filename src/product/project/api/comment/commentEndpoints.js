import api from "@/shared/services/api/axios";

const unwrap = (response) => response.data?.data ?? response.data;

export const getComments = async ({ projectId, artifactId }) => {
  const response = await api.get("comments/", {
    params: { project: projectId, artifact: artifactId },
  });
  return unwrap(response);
};

export const createComment = async (formData) => {
  const response = await api.post("comments/", formData);
  return unwrap(response);
};

export const updateComment = async ({ id, formData }) => {
  const response = await api.put(`comments/${id}/`, formData);
  return unwrap(response);
};

export const deleteComment = async (id) => {
  await api.delete(`comments/${id}/`);
  return id;
};
