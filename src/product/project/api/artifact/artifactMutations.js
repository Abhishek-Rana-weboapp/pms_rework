import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useParams } from "react-router-dom";
import { createArtifact, updateArtifact } from "./artifactEndpoints"
import { queryKeys } from "@/shared/services/api/queryKeys";

// projectId comes from the route (same pattern as useMoveArtifact), so callers
// just do: createMutation.mutate(payload)
export const useCreateArtifact = (options = {}) => {
    const queryClient = useQueryClient();
    const { projectId } = useParams();
    return useMutation({
        mutationFn: (payload) => createArtifact({ projectId, payload }),
        ...options,
        onSuccess: (...args) => {
            // "artifacts" is the root key — this catches lists AND details.
            queryClient.invalidateQueries({ queryKey: queryKeys.artifacts.all })
            options.onSuccess?.(...args);
        },
    })
}


// Callers do: updateMutation.mutate({ id, payload })
export const useUpdateArtifact = (options = {}) => {
    const queryClient = useQueryClient();
    return useMutation({
        // Endpoint already takes { id, payload }; no wrapper needed.
        mutationFn: updateArtifact,
        ...options,
        onSuccess: (...args) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.artifacts.all })
            options.onSuccess?.(...args);
        },
    })
}
