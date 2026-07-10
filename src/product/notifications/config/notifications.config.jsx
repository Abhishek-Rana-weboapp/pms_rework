import { AtSign, CheckCircle2, ShieldAlert, ShieldCheck, Settings, UserPlus } from "lucide-react";

// Visual config per notification type. When the API lands, its `type` field
// should map onto one of these keys so the icon/color stay consistent.
export const NOTIFICATION_TYPES = {
  mention: {
    icon: AtSign,
    className: "bg-indigo-50 text-indigo-500",
  },
  task: {
    icon: CheckCircle2,
    className: "bg-emerald-50 text-emerald-500",
  },
  member: {
    icon: UserPlus,
    className: "bg-emerald-50 text-emerald-500",
  },
  security: {
    icon: ShieldAlert,
    className: "bg-red-50 text-red-500",
  },
  permission: {
    icon: ShieldCheck,
    className: "bg-slate-100 text-slate-500",
  },
  system: {
    icon: Settings,
    className: "bg-slate-100 text-slate-500",
  },
};

export const DEFAULT_TYPE = NOTIFICATION_TYPES.system;

// Maps the backend `notification_type` enum onto the internal keys above.
// NOTE: only PROJECT_ASSIGN is confirmed from the API so far — the rest are
// sensible guesses. Add/adjust as the backend's full enum list is confirmed.
// Anything not listed here falls back to the neutral "system" icon.
export const TYPE_MAP = {
  PROJECT_ASSIGN: "task",
  PROJECT_UNASSIGN: "task",
  TASK_ASSIGN: "task",
  ARTIFACT_ASSIGN: "task",
  MENTION: "mention",
  COMMENT: "mention",
  COMMENT_MENTION: "mention",
  MEMBER_ADDED: "member",
  MEMBER_JOINED: "member",
  PERMISSION_UPDATE: "permission",
  ROLE_UPDATE: "permission",
  SECURITY_ALERT: "security",
  LOGIN_ALERT: "security",
};

export const resolveType = (notificationType) => TYPE_MAP[notificationType] ?? "system";

// Normalize a raw API notification into the shape the drawer UI consumes.
export const normalizeNotification = (n) => ({
  id: n.uuid ?? String(n.id),
  type: resolveType(n.notification_type),
  title: n.title,
  body: n.message,
  createdAt: n.created_at,
  read: Boolean(n.is_read),
  sender: n.sender_details,
  raw: n,
});

// Format a timestamp into the compact "2m ago" / "Yesterday" style shown in the
// design. Accepts anything `new Date()` understands.
export function formatRelativeTime(value) {
  const then = new Date(value).getTime();
  if (Number.isNaN(then)) return "";

  const diff = Math.max(0, Date.now() - then);
  const min = Math.floor(diff / 60000);
  const hr = Math.floor(diff / 3600000);
  const day = Math.floor(diff / 86400000);

  if (min < 1) return "Just now";
  if (min < 60) return `${min}m ago`;
  if (hr < 24) return `${hr}h ago`;
  if (day === 1) return "Yesterday";
  return `${day} days ago`;
}
