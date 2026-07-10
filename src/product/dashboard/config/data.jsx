// Sidebar nav config. `to` holds the path SEGMENT only (no leading slash, no org).

import { ChartColumn, Folder, Home, IdCardLanyard, Share2, Users } from "lucide-react";

// The org is prepended at render time from the URL, so this config stays org-agnostic.
export const SideBarItems = [
  { title: "Dashboard", to: "", icon: <Home className="size-4" /> },
  { title: "Employees", to: "employees", icon: <Users className="size-4" /> },
  { title: "Clients", to: "clients", icon: <IdCardLanyard className="size-4" /> },
  { title: "Projects", to: "projects", icon: <Folder className="size-4" /> },
  { title: "Reports", to: "reports", icon: <ChartColumn className="size-4" /> },
];
