import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useParams } from "react-router-dom"
import { toast } from "sonner"
import { queryKeys } from "@/shared/services/api/queryKeys"
import { createProject, moveArtifact, updateProject } from "./projectEndpoints"

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


export const useUpdateProject = (options = {}) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: updateProject,
        ...options,
        onSuccess: (data, variables, ...rest) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
            if (variables?.id) {
                queryClient.invalidateQueries({
                    queryKey: queryKeys.projects.detail(variables.id),
                });
            }
            options.onSuccess?.(data, variables, ...rest);
        },
    });
};


// Immutably re-order the board cache: pull artifact `id` out of `fromColumnId`
// and drop it into `toColumnId` at `position`. Mirrors the server move so the
// optimistic cache matches what the board will look like after the request.
const applyBoardMove = (board, { id, fromColumnId, toColumnId, position }) => {
    if (!board?.columns) return board;

    const columns = board.columns.map((c) => ({ ...c, items: [...(c.items || [])] }));
    const from = columns.find((c) => String(c.status_id) === String(fromColumnId));
    const to = columns.find((c) => String(c.status_id) === String(toColumnId));
    if (!from || !to) return board;

    const idx = from.items.findIndex((it) => it.id === id);
    if (idx === -1) return board;

    const [item] = from.items.splice(idx, 1);
    item.status_details = { id: to.status_id, status_name: to.status_name };
    to.items.splice(position, 0, item);

    return { ...board, columns };
};

// Move an artifact across board columns, optimistically. Variables:
// { id, status, position, fromColumnId, toColumnId } — `status` is the
// destination status_id sent to the API; the rest drive the local cache update.
export const useMoveArtifact = (options = {}) => {
    const queryClient = useQueryClient();
    const { projectId } = useParams();
    const boardsKey = queryKeys.boards.all(projectId);

    return useMutation({
        mutationFn: ({ id, status, position }) =>
            moveArtifact({ id, status, position }),
        ...options,
        onMutate: async (variables) => {
            await queryClient.cancelQueries({ queryKey: boardsKey });
            const previous = queryClient.getQueryData(boardsKey);
            queryClient.setQueryData(boardsKey, (board) =>
                applyBoardMove(board, variables),
            );
            return { previous };
        },
        onError: (error, _variables, ctx) => {
            if (ctx?.previous) queryClient.setQueryData(boardsKey, ctx.previous);
            const errors = error?.response?.data?.errors;
            const message =
                (Array.isArray(errors) && errors[0]) ||
                error?.response?.data?.message ||
                "Failed to move task.";
            toast.error(message);
        },
        onSettled: () =>
            queryClient.invalidateQueries({ queryKey: boardsKey }),
    });
};
