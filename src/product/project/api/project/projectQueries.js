import { useParams } from "react-router-dom";
import { queryKeys } from "@/shared/services/api/queryKeys"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { getArtifactsList, getProject, getProjectStatuses } from "./projectEndpoints"

export const useProject = (projectId, options={})=>{
    return useQuery({
        queryKey:queryKeys.projects.detail(),
        queryFn:()=>getProject(projectId)
    })
}

export const useCurrentProject = (options = {}) => {
  const { projectId } = useParams();
  return useProject(projectId, options);
};


export const useArtifacts = (
  { searchData, filterStatus, page = 1, page_size = 10, type } = {},
  options = {}
) => {
  const { projectId } = useParams();

  const filters = { searchData, filterStatus, page, page_size, type };

  return useQuery({
    queryKey: queryKeys.artifacts.list(projectId, filters),
    queryFn: () => getArtifactsList({ projectId, ...filters }),
    enabled: !!projectId,
    placeholderData: keepPreviousData,
    ...options,
  });
};



export const useProjectStatuses = (projectId)=>{
  return useQuery({
    queryKey:queryKeys.projectStatus.all(projectId),
    queryFn:getProjectStatuses,
    enabled:!!projectId
  })
}
