import { useState } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { useIsMobile } from "@/shared/hooks/use-mobile";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/shared/components/ui/sheet";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/shared/components/ui/drawer";
import { useNotifications } from "../hooks/useNotifications";
import NotificationPanel from "./NotificationPanel";

const HEADER_TITLE = "Notifications";
const HEADER_SUBTITLE = "Stay on top of activity across your workspace.";

// Bell trigger + notification drawer.
// Desktop -> right-side Sheet; mobile -> bottom Drawer. Same panel body in both.
const NotificationDrawer = () => {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  const notifications = useNotifications();

  const trigger = (
    <Button variant="ghost" size="icon" className="relative" aria-label="Open notifications">
      <Bell />
      {notifications.counts.unread > 0 && (
        <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-primary ring-2 ring-background" />
      )}
    </Button>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>{trigger}</DrawerTrigger>
        <DrawerContent className="max-h-[85vh]">
          <DrawerHeader className="border-b text-left">
            <DrawerTitle>{HEADER_TITLE}</DrawerTitle>
            <DrawerDescription>{HEADER_SUBTITLE}</DrawerDescription>
          </DrawerHeader>
          <NotificationPanel {...notifications} />
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
        <SheetHeader className="border-b">
          <SheetTitle>{HEADER_TITLE}</SheetTitle>
          <SheetDescription>{HEADER_SUBTITLE}</SheetDescription>
        </SheetHeader>
        <NotificationPanel {...notifications} />
      </SheetContent>
    </Sheet>
  );
};

export default NotificationDrawer;
