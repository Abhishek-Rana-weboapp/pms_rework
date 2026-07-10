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

/**
 * Toggle visibility of hideable columns.
 * Uses each column's `meta.label` (or the column id) as the display name.
 */
export function DataTableViewOptions({ table }) {
  "use no memo"; // TanStack's `table` is a stable-identity mutable object; the
  // React Compiler would cache reads off it (e.g. getIsVisible) and freeze the
  // checkboxes. Opt this component out. See TanStack Table + React Compiler.
  const columns = table
    .getAllColumns()
    .filter((column) => column.getCanHide());

  if (columns.length === 0) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="ml-auto">
          <Settings2Icon />
          View
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {columns.map((column) => (
          <DropdownMenuCheckboxItem
            key={column.id}
            className="capitalize"
            checked={column.getIsVisible()}
            onCheckedChange={(value) => column.toggleVisibility(!!value)}
          >
            {column.columnDef.meta?.label ?? column.id.replace(/_/g, " ")}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
