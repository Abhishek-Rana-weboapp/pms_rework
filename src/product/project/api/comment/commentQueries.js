import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/shared/services/api/queryKeys";
import { getComments } from "./commentEndpoints";

export const useComments = ({ projectId, artifactId }, options = {}) =>
  useQuery({
    queryKey: queryKeys.comments.list(projectId, artifactId),
    queryFn: () => getComments({ projectId, artifactId }),
    enabled: Boolean(projectId && artifactId),
    ...options,
  });
