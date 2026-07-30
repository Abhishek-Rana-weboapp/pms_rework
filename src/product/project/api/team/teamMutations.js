import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { toast } from "sonner";

import { queryKeys } from "@/shared/services/api/queryKeys";
import { assignDevelopers } from "./teamEndpoints";

/**
 * Assign the project's developers. Takes the FULL list of developer ids that
 * should end up on the team, because the endpoint replaces rather than appends.
 *
 * Invalidates the team list, the project detail (its `devlopers_details` embed)
 * and the employee list, since availability can change with the assignment.
 */
export const useAssignDevelopers = (options = {}) => {
  const queryClient = useQueryClient();
  const { projectId } = useParams();

  return useMutation({
    mutationFn: (developerIds) =>
      assignDevelopers({ projectId, developerIds }),
    ...options,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.team.all(projectId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.projects.detail(projectId),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.employees.all });
      options.onSuccess?.(...args);
    },
    onError: (error, ...rest) => {
      if (!options.onError) {
        const errors = error?.response?.data?.errors;
        const message =
          (Array.isArray(errors) && errors[0]) ||
          error?.response?.data?.message ||
          "Failed to assign developer(s). Please try again.";
        toast.error(message);
      }
      options.onError?.(error, ...rest);
    },
  });
};
