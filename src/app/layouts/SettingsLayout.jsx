import DashboardHeader from "@/product/dashboard/components/DashboardHeader";
import SettingsSidebar from "@/product/settings/components/SettingsSidebar";
import PageFallback from "@/shared/components/PageFallback";
import { SidebarInset, SidebarProvider } from "@/shared/components/ui/sidebar";
import { TooltipProvider } from "@/shared/components/ui/tooltip";
import { Suspense } from "react";
import { Outlet, useLocation } from "react-router-dom";

const SettingsLayout = () => {
  // Path shape: /:orgUuid/profile-settings/<section>/... — key the Suspense by
  // that top-level <section> so a sidebar navigation mounts a FRESH boundary and
  // React shows the fallback immediately (React Router runs navigations as
  // transitions, which otherwise keep the old page on screen while the next
  // chunk loads). Keying by section rather than the full pathname keeps deeper
  // in-section navigation (e.g. a user detail) from needlessly remounting.
  const { pathname } = useLocation();
  const sectionKey = pathname.split("/").filter(Boolean)[2] ?? "index";

  return (
    <SidebarProvider>
      <TooltipProvider>
        <div className="h-dvh flex w-full overflow-hidden bg-slate-50">
          <SettingsSidebar />
          <SidebarInset className="flex-1 min-h-0 min-w-0">
            <div className="shrink-0">
              <DashboardHeader />
            </div>
            {/* Outlet area doesn't scroll; each page scrolls its own content. */}
            <div className="min-h-0 flex-1 w-full overflow-hidden  bg-slate-100">
              <Suspense key={sectionKey} fallback={<PageFallback />}>
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
