import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { addMonths, addWeeks } from "date-fns";

import { Button } from "@/shared/components/ui/button";
import { Spinner } from "@/shared/components/ui/spinner";
import SectionWrapper from "@/shared/components/wrappers/SectionWrapper";
import {
  useArtifacts,
  useProjectStatuses,
} from "../api/project/projectQueries";
import { useGetTeams } from "../api/team/teamQueries";
import CalendarFilters from "../components/calendar/CalendarFilters";
import CalendarMonthView from "../components/calendar/CalendarMonthView";
import CalendarWeekView from "../components/calendar/CalendarWeekView";
import { EMPTY_CALENDAR_FILTERS, TYPE_LEGEND } from "../components/calendar/calendarConstants";
import {
  formatMonthLabel,
  formatWeekRange,
  getWeekStart,
} from "../components/calendar/calendarUtils";

const ProjectCalendar = () => {
  const { projectId } = useParams();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentWeekStart, setCurrentWeekStart] = useState(
    getWeekStart(new Date()),
  );
  const [viewMode, setViewMode] = useState("month");
  const [filters, setFilters] = useState(EMPTY_CALENDAR_FILTERS);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const { data: artifactsData, isLoading, isError, isFetching } = useArtifacts({
    type: filters.task_type || undefined,
    filterStatus: filters.status || undefined,
    developer: filters.developer || undefined,
    page: 1,
    page_size: 1000,
  });

  const { data: statuses = [] } = useProjectStatuses(projectId);
  const { data: developers = [] } = useGetTeams();

  const artifacts = useMemo(
    () => artifactsData?.results ?? [],
    [artifactsData],
  );

  const loading = isLoading || isFetching;

  const changeMonth = (dir) => setCurrentDate((d) => addMonths(d, dir));
  const changeWeek = (dir) =>
    setCurrentWeekStart((d) => addWeeks(d, dir));

  return (
    <div className="flex h-full min-h-0 flex-col gap-4 overflow-auto">
      <SectionWrapper className="shrink-0">
        <div className="mb-4">
          <h3 className="font-semibold">Calendar</h3>
          <p className="text-sm text-muted-foreground">
            Month and week views of project artifacts by date range.
          </p>
        </div>

        <CalendarFilters
          filters={filters}
          onChange={setFilters}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          statuses={statuses}
          developers={developers}
        />
      </SectionWrapper>

      <SectionWrapper>
        <div className="mb-4 flex flex-col items-center justify-between gap-2 sm:flex-row sm:gap-0">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() =>
                viewMode === "month" ? changeMonth(-1) : changeWeek(-1)
              }
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h2 className="min-w-max text-sm font-semibold sm:text-base">
              {viewMode === "month"
                ? formatMonthLabel(year, month)
                : formatWeekRange(currentWeekStart)}
            </h2>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() =>
                viewMode === "month" ? changeMonth(1) : changeWeek(1)
              }
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
            {TYPE_LEGEND.map((item) => (
              <span key={item.label} className="flex items-center gap-1.5">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ background: item.color }}
                />
                {item.label}
              </span>
            ))}
          </div>
        </div>

        {isError ? (
          <p className="py-16 text-center text-sm text-destructive">
            Couldn&apos;t load calendar data. Please try again.
          </p>
        ) : loading && artifacts.length === 0 ? (
          <div className="flex items-center justify-center gap-2 py-24 text-sm text-muted-foreground">
            <Spinner /> Loading calendar…
          </div>
        ) : viewMode === "month" ? (
          <CalendarMonthView
            artifacts={artifacts}
            year={year}
            month={month}
          />
        ) : (
          <CalendarWeekView
            artifacts={artifacts}
            weekStart={currentWeekStart}
          />
        )}
      </SectionWrapper>
    </div>
  );
};

export default ProjectCalendar;
