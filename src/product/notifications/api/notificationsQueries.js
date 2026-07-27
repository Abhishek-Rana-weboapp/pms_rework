import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/shared/services/api/queryKeys";
import { getNotifications } from "./notificationsEndpoints";
import { normalizeNotification } from "../config/notifications.config";

// Fetches notifications and normalizes each row into the UI shape.
// The cache holds the raw server rows; `select` maps them for the components,
// which keeps optimistic mutation updates (which patch raw rows) straightforward.
export const useNotificationsQuery = () =>
  useQuery({
    queryKey: queryKeys.notifications.list(),
    queryFn: getNotifications,
    select: (rows) => rows.map(normalizeNotification),
    staleTime: 60_000,
  });
