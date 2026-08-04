import React from "react";
import { useDashboard } from "../api/queries";
import DashboardSummaryCards from "../components/cards/DashboardSummaryCards";

import SectionWrapper from "@/shared/components/wrappers/SectionWrapper";
import DashboardTimelineBar from "../components/cards/DashboardTimelineBar";
import DashboardRecentProjectSection from "../components/DashboardRecentProjectSection";
import DashboardTopPerformersSection from "../components/DashboardTopPerformersSection";
import PortfolioHealthSection from "../components/PortfolioHealthSection";
import ResourceUtilizationSection from "../components/ResourceUtilizationSection";
import DashboardChartsSection from "../components/DashboardChartsSection";
import { Spinner } from "@/shared/components/ui/spinner";
import { Button } from "@/shared/components/ui/button";

const Dashboard = () => {
  const { data: dashboardData, isLoading, error, refetch } = useDashboard();

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <div>Failed to Load Dashboard Data</div>
        <Button onClick={refetch}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-5 p-4">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {dashboardData &&
          Object.keys(dashboardData?.top_cards)?.map((key) => {
            return (
              <DashboardSummaryCards
                key={key}
                title={key}
                value={dashboardData.top_cards[key]}
              />
            );
          })}
      </div>

      <SectionWrapper>
        <h3 className="mb-4 font-medium">Project Deliverables Timeline</h3>

        <div className="flex flex-col">
          {dashboardData &&
            dashboardData?.timeline_cards?.map((item, i) => (
              <DashboardTimelineBar key={i} item={item} index={i} />
            ))}
        </div>
      </SectionWrapper>

      <div className="w-full min-w-0">
        <DashboardChartsSection charts={dashboardData?.dashboard_charts ?? []} />
      </div>

      <div className="grid grid-cols-1 gap-4 gap-y-5 md:grid-cols-2">
        <DashboardRecentProjectSection
          recentProjects={dashboardData?.recent_projects}
        />
        <DashboardTopPerformersSection
          topPerformers={dashboardData?.top_performers}
        />
        <PortfolioHealthSection data={dashboardData.portfolio_health} />
        <ResourceUtilizationSection data={dashboardData.resource_utilization} />
      </div>
    </div>
  );
};

export default Dashboard;
