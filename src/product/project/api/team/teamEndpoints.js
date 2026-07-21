import api from "@/shared/services/api/axios"

export const getTeam = async(projectId)=>{
  const res = await api.get(`project/${projectId}/team/`)
  return res.data?.data?.results
}