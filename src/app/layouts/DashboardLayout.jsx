import DashboardHeader from "@/product/dashboard/components/DashboardHeader";
import DashboardSideBar from "@/product/dashboard/components/DashboardSideBar";
import { ProjectFormDialogProvider } from "@/product/project/context/ProjectFormDialogContext";
import { useGlobalStatus, usePriorities, useProjectTypes } from "@/product/settings/api/settingsQueries";
import PageFallback from "@/shared/components/PageFallback";
import { SidebarInset, SidebarProvider } from "@/shared/components/ui/sidebar";
import { TooltipProvider } from "@/shared/components/ui/tooltip";
import { Suspense } from "react";
import { Outlet, useLocation } from "react-router-dom";

const DashboardLayout = () => {

  useProjectTypes();
  useGlobalStatus();
  usePriorities();

  const { pathname } = useLocation();
  const sectionKey = pathname.split("/").filter(Boolean)[1] ?? "index";

  return (
    <SidebarProvider>
      <TooltipProvider delayDuration={600}>
        <div className="h-dvh flex w-full bg-slate-50 overflow-hidden">
          <DashboardSideBar />
          <SidebarInset className="flex-1 min-w-0 min-h-0 flex flex-col">
            <DashboardHeader />
            <div className="flex-1 min-w-0 min-h-0 overflow-y-auto bg-slate-50">
              <ProjectFormDialogProvider>
                <Suspense key={sectionKey} fallback={<PageFallback />}>
                  <Outlet />
                </Suspense>
              </ProjectFormDialogProvider>
            </div>
          </SidebarInset>
        </div>
      </TooltipProvider>
    </SidebarProvider>
  );
};

export default DashboardLayout;
