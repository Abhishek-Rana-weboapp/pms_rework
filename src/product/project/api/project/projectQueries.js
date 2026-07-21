import { useParams } from "react-router-dom";
import { queryKeys } from "@/shared/services/api/queryKeys"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { getArtifactsList, getBoards, getProject, getProjectStatuses } from "./projectEndpoints"

export const useProject = (projectId, options={})=>{
    return useQuery({
        queryKey:queryKeys.projects.detail(projectId),
        queryFn:()=>getProject(projectId),
        ...options
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

  // `type` (task_type) is a query param like search/status/page, so it's just
  // another filter — it lives in `filters`, which already makes each type its own
  // cache entry and triggers a refetch when it changes.
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
    // Wrapped in an arrow: passing getProjectStatuses directly would hand it
    // React Query's context object instead of the id (-> project_id=[object Object]).
    queryFn:()=>getProjectStatuses(projectId),
    enabled:!!projectId
  })
}


// Active-sprint board for the current project route. Reads projectId from the
// URL (like useArtifacts) so pages don't have to thread it through.
export const useBoards = (options = {}) => {
  const { projectId } = useParams();
  return useQuery({
    queryKey: queryKeys.boards.all(projectId),
    queryFn: () => getBoards(projectId),
    enabled: !!projectId,
    ...options,
  });
};
