import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";

import { queryKeys } from "@/shared/services/api/queryKeys";
import { getTeam, getTimeLogs } from "./teamEndpoints";

export const useGetTeams = (options = {}) => {
  const { projectId } = useParams();
  return useQuery({
    queryKey: queryKeys.team.all(projectId),
    queryFn: () => getTeam(projectId),
    staleTime: Infinity,
    ...options,
  });
};

export const useGetTimeLogs = (
  { page = 1, page_size = 20 } = {},
  options = {},
) => {
  const { projectId } = useParams();
  const filters = { page, page_size };

  return useQuery({
    queryKey: queryKeys.timeLog.list(projectId, filters),
    queryFn: () => getTimeLogs({ projectId, ...filters }),
    enabled: !!projectId,
    placeholderData: keepPreviousData,
    ...options,
  });
};
