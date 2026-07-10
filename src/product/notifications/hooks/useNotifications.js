import { useMemo, useState } from "react";
import { useNotificationsQuery } from "../api/notificationsQueries";
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
} from "../api/notificationsMutations";
import { useNotificationSocket } from "./useNotificationSocket";

// Composes the notifications query + mark-as-read mutations + tab state into the
// single interface the drawer consumes. Swapping data sources happens entirely
// in the API layer; this hook's return shape stays stable for the UI.
export function useNotifications() {
  const { data: items = [], isLoading, isError } = useNotificationsQuery();
  const [tab, setTab] = useState("all");

  // Live updates: pushed rows are merged into the same query cache.
  useNotificationSocket();

  const markReadMutation = useMarkNotificationRead();
  const markAllMutation = useMarkAllNotificationsRead();

  const counts = useMemo(
    () => ({
      unread: items.filter((n) => !n.read).length,
      mentions: items.filter((n) => n.type === "mention").length,
    }),
    [items]
  );

  const filtered = useMemo(() => {
    if (tab === "unread") return items.filter((n) => !n.read);
    if (tab === "mentions") return items.filter((n) => n.type === "mention");
    return items;
  }, [items, tab]);

  const markRead = (notification) => {
    if (!notification || notification.read) return;
    markReadMutation.mutate(notification.id);
  };

  const markAllRead = () => {
    if (counts.unread === 0) return;
    markAllMutation.mutate();
  };

  return { filtered, tab, setTab, counts, markAllRead, markRead, isLoading, isError };
}
