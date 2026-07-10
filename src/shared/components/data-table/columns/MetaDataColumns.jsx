import { createFullName, formatDateLocal } from "@/shared/lib/helpers";
import { DataTableColumnHeader } from "../DataTableColumnHeader";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../../ui/dropdown-menu";
import { Button } from "../../ui/button";
import { MoreHorizontal, Pencil, Trash } from "lucide-react";
import { statusBadgeColors } from "@/shared/lib/sharedData";

export const getPriorityColumns = ({onEdit, onDelete}) => [
  {
    accessorKey: "priority",
    meta: { label: "Priority Value" },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Priority Value" />
    ),
    cell: ({ row }) => (
      <span
        className={`rounded-full px-2 py-0.5 text-sm`}
        style={{
          backgroundColor: row.original.bg_color,
          color: row.original.text_color,
        }}
      >
        {row.original.priority}
      </span>
    ),
  },
  {
    accessorKey: "bg_color",
    meta: { label: "Color" },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Color" />
    ),
    cell: ({ row }) => (
      <div className="flex items-center gap-1">
        <div
          className="size-5 rounded hover:cursor-pointer"
          style={{ backgroundColor: row.original.bg_color }}
        />
        <span>{row.original.bg_color}</span>
      </div>
    ),
  },
  {
  id: "created_by",
  accessorFn: (row) =>
    createFullName(row?.created_by),
  meta: { label: "Created By" },
  header: ({ column }) => (
    <DataTableColumnHeader column={column} title="Created By" />
  ),
  cell: ({ getValue }) => getValue(),
},
  {
    accessorKey: "created_at",
    meta: { label: "Created At" },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Created At" />
    ),
    cell: ({ row }) => (
        <span>
            {formatDateLocal(row.original.created_at)}
        </span>
    ),
  },
  {
    id: "actions",
    size: 60,
    header: () => null,
    cell: ({ row }) => (
      <div className="flex justify-end">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground"
              aria-label={`Actions for ${row?.original?.profile_name ?? "profile"}`}
            >
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit?.(row.original)}>
             <Pencil className="size-4" /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => onDelete?.(row.original)}
            >
             <Trash className="size-4" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    ),
  }
];



export const getStatusColumns = ({onEdit, onDelete})=>[
  {
    accessorKey: "status_name",
    meta: { label: "Status" },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => (
      <span
        className={`rounded-full px-2 py-0.5 text-sm ${statusBadgeColors[row.original.category]}`}
      >
        {row.original.status_name}
      </span>
    ),
  },
  {
    accessorKey: "category",
    meta: { label: "Category" },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Category" />
    ),
    cell: ({ row }) => (
        <span>{row.original.category}</span>
    ),
  },
  {
  id: "created_by",
  accessorFn: (row) =>
    createFullName(row?.created_by),
  meta: { label: "Created By" },
  header: ({ column }) => (
    <DataTableColumnHeader column={column} title="Created By" />
  ),
  cell: ({ getValue }) => getValue(),
},
  {
    accessorKey: "created_at",
    meta: { label: "Created At" },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Created At" />
    ),
    cell: ({ row }) => (
        <span>
            {formatDateLocal(row.original.created_at)}
        </span>
    ),
  },
  {
    id: "actions",
    size: 60,
    header: () => null,
    cell: ({ row }) => (
      <div className="flex justify-end">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground"
              aria-label={`Actions for ${row?.original?.profile_name ?? "profile"}`}
            >
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit?.(row.original)}>
             <Pencil className="size-4" /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => onDelete?.(row.original)}
            >
             <Trash className="size-4" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    ),
  }
];



export const getProjectTypeColumns = ({onEdit, onDelete})=>[
  {
    accessorKey: "project_type",
    meta: { label: "Type Value" },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Type Value" />
    ),
    cell: ({ row }) => (
      <span
        className={`rounded-full px-2 py-0.5 text-sm`}
        style={{
          backgroundColor: row.original.bg_color,
          color: row.original.text_color,
        }}
      >
        {row.original.project_type}
      </span>
    ),
  },
  {
    accessorKey: "bg_color",
    meta: { label: "Color" },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Color" />
    ),
    cell: ({ row }) => (
      <div className="flex items-center gap-1">
        <div
          className="size-5 rounded hover:cursor-pointer"
          style={{ backgroundColor: row.original.bg_color }}
        />
        <span>{row.original.bg_color}</span>
      </div>
    ),
  },
  {
  id: "created_by",
  accessorFn: (row) =>
    createFullName(row?.created_by),
  meta: { label: "Created By" },
  header: ({ column }) => (
    <DataTableColumnHeader column={column} title="Created By" />
  ),
  cell: ({ getValue }) => getValue(),
},
  {
    accessorKey: "created_at",
    meta: { label: "Created At" },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Created At" />
    ),
    cell: ({ row }) => (
        <span>
            {formatDateLocal(row.original.created_at)}
        </span>
    ),
  },
  {
    id: "actions",
    size: 60,
    header: () => null,
    cell: ({ row }) => (
      <div className="flex justify-end">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground"
              aria-label={`Actions for ${row?.original?.profile_name ?? "profile"}`}
            >
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit?.(row.original)}>
             <Pencil className="size-4" /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => onDelete?.(row.original)}
            >
             <Trash className="size-4" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    ),
  }
];

