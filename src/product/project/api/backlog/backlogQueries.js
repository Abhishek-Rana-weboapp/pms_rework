import { queryKeys } from "@/shared/services/api/queryKeys"
import { useQuery } from "@tanstack/react-query"
import { useParams } from "react-router-dom"
import { getBacklog, getSprints } from "./backlogEndpoints";


export const useSprints = ()=>{
    const {projectId} = useParams();
    return useQuery({
        queryKey:queryKeys.sprints.all,
        queryFn:()=>getSprints(projectId),
        enabled:!!projectId
    })
}


export const useBacklog = ()=>{
    const {projectId} = useParams();
    return useQuery({
        queryKey:queryKeys.backlog.all,
        queryFn:()=>getBacklog(projectId),
        enabled:!!projectId
    })
}