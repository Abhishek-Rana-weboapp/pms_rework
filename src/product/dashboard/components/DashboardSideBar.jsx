import { NavLink, useParams } from "react-router-dom";
import WAD_LOGO from "@/assets/images/WAD_LOGO-BG.png";
import { SideBarItems } from "../config/data";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/shared/components/ui/sidebar";

const DashboardSideBar = () => {
  const { orgUuid } = useParams();

  return (
    <Sidebar collapsible="icon" className={"bg-white"}>
      <SidebarHeader className="p-4 group-data-[collapsible=icon]:p-2 group-data-[collapsible=icon]:pt-3.5 ">
        <NavLink to={`/${orgUuid}`} end>
          <img
            src={WAD_LOGO}
            className="h-auto w-28 object-contain transition-[width] duration-75 ease-linear group-data-[collapsible=icon]:h-10 origin-center"
            alt="WAD"
          />
        </NavLink>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {SideBarItems.map((item) => {
                // Build the absolute path from the current org. Strip the trailing
                // slash so Home ("") resolves to /:orgUuid and not /:orgUuid/.
                const to = `/${orgUuid}/${item.to}`.replace(/\/$/, "");

                return (
                  <SidebarMenuItem key={item.to}>
                    <SidebarMenuButton
                      asChild
                      tooltip={item.title}
                      className="h-10 text-gray-600 hover:bg-primary/10 hover:text-primary aria-[current=page]:bg-primary/10 aria-[current=page]:border-l-4 transition aria-[current=page]:border-primary  aria-[current=page]:text-primary aria-[current=page]:font-medium"
                    >
                      <NavLink to={to} end={item.to === ""}>
                        {item.icon}
                        <span>{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default DashboardSideBar;
  