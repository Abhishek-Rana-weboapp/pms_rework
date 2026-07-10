import { useMutation, useQueryClient } from "@tanstack/react-query"
import { queryKeys } from "@/shared/services/api/queryKeys"
import { createProject } from "./projectEndpoints"

export const useCreateProject = (options = {}) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createProject,
        ...options,
        onSuccess: (...args) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
            options.onSuccess?.(...args);
        },
    });
};
