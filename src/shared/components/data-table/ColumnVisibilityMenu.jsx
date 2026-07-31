import { Settings2Icon } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

// Standalone version of the DataTable's "View" dropdown, driven by controlled
// column-visibility state instead of a table instance — so it can be rendered
// anywhere (e.g. a page toolbar) alongside a DataTable that shares the same
// `columnVisibility` / `onColumnVisibilityChange` props.
//
// Visibility semantics match TanStack: a column is visible unless its key maps
// to `false` in the state object.
export function ColumnVisibilityMenu({
  columns = [],
  columnVisibility = {},
  onColumnVisibilityChange,
  className,
}) {
  const hideable = columns.filter(
    (col) => col.enableHiding !== false && (col.id ?? col.accessorKey),
  );
  if (hideable.length === 0) return null;

  const toggle = (key, next) =>
    onColumnVisibilityChange?.({ ...columnVisibility, [key]: next });

  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className={className}>
              <Settings2Icon />
            </Button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent>View Options</TooltipContent>
      </Tooltip>

      <DropdownMenuContent
        align="end"
        className="w-44"
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {hideable.map((col) => {
          const key = col.id ?? col.accessorKey;
          const checked = columnVisibility[key] !== false;
          return (
            <DropdownMenuCheckboxItem
              onSelect={(e) => e.preventDefault()}
              key={key}
              className="capitalize"
              checked={checked}
              onCheckedChange={(value) => toggle(key, !!value)}
            >
              {col.meta?.label ?? String(key).replace(/_/g, " ")}
            </DropdownMenuCheckboxItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
