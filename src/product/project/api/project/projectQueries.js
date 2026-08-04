import { useParams } from "react-router-dom";
import { queryKeys } from "@/shared/services/api/queryKeys"
import { keepPreviousData, useInfiniteQuery, useQuery } from "@tanstack/react-query"
import {
  getArtifactHistory,
  getArtifactsList,
  getBoards,
  getProject,
  getProjectReport,
  getProjectStatuses,
  getProjectTimeline,
} from "./projectEndpoints"

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
  { searchData, filterStatus, page = 1, page_size = 10, type, developer } = {},
  options = {}
) => {
  const { projectId } = useParams();

  // `type` (task_type) is a query param like search/status/page, so it's just
  // another filter — it lives in `filters`, which already makes each type its own
  // cache entry and triggers a refetch when it changes.
  const filters = { searchData, filterStatus, page, page_size, type, developer };

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

// Infinite artifact-history feed for the current project route.
// Pages by incrementing `pagination.current_page` while `pagination.next` is set.
export const useArtifactHistory = (options = {}) => {
  const { projectId } = useParams();

  return useInfiniteQuery({
    queryKey: queryKeys.projects.history(projectId),
    queryFn: ({ pageParam = 1 }) =>
      getArtifactHistory({ projectId, page: pageParam }),
    initialPageParam: 1,
    enabled: !!projectId,
    getNextPageParam: (lastPage) => {
      const pagination = lastPage?.pagination;
      if (!pagination?.next) return undefined;
      return (pagination.current_page || 1) + 1;
    },
    ...options,
  });
};


export const useProjectReport = (filters = {}, options = {}) => {
  const { projectId } = useParams();
  return useQuery({
    queryKey: queryKeys.projects.report(projectId, filters),
    queryFn: () => getProjectReport(projectId, filters),
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

export const useProjectTimeline = (filters = {}, options = {}) => {
  const { projectId } = useParams();
  return useQuery({
    queryKey: queryKeys.projects.timeline(projectId, filters),
    queryFn: () => getProjectTimeline(projectId, filters),
    enabled: !!projectId,
    placeholderData: keepPreviousData,
    ...options,
  });
};
