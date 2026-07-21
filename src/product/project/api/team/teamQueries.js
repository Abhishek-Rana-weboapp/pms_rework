import { queryKeys } from "@/shared/services/api/queryKeys";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { getTeam } from "./teamEndpoints";

export const useGetTeams = ( options = {} ) => {
  const { projectId } = useParams();
  return useQuery({
    queryKey: queryKeys.team.all(projectId),
    queryFn:()=>getTeam(projectId),
    staleTime:Infinity,
    ...options
  });
};
