import { BellOff } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { Spinner } from "@/shared/components/ui/spinner";
import { Tabs, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import NotificationItem from "./NotificationItem";
import { useNavigate, useParams } from "react-router-dom";

const CountPill = ({ children }) => (
  <span className="ml-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-muted-foreground/15 px-1 text-[10px] font-semibold text-muted-foreground">
    {children}
  </span>
);

// The shared body used inside both the desktop Sheet and the mobile Drawer:
// tab switcher, the count / "mark all as read" bar, and the scrollable list.
const NotificationPanel = ({ filtered, tab, setTab, counts, markAllRead, markRead, isLoading, isError }) => {
  const { orgUuid } = useParams();
  const navigate = useNavigate();
  const handleClick = (notification) =>{
    if(notification.notification_type === "mention_comment"){
      navigate(`/${orgUuid}/projects/${notification.project_details.id}/artifacts/${notification.timelog_id}`);
    }
  }
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="px-4 pt-3">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="w-full">
            <TabsTrigger value="all" className="flex-1">
              All
            </TabsTrigger>
            <TabsTrigger value="unread" className="flex-1">
              Unread
              {counts.unread > 0 && <CountPill>{counts.unread}</CountPill>}
            </TabsTrigger>
            <TabsTrigger value="mentions" className="flex-1">
              Mentions
              {counts.mentions > 0 && <CountPill>{counts.mentions}</CountPill>}
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="flex items-center justify-between px-4 py-2.5 text-xs">
        <span className="text-muted-foreground">
          {filtered.length} {filtered.length === 1 ? "notification" : "notifications"}
        </span>
        <button
          type="button"
          onClick={markAllRead}
          disabled={counts.unread === 0}
          className={cn(
            "font-medium text-primary transition-colors hover:underline",
            counts.unread === 0 && "pointer-events-none opacity-40"
          )}
        >
          Mark all as read
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex h-full items-center justify-center py-16">
            <Spinner className="size-6 text-muted-foreground" />
          </div>
        ) : isError ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 px-6 py-16 text-center">
            <BellOff className="size-8 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">Couldn't load notifications.</p>
          </div>
        ) : filtered.length ? (
          filtered.map((n) => (
            <NotificationItem key={n.id} notification={n} onClick={markRead} />
          ))
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 px-6 py-16 text-center">
            <BellOff className="size-8 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">You're all caught up.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationPanel;
