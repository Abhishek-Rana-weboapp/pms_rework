import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { toast } from "sonner";

import { queryKeys } from "@/shared/services/api/queryKeys";
import {
  activateSprint,
  createSprint,
  deleteSprint,
  moveBacklogItem,
  removeBacklogItem,
  updateSprint,
} from "./backlogEndpoints";
import {
  applyBacklogMove,
  BACKLOG_COLUMN_ID,
} from "./backlogCache";

const invalidateBacklogData = (queryClient) => {
  queryClient.invalidateQueries({ queryKey: queryKeys.backlog.all });
  queryClient.invalidateQueries({ queryKey: queryKeys.sprints.all });
};

const getErrorMessage = (error, fallback) =>
  error?.response?.data?.message ||
  (Array.isArray(error?.response?.data?.errors) &&
    error.response.data.errors[0]) ||
  fallback;

const useOptimisticBacklogMove = ({
  mutationFn,
  options = {},
  successMessage,
  errorMessage,
}) => {
  const queryClient = useQueryClient();
  const sprintsKey = queryKeys.sprints.all;
  const backlogKey = queryKeys.backlog.all;

  return useMutation({
    mutationFn,
    ...options,
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: sprintsKey });
      await queryClient.cancelQueries({ queryKey: backlogKey });

      const previousSprints = queryClient.getQueryData(sprintsKey);
      const previousBacklog = queryClient.getQueryData(backlogKey);

      const { sprints, backlog } = applyBacklogMove(
        previousSprints,
        previousBacklog,
        variables,
      );

      queryClient.setQueryData(sprintsKey, sprints);
      queryClient.setQueryData(backlogKey, backlog);

      await options.onMutate?.(variables);

      return { previousSprints, previousBacklog };
    },
    onError: (error, variables, context) => {
      if (context?.previousSprints) {
        queryClient.setQueryData(sprintsKey, context.previousSprints);
      }
      if (context?.previousBacklog) {
        queryClient.setQueryData(backlogKey, context.previousBacklog);
      }
      toast.error(getErrorMessage(error, errorMessage));
      options.onError?.(error, variables, context);
    },
    onSuccess: (...args) => {
      toast.success(successMessage);
      options.onSuccess?.(...args);
    },
    onSettled: (...args) => {
      invalidateBacklogData(queryClient);
      options.onSettled?.(...args);
    },
  });
};

export const useMoveBacklogItem = (options = {}) => {
  const { projectId } = useParams();

  return useOptimisticBacklogMove({
    mutationFn: ({ sprintId, artifactIds }) =>
      moveBacklogItem(projectId, sprintId, artifactIds),
    successMessage: "Artifact moved successfully",
    errorMessage: "Failed to move artifact.",
    ...options,
  });
};

export const useRemoveBacklogItem = (options = {}) => {
  const { projectId } = useParams();

  return useOptimisticBacklogMove({
    mutationFn: ({ sprintId, artifactIds }) =>
      removeBacklogItem(projectId, sprintId, artifactIds),
    successMessage: "Artifact moved to backlog successfully",
    errorMessage: "Failed to move artifact to backlog.",
    ...options,
  });
};

export const useCreateSprint = (options = {}) => {
  const queryClient = useQueryClient();
  const { projectId } = useParams();

  return useMutation({
    mutationFn: (data) => createSprint(projectId, data),
    ...options,
    onSuccess: (...args) => {
      toast.success("Sprint created successfully");
      invalidateBacklogData(queryClient);
      options.onSuccess?.(...args);
    },
    onError: (error, ...rest) => {
      toast.error(getErrorMessage(error, "Failed to create sprint."));
      options.onError?.(error, ...rest);
    },
  });
};

export const useUpdateSprint = (options = {}) => {
  const queryClient = useQueryClient();
  const { projectId } = useParams();

  return useMutation({
    mutationFn: (data) => updateSprint(projectId, data),
    ...options,
    onSuccess: (...args) => {
      toast.success("Sprint updated successfully");
      invalidateBacklogData(queryClient);
      queryClient.invalidateQueries({
        queryKey: queryKeys.boards.all(projectId),
      });
      options.onSuccess?.(...args);
    },
    onError: (error, ...rest) => {
      toast.error(getErrorMessage(error, "Failed to update sprint."));
      options.onError?.(error, ...rest);
    },
  });
};

export const useDeleteSprint = (options = {}) => {
  const queryClient = useQueryClient();
  const { projectId } = useParams();

  return useMutation({
    mutationFn: (sprintId) => deleteSprint(projectId, sprintId),
    ...options,
    onSuccess: (...args) => {
      toast.success("Sprint deleted successfully");
      invalidateBacklogData(queryClient);
      options.onSuccess?.(...args);
    },
    onError: (error, ...rest) => {
      toast.error(getErrorMessage(error, "Failed to delete sprint."));
      options.onError?.(error, ...rest);
    },
  });
};

export const useStartSprint = (options = {}) => {
  const queryClient = useQueryClient();
  const { projectId } = useParams();

  return useMutation({
    mutationFn: (sprintId) => activateSprint(projectId, sprintId),
    ...options,
    onSuccess: (...args) => {
      toast.success("Sprint started successfully");
      invalidateBacklogData(queryClient);
      options.onSuccess?.(...args);
    },
    onError: (error, ...rest) => {
      toast.error(getErrorMessage(error, "Failed to start sprint."));
      options.onError?.(error, ...rest);
    },
  });
};

export { BACKLOG_COLUMN_ID };
