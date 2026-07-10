import {
  ArrowDownIcon,
  ArrowUpIcon,
  ChevronsUpDownIcon,
  EyeOffIcon,
} from "lucide-react";

import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";

/**
 * Sortable / hideable column header.
 *
 * Use inside a column definition's `header`:
 *   header: ({ column }) => <DataTableColumnHeader column={column} title="Priority" />
 *
 * Falls back to a plain label when the column is not sortable.
 */
export function DataTableColumnHeader({ column, title, className }) {
  "use no memo"; // reads mutable TanStack column state (sort/visibility) — see note in DataTable
  if (!column.getCanSort() && !column.getCanHide()) {
    return <span className={cn("font-medium", className)}>{title}</span>;
  }

  const sorted = column.getIsSorted();

  return (
    <div className={cn("flex items-center", className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="-ml-2.5 h-8 data-[state=open]:bg-muted"
          >
            <span>{title}</span>
            {sorted === "desc" ? (
              <ArrowDownIcon />
            ) : sorted === "asc" ? (
              <ArrowUpIcon />
            ) : (
              <ChevronsUpDownIcon className="text-muted-foreground" />
            )}
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="start">
          {column.getCanSort() && (
            <>
              <DropdownMenuItem onClick={() => column.toggleSorting(false)}>
                <ArrowUpIcon className="text-muted-foreground" />
                Asc
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => column.toggleSorting(true)}>
                <ArrowDownIcon className="text-muted-foreground" />
                Desc
              </DropdownMenuItem>
            </>
          )}

          {column.getCanSort() && column.getCanHide() && (
            <DropdownMenuSeparator />
          )}

          {column.getCanHide() && (
            <DropdownMenuItem onClick={() => column.toggleVisibility(false)}>
              <EyeOffIcon className="text-muted-foreground" />
              Hide
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
