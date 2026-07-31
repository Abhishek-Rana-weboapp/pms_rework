import { useState } from "react";
import { Clock, DollarSign, ListCheck } from "lucide-react";

import { PaginationControls } from "@/shared/components/PaginationControls";
import { Spinner } from "@/shared/components/ui/spinner";
import SectionWrapper from "@/shared/components/wrappers/SectionWrapper";
import { cn } from "@/shared/lib/utils";
import { useGetTimeLogs } from "../api/team/teamQueries";
import TimelogTable, { flattenTimeLogs } from "../components/TimelogTable";

const PAGE_SIZE = 20;

const SUMMARY_CARDS = [
  {
    key: "daily_log_hours",
    label: "Daily Log Hours",
    icon: Clock,
    iconClass: "bg-sky-100 text-sky-600",
  },
  {
    key: "total_entries",
    label: "Total Entries",
    icon: ListCheck,
    iconClass: "bg-emerald-100 text-emerald-600",
  },
  {
    key: "billable_hours",
    label: "Billable Hours",
    icon: DollarSign,
    iconClass: "bg-amber-100 text-amber-600",
  },
];

const Timelog = () => {
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, isFetching } = useGetTimeLogs({
    page,
    page_size: PAGE_SIZE,
  });

  // API nests the feed under `results`; pagination sits beside it.
  const summary = data?.results?.summary ?? {};
  const rows = flattenTimeLogs(data?.results?.logs_by_date);
  const pageCount = data?.pagination?.total_pages ?? 1;
  const totalRecords = data?.pagination?.total_records ?? 0;

  return (
    <div className="flex h-full min-h-0 flex-col gap-2 overflow-hidden max-sm:gap-2 sm:gap-4">
      <SectionWrapper className="max-sm:p-2 shrink-0">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="font-semibold">Timelog</h3>
          {totalRecords > 0 && (
            <span className="text-xs text-muted-foreground">
              {totalRecords} entries
            </span>
          )}
        </div>
      </SectionWrapper>

      <div className="grid shrink-0 grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
        {SUMMARY_CARDS.map(({ key, label, icon: Icon, iconClass }) => (
          <SectionWrapper
            key={key}
            className="flex items-center justify-between gap-3 max-sm:p-3"
          >
            <div className="min-w-0 space-y-0.5">
              <p className="text-sm text-muted-foreground">{label}</p>
              <p className="text-lg font-semibold tabular-nums">
                {isLoading ? "—" : (summary[key] ?? "—")}
              </p>
            </div>
            <span className={`rounded-lg p-2 ${iconClass}`}>
              <Icon className="size-5" />
            </span>
          </SectionWrapper>
        ))}
      </div>

      <SectionWrapper className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div
          className={cn(
            "min-h-0 flex-1 overflow-auto transition-opacity",
            isFetching && !isLoading && "pointer-events-none opacity-60",
          )}
        >
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
              <Spinner /> Loading time logs…
            </div>
          ) : isError ? (
            <p className="py-16 text-center text-sm text-muted-foreground">
              Couldn't load time logs. Please try again.
            </p>
          ) : (
            <TimelogTable data={rows} />
          )}
        </div>

        <PaginationControls
          page={page}
          pageCount={pageCount}
          onPageChange={setPage}
          showWhenSinglePage
          className="mx-0 mt-3 w-auto shrink-0 justify-end"
        />
      </SectionWrapper>
    </div>
  );
};

export default Timelog;
