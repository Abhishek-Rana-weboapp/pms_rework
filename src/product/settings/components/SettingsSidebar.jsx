import { NavLink, useParams } from "react-router-dom";
import WAD_LOGO from "@/assets/images/WAD_LOGO-BG.png";
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
import { settingsSidebarItems } from "../config.js/SettingsSidebarData";

const SettingsSidebar = () => {
  const { orgUuid } = useParams();

  return (
    <Sidebar collapsible="icon" className={"bg-white"}>
      <SidebarHeader className="p-4 group-data-[collapsible=icon]:p-2 group-data-[collapsible=icon]:pt-8 ">
        <NavLink to={`/${orgUuid}`} end>
          <img
            src={WAD_LOGO}
            className="h-auto w-28 object-contain transition-[width] duration-200 ease-linear group-data-[collapsible=icon]:w-8"
            alt="WAD"
          />
        </NavLink>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {settingsSidebarItems.map((item) => {
                const to = `/${orgUuid}/profile-settings/${item.to}`.replace(/\/$/, "");

                return (
                   <SidebarMenuItem key={item.to}>
                    <SidebarMenuButton
                      asChild
                      tooltip={item.title}
                      className="h-10 text-gray-600 hover:bg-primary/10 hover:text-primary aria-[current=page]:bg-primary/10 aria-[current=page]:border-l-4 transition aria-[current=page]:border-primary  aria-[current=page]:text-primary aria-[current=page]:font-medium"
                    >
                      <NavLink
                        to={to}
                        end={item.to === ""}
                        onMouseEnter={item.prefetch}
                        onFocus={item.prefetch}
                      >
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

export default SettingsSidebar;

// import { NavLink, useParams } from "react-router-dom";
// import WAD_LOGO from "@/assets/images/WAD_LOGO-BG.png";
// import { SideBarItems } from "../config/data";

// const DashboardSideBar = () => {
//   const { orgUuid } = useParams();

//   return (
//     <div className="w-full max-w-64 p-4 bg-white shadow">
//       <nav className="flex flex-col gap-8">
//         <NavLink className={""}>
//           <img src={WAD_LOGO} className="object-cover max-w-28" alt="" />
//         </NavLink>

//         <div className="flex flex-col gap-1">
//           {SideBarItems.map((item) => {
//             // Build the absolute path from the current org. Strip the trailing
//             // slash so Home ("") resolves to /:orgUuid and not /:orgUuid/.
//             const to = `/${orgUuid}/${item.to}`.replace(/\/$/, "");

//             return (
//               <NavLink
//                 key={item.to}
//                 to={to}
//                 end={item.to === ""}
//                 className={({ isActive }) =>
//                   `rounded-md px-3 py-2 text-sm flex items-center gap-2 font-medium transition-colors ${
//                     isActive
//                       ? "bg-primary/20 text-primary"

//                       : "text-muted-foreground hover:bg-muted"
//                   }`
//                 }
//               >
//                 {item.icon}{item.title}
//               </NavLink>
//             );
//           })}
//         </div>
//       </nav>
//     </div>
//   );
// };

// export default DashboardSideBar;
