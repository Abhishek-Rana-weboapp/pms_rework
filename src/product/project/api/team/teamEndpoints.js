import api from "@/shared/services/api/axios"

export const getTeam = async(projectId)=>{
  const res = await api.get(`project/${projectId}/team/`)
  return res.data?.data?.results
}

// Sets the project's developer list. NOTE: the API REPLACES the team rather than
// appending, so `developerIds` must contain every member who should remain —
// callers are responsible for including the ones already assigned.
export const assignDevelopers = async ({ projectId, developerIds }) => {
  const res = await api.put(`project/${projectId}/`, {
    assign_developers: developerIds,
  });
  return res.data?.data;
};


// Project timelog feed. Shape:
// { pagination, results: { summary, logs_by_date: [{ date, total_hours, logs }] } }.
export const getTimeLogs = async ({ projectId, page = 1, page_size = 20 } = {}) => {
  if (!projectId) throw new Error("projectId is required");
  const res = await api.get(`project/${projectId}/time-logs/`, {
    params: { page, page_size },
  });
  return res.data?.data ?? {};
};