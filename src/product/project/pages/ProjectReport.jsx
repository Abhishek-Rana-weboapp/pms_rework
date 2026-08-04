import { useState } from "react";

import { Button } from "@/shared/components/ui/button";
import SectionWrapper from "@/shared/components/wrappers/SectionWrapper";
import { useSprints } from "../api/backlog/backlogQueries";
import { useProjectReport } from "../api/project/projectQueries";
import { useGetTeams } from "../api/team/teamQueries";
import BurndownChart from "../components/report/BurndownChart";
import CycleTimeChart from "../components/report/CycleTimeChart";
import {
  EMPTY_FILTERS,
  GROUP_BY_OPTIONS,
} from "../components/report/reportConstants";
import {
  buildReportParams,
  transformBurndown,
  transformCycleTime,
  transformTaskReport,
  transformVelocity,
  transformWorkload,
} from "../components/report/reportTransformers";
import ReportFilters from "../components/report/ReportFilters";
import {
  ReportKeyInsights,
  ReportSummaryCards,
} from "../components/report/ReportSummaryCards";
import TaskReportChart from "../components/report/TaskReportChart";
import VelocityChart from "../components/report/VelocityChart";
import WorkloadBreakdownChart from "../components/report/WorkloadBreakdownChart";

const ProjectReport = () => {
  const [groupByLabel, setGroupByLabel] = useState("Monthly");
  const [filters, setFilters] = useState(EMPTY_FILTERS);

  const params = buildReportParams({
    groupBy: groupByLabel.toLowerCase(),
    filters,
  });

  const { data: report, isLoading, isError, isFetching } =
    useProjectReport(params);
  const { data: sprintsRes } = useSprints();
  const { data: team = [] } = useGetTeams();

  const sprints = sprintsRes?.data ?? [];
  const loading = isLoading || isFetching;

  const taskData = transformTaskReport(report);
  const velocityData = transformVelocity(report);
  const burndownData = transformBurndown(report);
  const cycleData = transformCycleTime(report);
  const workloadData = transformWorkload(report);
  const counts = report?.count ?? {};
  const insights = report?.key_insights;

  const taskAxisLabels = {
    x: report?.task_report?.x_axis || "Time",
    y: report?.task_report?.y_axis || "Tasks Completed",
  };

  const resetFilters = () => {
    setFilters(EMPTY_FILTERS);
    setGroupByLabel("Monthly");
  };

  return (
    <div className="flex h-full min-h-0 flex-col gap-4 overflow-auto">
      <SectionWrapper className="shrink-0">
        <h3 className="font-semibold">Project Reports</h3>
        <p className="text-sm text-muted-foreground">
          Analyze progress, velocity, and work trends for this project.
        </p>
      </SectionWrapper>

      <ReportFilters
        filters={filters}
        onChange={setFilters}
        onReset={resetFilters}
        sprints={sprints}
        members={team}
      />

      {isError && (
        <SectionWrapper>
          <p className="text-sm text-destructive">
            Couldn't load project report. Please try again.
          </p>
        </SectionWrapper>
      )}

      <ReportSummaryCards count={counts} isLoading={isLoading} />

      <TaskReportChart
        data={taskData}
        axisLabels={taskAxisLabels}
        isLoading={loading}
        actions={
          <div className="flex gap-1">
            {GROUP_BY_OPTIONS.map((option) => (
              <Button
                key={option}
                type="button"
                size="sm"
                variant={groupByLabel === option ? "default" : "outline"}
                onClick={() => setGroupByLabel(option)}
              >
                {option}
              </Button>
            ))}
          </div>
        }
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <VelocityChart data={velocityData} isLoading={loading} />
        <BurndownChart data={burndownData} isLoading={loading} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <CycleTimeChart data={cycleData} isLoading={loading} />
        <WorkloadBreakdownChart
          data={workloadData}
          total={report?.workload_breakdown_chart?.total ?? 0}
          isLoading={loading}
        />
      </div>

      <ReportKeyInsights
        insights={insights}
        wipCount={counts.wip_count}
        isLoading={isLoading}
      />
    </div>
  );
};

export default ProjectReport;
