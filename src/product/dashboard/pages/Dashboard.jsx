import React from "react";
import { useDashboard } from "../api/queries";
import DashboardSummaryCards from "../components/cards/DashboardSummaryCards";

import SectionWrapper from "@/shared/components/wrappers/SectionWrapper";
import DashboardTimelineBar from "../components/cards/DashboardTimelineBar";
import DashboardRecentProjectSection from "../components/DashboardRecentProjectSection";
import DashboardTopPerformersSection from "../components/DashboardTopPerformersSection";
import PortfolioHealthSection from "../components/PortfolioHealthSection";
import ResourceUtilizationSection from "../components/ResourceUtilizationSection";
import { Spinner } from "@/shared/components/ui/spinner";
import { Button } from "@/shared/components/ui/button";

const Dashboard = () => {
  const { data: dashboardData, isLoading, error, refetch } = useDashboard();

  console.log(dashboardData);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full w-full">
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
    <div className="p-4 space-y-5">
      {/* Summary Cards Section */}
      <div className="grid lg:grid-cols-4 grid-cols-2 gap-4">
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

      {/* Project Deliverables Timeline Section */}

      <SectionWrapper>
        <h3 className="font-medium mb-4">Project Deliverables Timeline</h3>

        <div className="flex flex-col">
          {dashboardData &&
            dashboardData?.timeline_cards?.map((item, i) => (
              <DashboardTimelineBar key={i} item={item} index={i} />
            ))}
        </div>
      </SectionWrapper>

      <div className="grid md:grid-cols-2 grid-cols-1 gap-4 gap-y-5">
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
