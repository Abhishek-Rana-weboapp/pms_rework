import { Pencil } from "lucide-react";

import { DataTableColumnHeader } from "../DataTableColumnHeader";
import { Button } from "../../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar";

export const getBranchTableColumns = ({ onEdit } = {}) => [
  {
    // Search + sort on name and code together.
    id: "branch",
    accessorFn: (row) =>
      `${row?.branch_name ?? ""} ${row?.branch_code ?? ""}`.trim(),
    meta: { label: "Branch" },
    size: 260,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Branch" />
    ),
    cell: ({ row }) => (
      <div className="flex items-center gap-3 py-1">
        <Avatar className="size-9 rounded-md">
          <AvatarImage src={row.original.logo} className="object-contain" />
          <AvatarFallback className="rounded-md bg-accent/40 text-primary">
            {row.original.branch_name?.[0]?.toUpperCase() ?? "B"}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <div className="truncate font-medium text-foreground">
            {row.original.branch_name || "-"}
          </div>
          <div className="truncate text-sm text-muted-foreground">
            {row.original.branch_code || "-"}
          </div>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "email",
    meta: { label: "Email" },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Email" />
    ),
    cell: ({ getValue }) => getValue() || "-",
  },
  {
    accessorKey: "contact_number",
    meta: { label: "Phone" },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Phone" />
    ),
    cell: ({ getValue }) => getValue() || "-",
  },
  {
    id: "location",
    accessorFn: (row) =>
      [row?.city, row?.country].filter(Boolean).join(", "),
    meta: { label: "Location" },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Location" />
    ),
    cell: ({ getValue }) => getValue() || "-",
  },
  {
    id: "actions",
    size: 60,
    header: () => null,
    cell: ({ row }) => (
      <div className="flex justify-end">
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground"
          aria-label={`Edit ${row.original?.branch_name || "branch"}`}
          onClick={(e) => {
            e.stopPropagation();
            onEdit?.(row.original);
          }}
        >
          <Pencil className="size-4" />
        </Button>
      </div>
    ),
  },
];
