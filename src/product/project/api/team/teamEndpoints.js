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