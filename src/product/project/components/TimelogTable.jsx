import { Fragment } from "react";
import {
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getGroupedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";
import { Badge } from "@/shared/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import {
  createFullName,
  createInitials,
  createInitialsFromSingleName,
} from "@/shared/lib/helpers";
import { cn } from "@/shared/lib/utils";
import { humanize } from "../config/artifacts/artifactConfig";
import ArtifactStatusBadge from "./ArtifactStatusBadge";

/**
 * Flatten API `logs_by_date` into leaf rows TanStack can group.
 * Accepts either an array of `{ date, total_hours|totalHours, logs|entries }`
 * or a date→group object map.
 */
export const flattenTimeLogs = (logsByDate) => {
  if (!logsByDate) return [];

  const groups = Array.isArray(logsByDate)
    ? logsByDate
    : Object.entries(logsByDate).map(([date, group]) => ({
        date,
        ...(group && typeof group === "object" ? group : { logs: [] }),
      }));

  return groups.flatMap((group) => {
    const date = group.date ?? group.log_date ?? "";
    const dateTotalHours =
      group.total_hours ?? group.totalHours ?? group.hours ?? "00:00";
    const logs = group.logs ?? group.entries ?? group.time_logs ?? [];

    return (Array.isArray(logs) ? logs : []).map((log, index) => ({
      ...log,
      // Stable React/TanStack id even if the API omits one.
      _rowId: String(log.id ?? `${date}-${index}`),
      date,
      dateTotalHours,
    }));
  });
};

const formatTimePeriod = (log) => {
  const start =
    log.start_time ?? log.startTime ?? log.from_time ?? log.time_from;
  const end = log.end_time ?? log.endTime ?? log.to_time ?? log.time_to;
  if (start && end) return `${start} - ${end}`;
  if (log.time_period || log.timePeriod) {
    return log.time_period || log.timePeriod;
  }
  return "—";
};

const getUser = (log) =>
  log.user ?? log.user_details ?? log.employee ?? log.created_by ?? null;

const getUserName = (log) => {
  const user = getUser(log);
  if (!user) return log.user_name ?? log.actor_name ?? "—";
  if (typeof user === "string") return user;
  return (
    createFullName(user) ||
    user.name ||
    user.full_name ||
    user.email ||
    "—"
  );
};

const billingBadgeClass = (value) => {
  const key = String(value ?? "").toLowerCase();
  if (key.includes("non")) return "bg-slate-100 text-slate-700";
  if (key.includes("bill")) return "bg-emerald-100 text-emerald-800";
  return "bg-secondary text-secondary-foreground";
};

const columns = [
  {
    id: "date",
    accessorKey: "date",
    header: () => null,
    cell: () => null,
    enableGrouping: true,
  },
  {
    id: "id",
    accessorFn: (row) => row.id ?? row.log_id ?? "—",
    header: "ID",
    cell: ({ getValue }) => {
      const value = getValue();
      if (value == null || value === "—") return "—";
      return String(value).padStart(2, "0");
    },
  },
  {
    id: "title",
    accessorFn: (row) =>
      row.title ?? row.log_title ?? row.description ?? row.task_title ?? "—",
    header: "Log Title",
    cell: ({ getValue }) => (
      <span className="font-medium text-foreground">{getValue()}</span>
    ),
  },
  {
    id: "hours",
    accessorFn: (row) =>
      row.hours ?? row.log_hours ?? row.duration ?? row.logged_hours ?? "—",
    header: "Log Hours",
    cell: ({ getValue }) => (
      <span className="font-medium text-primary tabular-nums">{getValue()}</span>
    ),
  },
  {
    id: "period",
    accessorFn: (row) => formatTimePeriod(row),
    header: "Time Period",
    cell: ({ getValue }) => (
      <span className="text-muted-foreground tabular-nums">{getValue()}</span>
    ),
  },
  {
    id: "user",
    accessorFn: (row) => getUserName(row),
    header: "User",
    cell: ({ row, getValue }) => {
      const name = getValue();
      const user = getUser(row.original);
      const avatar =
        user?.user_image ?? user?.avatar ?? user?.image ?? row.original.user_image;
      const initials =
        (user && typeof user === "object" && createInitials(user)) ||
        createInitialsFromSingleName(name) ||
        "?";

      return (
        <div className="flex min-w-0 items-center gap-2">
          <Avatar className="size-7 shrink-0">
            <AvatarImage src={avatar} alt={name} />
            <AvatarFallback className="text-[10px]">{initials}</AvatarFallback>
          </Avatar>
          <span className="truncate">{name}</span>
        </div>
      );
    },
  },
  {
    id: "billing",
    accessorFn: (row) =>
      row.billing_type ?? row.billingType ?? row.billable_type ?? row.billable,
    header: "Billing Type",
    cell: ({ getValue }) => {
      const value = getValue();
      if (value == null || value === "" || value === false) {
        return <span className="text-muted-foreground">—</span>;
      }
      const label =
        typeof value === "boolean"
          ? value
            ? "Billable"
            : "Non-billable"
          : String(value);
      return (
        <Badge className={cn("border-transparent", billingBadgeClass(label))}>
          {label}
        </Badge>
      );
    },
  },
  {
    id: "status",
    accessorFn: (row) =>
      row.status ??
      row.task_status ??
      row.status_name ??
      row.status_detail?.status_name,
    header: "Task Status",
    cell: ({ getValue, row }) => (
      <ArtifactStatusBadge
        status={getValue()}
        category={row.original.status_category ?? row.original.category}
      />
    ),
  },
  {
    id: "taskType",
    accessorFn: (row) =>
      row.task_type ?? row.artifact_type ?? row.type ?? row.taskType,
    header: "Task Type",
    cell: ({ getValue }) => {
      const value = getValue();
      if (!value) return <span className="text-muted-foreground">—</span>;
      return (
        <Badge variant="secondary">
          {humanize(String(value).toLowerCase())}
        </Badge>
      );
    },
  },
];

const leafColumnIds = columns
  .map((column) => column.id)
  .filter((id) => id !== "date");

/**
 * Date-grouped timelog table. Group headers span the full width (date left,
 * day total right); leaf rows use the column defs above.
 */
const TimelogTable = ({ data = [] }) => {
  // TanStack's table instance is mutable with a stable identity — opt out of
  // React Compiler memoisation so grouped/expanded row model stays fresh.
  "use no memo";

  const table = useReactTable({
    data,
    columns,
    getRowId: (row) => row._rowId,
    getCoreRowModel: getCoreRowModel(),
    getGroupedRowModel: getGroupedRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    // Keep `date` in the model for grouping, but never show it as a data
    // column — the group header owns that value.
    initialState: {
      grouping: ["date"],
      expanded: true,
    },
  });

  if (data.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-muted-foreground">
        No time logs yet.
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          {leafColumnIds.map((id) => {
            const header = table
              .getHeaderGroups()[0]
              ?.headers.find((item) => item.column.id === id);
            if (!header) return null;
            return (
              <TableHead
                key={header.id}
                className="text-xs font-medium uppercase text-muted-foreground"
              >
                {flexRender(
                  header.column.columnDef.header,
                  header.getContext(),
                )}
              </TableHead>
            );
          })}
        </TableRow>
      </TableHeader>

      <TableBody>
        {table.getRowModel().rows.map((row) => {
          if (!row.getIsGrouped()) return null;

          const totalHours =
            row.subRows[0]?.original?.dateTotalHours ?? "00:00";

          return (
            <Fragment key={row.id}>
              <TableRow className="border-border bg-sky-50/70 hover:bg-sky-50/70">
                <TableCell
                  colSpan={leafColumnIds.length}
                  className="py-3"
                >
                  <div className="flex items-center justify-between gap-4 px-1">
                    <span className="font-semibold text-foreground">
                      {row.getValue("date")}
                    </span>
                    <span className="font-medium text-xs text-primary tabular-nums">
                      {totalHours} hours
                    </span>
                  </div>
                </TableCell>
              </TableRow>

              {row.subRows.map((leaf) => (
                <TableRow key={leaf.id}>
                  {leaf
                    .getVisibleCells()
                    .filter((cell) => cell.column.id !== "date")
                    .map((cell) => (
                      <TableCell key={cell.id} className="whitespace-nowrap">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                </TableRow>
              ))}
            </Fragment>
          );
        })}
      </TableBody>
    </Table>
  );
};

export default TimelogTable;
