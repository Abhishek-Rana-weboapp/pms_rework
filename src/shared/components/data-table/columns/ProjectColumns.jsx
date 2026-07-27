import { Progress } from "@/shared/components/ui/progress";
import { DataTableColumnHeader } from "../DataTableColumnHeader";

/**
 * Column definitions for the Projects data table.
 *
 * Helpers (Avatar, getFullNames, color maps, …) are injected so this file stays
 * free of app-wide imports and remains easy to unit test / reuse.
 *
 * Pass the result to <DataTable columns={getProjectColumns(...)} data={...} />.
 */
export const getProjectColumns = ({
  getStatusColors,
  colorsObject,
  textColorsObject,
  Avatar,
  getFullNames,
}) => [
  {
    accessorKey: "id",
    meta: { label: "Project ID" },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Project ID" />
    ),
    cell: ({ row }) => (
      <span className="font-bold whitespace-nowrap py-2">
        #PRJ-{row.original.id ?? "-"}
      </span>
    ),
  },

  {
    accessorKey: "project_name",
    meta: { label: "Project Title" },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Project Title" />
    ),
    cell: ({ row }) => (
      <span className="font-medium">{row.original.project_name || "-"}</span>
    ),
  },

  {
    accessorKey: "project_type",
    meta: { label: "Project Type" },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Type" />
    ),
    cell: ({ row }) => row.original.project_type || "-",
  },

  {
    accessorKey: "priority",
    meta: { label: "Priority" },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Priority" />
    ),
    cell: ({ row }) => (
      <span
        className={`px-5 py-0.5 rounded-full text-xs font-medium ${
          getStatusColors?.[row.original.priority] ?? ""
        }`}
      >
        {row.original.priority || "-"}
      </span>
    ),
  },

  {
    // Sort/search on the manager's full name rather than the raw object.
    id: "manager_details",
    accessorFn: (row) => getFullNames(row.manager_details) || "",
    meta: { label: "Manager" },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Manager" />
    ),
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Avatar small user={row.original.manager_details} />
        <span className="whitespace-nowrap">
          {getFullNames(row.original.manager_details) || "-"}
        </span>
      </div>
    ),
  },

  {
    id: "client_details",
    accessorFn: (row) =>
      getFullNames?.(row.client_details) ??
      [row.client_details?.first_name, row.client_details?.last_name]
        .filter(Boolean)
        .join(" "),
    meta: { label: "Client" },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Client" />
    ),
    cell: ({ getValue }) => getValue() || "-",
  },

  {
    accessorKey: "end_date",
    meta: { label: "Due Date" },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Due Date" />
    ),
    cell: ({ row }) => formatDate(row.original.end_date),
  },

  {
    accessorKey: "project_progress",
    meta: { label: "Progress" },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Progress" />
    ),
    cell: ({ row }) => {
      const value = Number(row.original.project_progress) || 0;
      return (
        <div className="flex items-center gap-2 min-w-30 p-1">
          <Progress value={value} className="h-2" />
          <span className="text-xs text-muted-foreground tabular-nums">
            {Math.round(value)}%
          </span>
        </div>
      );
    },
  },

  {
    accessorKey: "project_status",
    meta: { label: "Status" },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => (
      <span
        style={{
          background: colorsObject?.[row.original.project_status] || "#D1D5DB",
          color: textColorsObject?.[row.original.project_status],
        }}
        className="px-5 py-1 rounded-full text-xs font-medium whitespace-nowrap"
      >
        {row.original.project_status || "-"}
      </span>
    ),
  },
];

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}


export const projectTableColumnsOrder = [
  "id",
  "project_name",
  "priority",
  "manager_details",
  "client_details",
  "project_status",
]


/** Columns hidden by default; users can still toggle them via View options. */
export const projectColumnVisibility = {
  project_type: false,
  end_date: false,
  project_progress: false,
};
