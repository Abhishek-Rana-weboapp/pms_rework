import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { ChevronDown, Clock, Download, Search } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { DatePicker } from "@/shared/components/ui/date-picker";
import { Input } from "@/shared/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Spinner } from "@/shared/components/ui/spinner";
import SectionWrapper from "@/shared/components/wrappers/SectionWrapper";
import Wrapper from "@/shared/components/wrappers/Wrapper";
import { createFullName, groupLogsByDate } from "@/shared/lib/helpers";
import { useAuditLogs, useUsers } from "../api/settingsQueries";
import { MODULES } from "../config.js/auditLogsData";

// Sentinel for the "no filter" option in the Radix selects — Radix reserves the
// empty string, so we use this and map it back to "" when building the query.
const ALL = "all";

const AuditLogs = () => {
  const [exportOpen, setExportOpen] = useState(false);
  const [filters, setFilters] = useState({
    startDate: null,
    endDate: null,
    user: "",
    module: "",
    search: "",
  });

  // Translate the UI filter state into the query params the endpoint expects.
  // Dates go out as yyyy-MM-dd; empty values are omitted so the key stays stable.
  const queryFilters = useMemo(() => {
    const params = {};
    if (filters.startDate) params.start_date = format(filters.startDate, "yyyy-MM-dd");
    if (filters.endDate) params.end_date = format(filters.endDate, "yyyy-MM-dd");
    if (filters.user) params.user = filters.user;
    if (filters.module) params.module = filters.module;
    if (filters.search) params.search = filters.search;
    return params;
  }, [filters]);

  const {
    data,
    isLoading,
    isError,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useAuditLogs(queryFilters);

  const logs = useMemo(
    () => data?.pages.flatMap((page) => page.results ?? []) ?? [],
    [data],
  );

  const groupedLogs = useMemo(() => {
    const sorted = [...logs].sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at),
    );
    return groupLogsByDate(sorted);
  }, [logs]);

  const updateFilter = (patch) => setFilters((prev) => ({ ...prev, ...patch }));

  return (
    <Wrapper className="space-y-5">
      <Header logs={logs} exporting={exportOpen} setExporting={setExportOpen} />

      <FilterSection filters={filters} updateFilter={updateFilter} />

      <LogsSection
        groupedLogs={groupedLogs}
        isLoading={isLoading}
        isError={isError}
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        onLoadMore={fetchNextPage}
      />
    </Wrapper>
  );
};

export default AuditLogs;

const Header = ({ logs, exporting, setExporting }) => {
  // Client-side CSV export of the logs currently loaded for the active filters.
  const handleExport = () => {
    if (!logs.length) {
      toast.error("No logs to export.");
      return;
    }
    try {
      setExporting(true);
      const escape = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
      const headers = ["Time", "Message", "Performed By", "Module", "Action"];
      const rows = logs.map((log) => [
        new Date(log.created_at).toLocaleString(),
        log.message,
        log.actor_name,
        log.module,
        log.action,
      ]);
      const csv = [headers, ...rows]
        .map((row) => row.map(escape).join(","))
        .join("\n");

      const url = URL.createObjectURL(
        new Blob([csv], { type: "text/csv;charset=utf-8;" }),
      );
      const link = document.createElement("a");
      link.href = url;
      link.download = `audit-logs-${format(new Date(), "yyyy-MM-dd")}.csv`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success("Audit logs exported.");
    } catch {
      toast.error("Failed to export audit logs.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <SectionWrapper className="flex items-center justify-between gap-4">
      <div className="space-y-1">
        <h1 className="text-lg font-semibold">Audit Logs</h1>
        <p className="text-sm text-muted-foreground">
          System-generated record of all organization activities.
        </p>
      </div>

      <Button onClick={handleExport} disabled={exporting}>
        {exporting ? <Spinner /> : <Download />}
        Export Logs
      </Button>
    </SectionWrapper>
  );
};

const FilterSection = ({ filters, updateFilter }) => {
  const [searchInput, setSearchInput] = useState(filters.search);
  const { data: users } = useUsers();
  const userList = users ?? [];

  // Debounce the search box into the committed filters.
  useEffect(() => {
    if (searchInput === filters.search) return;
    const timer = setTimeout(() => updateFilter({ search: searchInput }), 400);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  return (
    <SectionWrapper className="flex flex-wrap items-end gap-4">
      {/* Date range */}
      <Field label="Date Range" className="min-w-64 flex-1">
        <div className="flex items-center gap-2">
          <DatePicker
            value={filters.startDate ?? undefined}
            onChange={(date) =>
              updateFilter({ startDate: date ?? null, endDate: null })
            }
            placeholder="From"
            calendarProps={{ disabled: { after: new Date() } }}
            className="flex-1"
          />
          <span className="shrink-0 text-sm text-muted-foreground">–</span>
          <DatePicker
            value={filters.endDate ?? undefined}
            onChange={(date) => updateFilter({ endDate: date ?? null })}
            placeholder="To"
            calendarProps={{
              disabled: {
                after: new Date(),
                ...(filters.startDate ? { before: filters.startDate } : {}),
              },
            }}
            className="flex-1"
          />
        </div>
      </Field>

      {/* Performed by */}
      <Field label="Performed By">
        <Select
          value={filters.user || ALL}
          onValueChange={(value) =>
            updateFilter({ user: value === ALL ? "" : value })
          }
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All users" />
          </SelectTrigger>
          <SelectContent position="popper">
            <SelectItem value={ALL}>All users</SelectItem>
            {userList.map((user) => (
              <SelectItem key={user.id} value={String(user.id)}>
                {createFullName(user) || user.email}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      {/* Module */}
      <Field label="Module">
        <Select
          value={filters.module || ALL}
          onValueChange={(value) =>
            updateFilter({ module: value === ALL ? "" : value })
          }
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All modules" />
          </SelectTrigger>
          <SelectContent position="popper">
            <SelectItem value={ALL}>All modules</SelectItem>
            {MODULES.map((module) => (
              <SelectItem key={module.value} value={module.value}>
                {module.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      {/* Search */}
      <Field label="Search" className="min-w-56 flex-1">
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by keyword or entity name..."
            className="pl-8"
          />
        </div>
      </Field>
    </SectionWrapper>
  );
};

// Small labelled control wrapper so every filter shares the same rhythm.
const Field = ({ label, className, children }) => (
  <div className={`space-y-1.5 ${className ?? ""}`}>
    <label className="text-xs font-medium text-muted-foreground">{label}</label>
    {children}
  </div>
);

const LogsSection = ({
  groupedLogs,
  isLoading,
  isError,
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
}) => {
  const groups = Object.entries(groupedLogs);

  if (isLoading) {
    return (
      <SectionWrapper className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
        <Spinner /> Loading audit logs...
      </SectionWrapper>
    );
  }

  if (isError) {
    return (
      <SectionWrapper className="py-16 text-center text-sm text-muted-foreground">
        Couldn't load audit logs. Please try again.
      </SectionWrapper>
    );
  }

  if (groups.length === 0) {
    return (
      <SectionWrapper className="py-16 text-center text-sm text-muted-foreground">
        No audit logs found for the selected filters.
      </SectionWrapper>
    );
  }

  return (
    <div className="space-y-6">
      {groups.map(([heading, logs]) => (
        <section key={heading} className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground">
            {heading}
          </h2>
          <div className="space-y-2">
            {logs.map((log) => (
              <LogItem key={log.id} log={log} />
            ))}
          </div>
        </section>
      ))}

      {hasNextPage && (
        <div className="flex justify-center pt-2">
          <Button
            variant="outline"
            onClick={() => onLoadMore()}
            disabled={isFetchingNextPage}
          >
            {isFetchingNextPage ? <Spinner /> : <ChevronDown />}
            Load more entries
          </Button>
        </div>
      )}
    </div>
  );
};

const LogItem = ({ log }) => {
  const time = new Date(log.created_at).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <SectionWrapper className="flex items-start gap-4 transition-shadow hover:shadow-md">
      <span className="flex shrink-0 items-center gap-1.5 pt-0.5 text-xs text-muted-foreground tabular-nums">
        <Clock className="size-3.5" />
        {time}
      </span>

      <div className="min-w-0 space-y-1.5">
        <p className="text-sm font-medium wrap-break-word">{log.message}</p>
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          {log.actor_name && (
            <span className="font-medium text-foreground">{log.actor_name}</span>
          )}
          {log.module && <Badge variant="secondary">{log.module}</Badge>}
          {log.action && <Badge variant="cloud">{log.action}</Badge>}
        </div>
      </div>
    </SectionWrapper>
  );
};
