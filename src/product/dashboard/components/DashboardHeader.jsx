import { useState } from "react";
import { NavLink, useLocation, useParams } from "react-router-dom";
import { ChevronDown, Power, Settings } from "lucide-react";

import { useAuth } from "@/app/providers/AuthContext";
import NotificationDrawer from "@/product/notifications/components/NotificationDrawer";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/components/ui/alert-dialog";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";
import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { SidebarTrigger } from "@/shared/components/ui/sidebar";
import { createFullName, createInitials } from "@/shared/lib/helpers";
import { SideBarItems } from "../config/data";

const DashboardHeader = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const { orgUuid } = useParams();
  const [logoutOpen, setLogoutOpen] = useState(false);

  // The path segment after the org identifies the active tab ("" = Home).
  const segment = location.pathname
    .replace(`/${orgUuid}`, "")
    .replace(/^\//, "");
  const segmentSplit = segment.split("/")[0];
  const currentTitle =
    SideBarItems.find((item) => item.to === segmentSplit)?.title || "";

  return (
    <header className="w-full py-3 shadow px-2 border-b">
      <div className="flex items-center justify-between">
        <div className="flex gap-1 items-center">
          <SidebarTrigger />
          <h1 className="text-lg font-medium">{currentTitle}</h1>
        </div>

        <div className="flex items-center gap-1 px-2">
          <NotificationDrawer />

          <NavLink to={`/${orgUuid}/profile-settings`}>
            <Settings />
          </NavLink>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="group">
                <Avatar>
                  <AvatarImage src={user?.user_image} />
                  <AvatarFallback>{createInitials(user)}</AvatarFallback>
                </Avatar>
                <ChevronDown className="transition-transform duration-200 ease-in group-data-[state=open]:rotate-180" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="w-max max-w-76">
              <DropdownMenuGroup>
                <div className="flex items-center gap-2 px-2.5 py-1">
                  <Avatar>
                    <AvatarImage src={user?.user_image} />
                    <AvatarFallback className="text-black">
                      {createInitials(user)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start">
                    <p className="text-sm">{createFullName(user)}</p>
                    <p className="text-xs text-gray-600">{user?.username}</p>
                  </div>
                </div>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem
                  variant="destructive"
                  // Dropdown closes before the dialog can mount; open on the
                  // next tick so the confirm dialog isn't dismissed with it.
                  onSelect={() => {
                    requestAnimationFrame(() => setLogoutOpen(true));
                  }}
                >
                  <Power />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <AlertDialog open={logoutOpen} onOpenChange={setLogoutOpen}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Sign out?</AlertDialogTitle>
            <AlertDialogDescription>
              You will need to sign in again to continue using the app.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={logout}>
              Sign Out
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </header>
  );
};

export default DashboardHeader;
