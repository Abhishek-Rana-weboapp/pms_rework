import api from "@/shared/services/api/axios"


export const getSprints = async(projectId)=>{
    const res = await api.get(`projects/${projectId}/sprints/`)
    return res.data;
}


export const getBacklog = async(projectId)=>{
    const res = await api.get(`project/${projectId}/artifact-backlog/`)
    return res.data;
}