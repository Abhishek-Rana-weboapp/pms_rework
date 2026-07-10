import api from "@/shared/services/api/axios";

// TODO(api): confirm these paths with the backend. Guessed from the app's
// kebab-case convention (e.g. `project-type/`, `global-status/`).
const NOTIFICATIONS_URL = "notification/";

// GET paginated notifications. Returns the raw `results` array; normalization
// happens in the query's `select` so the cache mirrors the server shape.
export const getNotifications = async () => {
  const res = await api.get(`/notifications/`);
  return res.data?.data?.results ?? [];
};

// Mark a single notification read. `id` is the notification uuid.
export const markNotificationRead = async (id) => {
  const res = await api.patch(`${NOTIFICATIONS_URL}${id}/`, { is_read: true });
  return res.data;
};

// Mark every notification read.
export const markAllNotificationsRead = async () => {
  const res = await api.post(`${NOTIFICATIONS_URL}mark-all-read/`);
  return res.data;
};
