import { useMutation, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/shared/services/api/queryKeys";
import {
  createComment,
  deleteComment,
  updateComment,
} from "./commentEndpoints";

const useCommentMutation = (mutationFn, projectId, artifactId, options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    ...options,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.comments.list(projectId, artifactId),
      });
      options.onSuccess?.(...args);
    },
  });
};

export const useCreateComment = (projectId, artifactId, options) =>
  useCommentMutation(createComment, projectId, artifactId, options);

export const useUpdateComment = (projectId, artifactId, options) =>
  useCommentMutation(updateComment, projectId, artifactId, options);

export const useDeleteComment = (projectId, artifactId, options) =>
  useCommentMutation(deleteComment, projectId, artifactId, options);
