import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/shared/services/api/queryKeys";
import { markAllNotificationsRead, markNotificationRead } from "./notificationsEndpoints";

const listKey = queryKeys.notifications.list();

// Mark one notification read, with an optimistic cache update.
// `id` is the notification uuid (matches `raw.uuid`).
export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markNotificationRead,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: listKey });
      const previous = queryClient.getQueryData(listKey);
      queryClient.setQueryData(listKey, (rows) =>
        rows?.map((n) => (n.uuid === id ? { ...n, is_read: true } : n))
      );
      return { previous };
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(listKey, ctx.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: listKey }),
  });
};

// Mark all notifications read, with an optimistic cache update.
export const useMarkAllNotificationsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markAllNotificationsRead,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: listKey });
      const previous = queryClient.getQueryData(listKey);
      queryClient.setQueryData(listKey, (rows) =>
        rows?.map((n) => (n.is_read ? n : { ...n, is_read: true }))
      );
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(listKey, ctx.previous);
      toast.error("Couldn't mark notifications as read.");
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: listKey }),
  });
};
