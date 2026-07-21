import { MoreHorizontal, Pencil, Trash } from "lucide-react";

import {
  createFullName,
  createInitials,
  formatDateLocal,
} from "@/shared/lib/helpers";
import { DataTableColumnHeader } from "../DataTableColumnHeader";
import { Button } from "../../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar";

// Colors for the invite-status badge. Adjust the keys to match the exact
// values your API returns for `invite_status`.
const inviteStatusColors = {
  ACCEPTED: "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300",
  ACTIVE: "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300",
  PENDING: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  EXPIRED: "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300",
};

export const getUsersTableColumns = ({ onEdit, onDelete } = {}) => [
  {
    // No single accessorKey, so give it an id. The accessor VALUE drives global
    // search + sort — include the email so one search box matches name OR email.
    id: "name",
    accessorFn: (row) => `${createFullName(row)} ${row?.email ?? ""}`.trim(),
    meta: { label: "Name" },
    size: 260,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    cell: ({ row }) => {
      const name = createFullName(row.original) || "-";
      return (
        <div className="flex items-center gap-3 py-1">
          <Avatar className="size-9">
            <AvatarImage src={row.original.user_image} />
            <AvatarFallback>{createInitials(row.original) || "?"}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <div className="truncate font-medium text-foreground">{name}</div>
            <div className="truncate text-sm text-muted-foreground">
              {row.original?.email ?? "-"}
            </div>
          </div>
        </div>
      );
    },
  },
  {
    // Assigned profile/role. `profile_details.profile_name` is the assumed
    // shape — swap to your actual field (e.g. role_details.role_name).
    id: "profile",
    accessorFn: (row) =>
      row?.profile_details?.profile_name ?? row?.profile_name ?? "",
    meta: { label: "Profile" },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Profile" />
    ),
    cell: ({ getValue }) => (
      <span className="capitalize">{getValue() || "-"}</span>
    ),
  },
  {
    accessorKey: "invite_status",
    meta: { label: "Invite Status" },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Invite Status" />
    ),
    cell: ({ row }) => {
      const status = row.original?.invite_status;
      if (!status) return "-";
      return (
        <span
          className={`rounded-full px-2 py-0.5 text-sm ${
            inviteStatusColors[status] ??
            "bg-secondary text-secondary-foreground"
          }`}
        >
          {status}
        </span>
      );
    },
  },
  {
    id: "created_by",
    accessorFn: (row) => createFullName(row?.created_by),
    meta: { label: "Created By" },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Created By" />
    ),
    cell: ({ getValue }) => getValue() || "-",
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
              aria-label={`Actions for ${createFullName(row?.original) || "user"}`}
            >
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onEdit?.(row.original);
              }}
            >
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
  },
];
