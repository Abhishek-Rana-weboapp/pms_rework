import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";
import { DataTableColumnHeader } from "@/shared/components/data-table/DataTableColumnHeader";
import ArtifactStatusBadge from "@/product/project/components/ArtifactStatusBadge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { Edit, MoreHorizontal, Trash } from "lucide-react";

// "2026-07-14" -> "Jul 14, 2026"; empty/invalid -> "—".
const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
};

// Individual column builders. Rows are the NORMALIZED artifact shape
// (see normalizeArtifact), so cells read flat fields. Each is a standalone
// TanStack column def, so a type's config can pick exactly the columns it needs.

// "#ID" — leading identifier column.
export const idColumn = () => ({
  id: "id",
  accessorKey: "id",
  meta: { label: "ID" },
  size: 90,
  header: ({ column }) => <DataTableColumnHeader column={column} title="#ID" />,
  cell: ({ row }) => (
    <span className="font-semibold whitespace-nowrap">#{row.original.id}</span>
  ),
});

// Title + description subtitle. `title` is the header label, e.g. "Epic Title".
export const titleColumn = (title = "Title") => ({
  id: "title",
  accessorKey: "title",
  meta: { label: title },
  size: 320,
  header: ({ column }) => (
    <DataTableColumnHeader column={column} title={title} />
  ),
  cell: ({ row }) => {
    const { title: value, descriptionText } = row.original;
    return (
      <div className="py-1">
        <div className="font-medium text-foreground">{value}</div>
        {descriptionText && (
          <div className="truncate text-xs text-muted-foreground max-w-md">
            {descriptionText}
          </div>
        )}
      </div>
    );
  },
});

export const projectColumn = () => ({
  id: "projectName",
  accessorKey: "projectName",
  meta: { label: "Project Name" },
  header: ({ column }) => (
    <DataTableColumnHeader column={column} title="Project Name" />
  ),
  cell: ({ getValue }) => (
    <span className="whitespace-nowrap text-muted-foreground">
      {getValue() || "—"}
    </span>
  ),
});

export const developerColumn = () => ({
  id: "developer",
  meta: { label: "Developer Name" },
  header: ({ column }) => (
    <DataTableColumnHeader column={column} title="Developer Name" />
  ),
  cell: ({ row }) => {
    const dev = row.original.developer;
    if (!dev) {
      return <span className="text-muted-foreground">Unassigned</span>;
    }
    return (
      <div className="flex items-center gap-2">
        <Avatar className="size-7">
          <AvatarImage src={dev.avatar} alt={dev.name} />
          <AvatarFallback>{dev.initials}</AvatarFallback>
        </Avatar>
        <span className="whitespace-nowrap">{dev.name}</span>
      </div>
    );
  },
});

export const priorityColumn = () => ({
  id: "priority",
  accessorKey: "priority",
  meta: { label: "Priority" },
  size: 120,
  header: ({ column }) => (
    <DataTableColumnHeader column={column} title="Priority" />
  ),
  cell: ({ row }) => {
    const { priority, priorityColors } = row.original;
    if (!priority || priority === "—") {
      return <span className="text-muted-foreground">—</span>;
    }
    return (
      <span
        className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap"
        style={{
          backgroundColor: priorityColors?.bg || "#E5E7EB",
          color: priorityColors?.text || "#374151",
        }}
      >
        {priority}
      </span>
    );
  },
});

export const storyPointColumn = () => ({
  id: "storyPoint",
  accessorKey: "storyPoint",
  meta: { label: "Story Points" },
  size: 120,
  header: ({ column }) => (
    <DataTableColumnHeader column={column} title="Points" />
  ),
  cell: ({ getValue }) => (
    <span className="tabular-nums text-muted-foreground">
      {getValue() ?? 0}
    </span>
  ),
});

export const targetDateColumn = () => ({
  id: "targetDate",
  accessorKey: "targetDate",
  meta: { label: "Target Date" },
  size: 140,
  header: ({ column }) => (
    <DataTableColumnHeader column={column} title="Target Date" />
  ),
  cell: ({ getValue }) => (
    <span className="whitespace-nowrap text-muted-foreground">
      {formatDate(getValue())}
    </span>
  ),
});

export const statusColumn = () => ({
  id: "status",
  accessorKey: "status",
  meta: { label: "Status" },
  size: 140,
  header: ({ column }) => (
    <DataTableColumnHeader column={column} title="Status" />
  ),
  cell: ({ row }) => (
    <ArtifactStatusBadge
      status={row.original.status}
      category={row.original.statusCategory}
    />
  ),
});

export const actionColumn = ({ onEdit = () => {}, onDelete = () => {} }) => ({
  id: "actions",
  meta: { label: "Actions" },
  header: ({ column }) => (
    <DataTableColumnHeader column={column} title="Actions" />
  ),
  cell: ({ row }) => (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <MoreHorizontal />
      </DropdownMenuTrigger>

      <DropdownMenuContent>
        <DropdownMenuGroup>
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              onEdit?.(row);
            }}
          >
            <Edit />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              onDelete?.(row);
            }}
          >
            <Trash />
            Delete
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
});

// Registry of column builders keyed by id. `ctx` carries the title-column label
// and any injected handlers (ctx.deps) — see buildArtifactColumns. Add a new
// column type by dropping a builder here and referencing its key from a config.
const BUILDERS = {
  id: () => idColumn(),
  title: (ctx) => titleColumn(ctx.titleHeader),
  project: () => projectColumn(),
  developer: () => developerColumn(),
  priority: () => priorityColumn(),
  storyPoint: () => storyPointColumn(),
  targetDate: () => targetDateColumn(),
  status: () => statusColumn(),
  actions: (ctx) => actionColumn(ctx),
};

// Default column order shared by most artifact types.
export const DEFAULT_ARTIFACT_COLUMNS = [
  "id",
  "title",
  "project",
  "developer",
  "status",
];

/**
 * Builds a column list from an ordered array of builder keys — the array order
 * IS the column order, so a type reorders or adds/removes columns purely in
 * config. Unknown keys are skipped so a typo can't crash the table.
 *
 * @param {string[]} order         Ordered builder keys, e.g. ["id","title","status"].
 * @param {object}   opts
 * @param {string}   opts.titleHeader  Label for the title column ("Epic Title").
 * @param {object}   opts.<handlers>   Any extra props (onEdit, onDelete, …) are
 *                                     collected into ctx.deps for builders that
 *                                     need them (e.g. an actions column).
 */
export const buildArtifactColumns = (
  order = DEFAULT_ARTIFACT_COLUMNS,
  { titleHeader = "Title", ...deps } = {},
) => {
  const ctx = { titleHeader, deps };
  return order.map((key) => BUILDERS[key]?.(ctx)).filter(Boolean);
};
