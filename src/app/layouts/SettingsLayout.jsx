import DashboardHeader from "@/product/dashboard/components/DashboardHeader";
import SettingsSidebar from "@/product/settings/components/SettingsSidebar";
import { SidebarInset, SidebarProvider } from "@/shared/components/ui/sidebar";
import { Spinner } from "@/shared/components/ui/spinner";
import { TooltipProvider } from "@/shared/components/ui/tooltip";
import React, { Suspense } from "react";
import { Outlet } from "react-router-dom";

const SettingsLayout = () => {
  return (
    <SidebarProvider>
      <TooltipProvider>
        <div className="h-dvh flex w-full overflow-hidden bg-slate-50">
          <SettingsSidebar />
          <SidebarInset className="flex-1 min-h-0">
            <div className="shrink-0">
              <DashboardHeader />
            </div>
            {/* Outlet area doesn't scroll; each page scrolls its own content. */}
            <div className="min-h-0 flex-1 w-full overflow-hidden  bg-slate-100">
              <Suspense fallback={<Spinner />}>
                <Outlet />
              </Suspense>
            </div>
          </SidebarInset>
        </div>
      </TooltipProvider>
    </SidebarProvider>
  );
};

export default SettingsLayout;
