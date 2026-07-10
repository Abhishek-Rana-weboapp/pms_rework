import { cn } from "@/shared/lib/utils";
import { NOTIFICATION_TYPES, DEFAULT_TYPE, formatRelativeTime } from "../config/notifications.config";

const NotificationItem = ({ notification, onClick }) => {
  const { icon: Icon, className } = NOTIFICATION_TYPES[notification.type] ?? DEFAULT_TYPE;

  return (
    <button
      type="button"
      onClick={() => onClick?.(notification)}
      className={cn(
        "flex w-full items-start gap-3 border-b px-4 py-3 text-left transition-colors hover:bg-muted/50",
        !notification.read && "bg-primary/[0.03]"
      )}
    >
      <span className={cn("mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg", className)}>
        <Icon className="size-4" />
      </span>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-foreground">{notification.title}</p>
        {notification.body && (
          <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{notification.body}</p>
        )}
        <p className="mt-1 text-xs text-muted-foreground/70">
          {formatRelativeTime(notification.createdAt)}
        </p>
      </div>

      {!notification.read && (
        <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" aria-label="Unread" />
      )}
    </button>
  );
};

export default NotificationItem;
