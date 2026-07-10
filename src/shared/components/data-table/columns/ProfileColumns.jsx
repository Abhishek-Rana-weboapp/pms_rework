import { MoreHorizontal } from "lucide-react";

import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarImage,
} from "@/shared/components/ui/avatar";
import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";

// Plain uppercase column label to match the design (no sort controls).
const ColumnLabel = ({ children }) => (
  <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
    {children}
  </span>
);

// Square initial tile for the profile (rounded square, not a round avatar).
const ProfileInitial = ({ name }) => (
  <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted text-sm font-medium text-muted-foreground">
    {name?.trim()?.[0]?.toUpperCase() ?? "?"}
  </div>
);

// Stacked user avatars with a "+N" overflow tile, followed by the total count.
// `users` may be an array of user objects or a plain number (count only).
const AssignedUsers = ({ users }) => {
  const list = Array.isArray(users) ? users : [];
  const count = Array.isArray(users) ? users.length : Number(users) || 0;

  const MAX = 3;
  const hasOverflow = count > MAX;
  // e.g. 5 users -> 2 avatars + "+3"; 3 users -> 3 avatars, no overflow tile.
  const shown = hasOverflow ? MAX - 1 : count;

  return (
    <div className="flex items-center gap-3">
      <AvatarGroup>
        {Array.from({ length: shown }).map((_, i) => {
          const user = list[i];
          return (
            <Avatar key={i} size="sm">
              {user?.image ? (
                <AvatarImage src={user.image} alt={user?.name} />
              ) : null}
              <AvatarFallback>
                {user?.name?.trim()?.[0]?.toUpperCase() ?? ""}
              </AvatarFallback>
            </Avatar>
          );
        })}
        {hasOverflow && (
          <AvatarGroupCount className="text-xs">
            +{count - shown}
          </AvatarGroupCount>
        )}
      </AvatarGroup>
      <span className="font-medium">{count}</span>
    </div>
  );
};

export const getProfileColumns = ({ onEdit, onDelete } = {}) => [
  {
    accessorKey: "profile_name",
    meta: { label: "Profile" },
    size: 220,
    header: () => <ColumnLabel>Profile</ColumnLabel>,
    cell: ({ row }) => {
      const name = row?.original?.profile_name ?? "-";
      // Optional short label under the name (map to your field if it differs).
      const subtitle = row?.original?.access_label ?? row?.original?.subtitle;
      return (
        <div className="flex items-center gap-3 py-1">
          <ProfileInitial name={name} />
          <div className="min-w-0">
            <div className="truncate font-medium capitalize text-foreground">
              {name}
            </div>
            {subtitle && (
              <div className="truncate text-sm text-muted-foreground">
                {subtitle}
              </div>
            )}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "description",
    meta: { label: "Description" },
    size: 460,
    header: () => <ColumnLabel>Description</ColumnLabel>,
    cell: ({ row }) => (
      <span
        className=" whitespace-normal text-muted-foreground line-clamp-2"
        title={row?.original?.description ?? undefined}
      >
        {row?.original?.description ?? "-"}
      </span>
    ),
  },
  {
    accessorKey: "assigned_users",
    meta: { label: "Users" },
    size: 160,
    header: () => <ColumnLabel>Users</ColumnLabel>,
    // cell: ({ row }) => <AssignedUsers users={row?.original?.assigned_users} />,
    cell: ({ row }) => (
      <span className="text-center w-full">
        {row?.original?.assigned_users}
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
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => onDelete?.(row.original)}
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    ),
  },
];
