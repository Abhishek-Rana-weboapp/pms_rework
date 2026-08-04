import { useEffect, useMemo, useState } from "react";

import { Spinner } from "@/shared/components/ui/spinner";
import SectionWrapper from "@/shared/components/wrappers/SectionWrapper";
import { useProjectTimeline } from "../api/project/projectQueries";
import TimelineFilters from "../components/timeline/TimelineFilters";
import TimelineGantt from "../components/timeline/TimelineGantt";
import {
  buildGanttTasksFromPayload,
  buildTimelineParams,
} from "../components/timeline/timelineTransformers";

const Timeline = () => {
  const [view, setView] = useState("monthly");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(timer);
  }, [search]);

  const params = useMemo(
    () =>
      buildTimelineParams({
        view,
        search: debouncedSearch,
        typeFilter,
        statusFilter,
      }),
    [view, debouncedSearch, typeFilter, statusFilter],
  );

  const { data, isLoading, isError, isFetching } = useProjectTimeline(params);

  const { tasks: ganttTasks, range } = useMemo(
    () => buildGanttTasksFromPayload(data),
    [data],
  );

  const loading = isLoading || isFetching;

  return (
    <div className="flex h-full min-h-0 flex-col gap-4 overflow-hidden">
      <SectionWrapper className="shrink-0">
        <div className="mb-4">
          <h3 className="font-semibold">Timeline</h3>
          <p className="text-sm text-muted-foreground">
            Hierarchical view of project artifacts across time.
          </p>
        </div>

        <TimelineFilters
          search={search}
          onSearchChange={setSearch}
          typeFilter={typeFilter}
          onTypeChange={setTypeFilter}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          view={view}
          onViewChange={setView}
        />
      </SectionWrapper>

      <SectionWrapper className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {isError ? (
          <p className="py-16 text-center text-sm text-destructive">
            Couldn&apos;t load timeline data. Please try again.
          </p>
        ) : loading && ganttTasks.length === 0 ? (
          <div className="flex flex-1 items-center justify-center gap-2 text-sm text-muted-foreground">
            <Spinner /> Loading timeline…
          </div>
        ) : ganttTasks.length === 0 ? (
          <p className="py-16 text-center text-sm text-muted-foreground">
            No artifacts match the current filters.
          </p>
        ) : (
          <div className="min-h-0 flex-1">
            <TimelineGantt tasks={ganttTasks} view={view} range={range} />
          </div>
        )}
      </SectionWrapper>
    </div>
  );
};

export default Timeline;
