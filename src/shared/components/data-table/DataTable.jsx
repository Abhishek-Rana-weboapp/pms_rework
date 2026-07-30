import * as React from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { SearchIcon, XIcon } from "lucide-react";

import { cn } from "@/shared/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { DataTablePagination } from "./DataTablePagination";
import { DataTableViewOptions } from "./DataTableViewOptions";

/**
 * Reusable, headless-table-backed data table built on @tanstack/react-table
 * and the project's shadcn primitives.
 *
 * Features: global search, sorting, column visibility, pagination, row
 * selection, loading skeletons and an empty state. Everything is opt-in so it
 * stays lightweight for simple tables.
 *
 * ## Two modes
 *
 * - **Client mode (default):** pass the full `data` array and the table
 *   handles search, sort and pagination in the browser. Use for small lists
 *   (settings, metadata, config).
 * - **Server mode:** the parent fetches one page at a time and drives the
 *   state. Turn on the relevant `manual*` flag, pass the controlled state +
 *   its `on*Change` handler, and give the table the total row count so it can
 *   still render page numbers. Use for large, paginated lists.
 *
 * Every server-mode prop is optional and falls back to internal state, so
 * existing client-side usages keep working untouched.
 *
 * @param {object[]}  columns        TanStack column definitions.
 * @param {object[]}  data           Row data (one page's worth in server mode).
 * @param {boolean}   isLoading      Render skeleton rows instead of data.
 * @param {boolean}   enableSearch   Show the global-filter input. Default true.
 * @param {boolean}   enablePagination  Show pagination controls. Default true.
 * @param {boolean}   enableViewOptions Column visibility menu. Default true.
 * @param {string}    searchPlaceholder
 * @param {number}    pageSize       Initial page size. Default 10.
 * @param {React.ReactNode} toolbar  Extra controls rendered in the toolbar.
 * @param {(row) => void}   onRowClick  Optional row click handler.
 * @param {React.ReactNode|string} emptyMessage  Shown when there are no rows.
 *
 * --- server-mode props (all optional) ---
 * @param {boolean} manualPagination  Backend paginates; don't slice locally.
 * @param {boolean} manualFiltering   Backend searches; don't filter locally.
 * @param {boolean} manualSorting     Backend sorts; don't sort locally.
 * @param {number}  rowCount          Total rows across all pages (server mode).
 * @param {number}  pageCount         Total pages; derived from rowCount if omitted.
 * @param {{pageIndex:number,pageSize:number}} pagination  Controlled page state.
 * @param {(updater) => void} onPaginationChange  Controlled page handler.
 * @param {string} searchValue        Controlled search term.
 * @param {(value:string) => void} onSearchChange  Controlled search handler
 *   (debounce this before it hits your query in server mode).
 * @param {object[]} sorting          Controlled sort state.
 * @param {(updater) => void} onSortingChange  Controlled sort handler.
 */
export default function DataTable({
  columns,
  data = [],
  isLoading = false,
  enableSearch = true,
  enablePagination = true,
  enableViewOptions = true,
  searchPlaceholder = "Search...",
  pageSize = 10,
  toolbar,
  onRowClick,
  emptyMessage = "No results found.",
  className,
  footer,
  headerClassName,
  tableClassName,
  // server-mode props
  manualPagination = false,
  manualFiltering = false,
  manualSorting = false,
  rowCount,
  pageCount,
  pagination: paginationProp,
  onPaginationChange,
  searchValue,
  onSearchChange,
  sorting: sortingProp,
  onSortingChange,
  columnVisibility: columnVisibilityProp,
  onColumnVisibilityChange,
  columnOrder
}) {
  // TanStack's `table` is a mutable object with a stable identity. The React
  // Compiler (enabled in vite.config.js) would memoise reads off it and freeze
  // derived UI (visibility checkboxes, sort arrows, row model). Opt out here
  // and in the sub-components that consume `table`.
  "use no memo";
  const [sortingState, setSortingState] = React.useState([]);
  const [columnFilters, setColumnFilters] = React.useState([]);
  const [columnVisibilityState, setColumnVisibilityState] = React.useState({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [globalFilterState, setGlobalFilterState] = React.useState("");
  const [paginationState, setPaginationState] = React.useState({
    pageIndex: 0,
    pageSize,
  });

  // Each of these is controlled by the parent when the matching prop is
  // provided, otherwise it falls back to the table's own internal state.
  const sorting = sortingProp ?? sortingState;
  const setSorting = onSortingChange ?? setSortingState;
  const globalFilter = searchValue ?? globalFilterState;
  const setGlobalFilter = onSearchChange ?? setGlobalFilterState;
  const pagination = paginationProp ?? paginationState;
  const setPagination = onPaginationChange ?? setPaginationState;
  const columnVisibility = columnVisibilityProp ?? columnVisibilityState;
  const setColumnVisibility =
    onColumnVisibilityChange ?? setColumnVisibilityState;

  const resolvedPageCount = manualPagination
    ? pageCount ??
      (rowCount != null ? Math.ceil(rowCount / pagination.pageSize) : -1)
    : undefined;

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
      pagination,
      columnOrder
    },
    enableRowSelection: true,
    manualPagination,
    manualFiltering,
    manualSorting,
    rowCount,
    pageCount: resolvedPageCount,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: manualSorting ? undefined : getSortedRowModel(),
    getFilteredRowModel: manualFiltering ? undefined : getFilteredRowModel(),
    getPaginationRowModel:
      enablePagination && !manualPagination
        ? getPaginationRowModel()
        : undefined,
  });

  const visibleColumnCount = table.getVisibleLeafColumns().length || 1;
  const hasToolbar = enableSearch || enableViewOptions || toolbar;

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {hasToolbar && (
        <div className="flex flex-wrap items-center gap-2">
          {enableSearch && (
            <div className="relative w-full max-w-xs">
              <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={globalFilter ?? ""}
                onChange={(e) => table.setGlobalFilter(e.target.value)}
                placeholder={searchPlaceholder}
                className="pl-8"
              />
              {globalFilter && (
                <Button
                  variant="ghost"
                  size="icon-xs"
                  className="absolute top-1/2 right-1 -translate-y-1/2"
                  onClick={() => table.setGlobalFilter("")}
                  aria-label="Clear search"
                >
                  <XIcon />
                </Button>
              )}
            </div>
          )}

          {toolbar}

          {enableViewOptions && (
            <div className="ml-auto flex items-center gap-2">
              <DataTableViewOptions table={table} />
            </div>
          )}
        </div>
      )}

      <div className="rounded-md border">
        <Table className={tableClassName}>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className={headerClassName}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} style={getColumnSizeStyle(header.column)}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {isLoading ? (
              renderSkeletonRows(pageSize, visibleColumnCount)
            ) : table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  onClick={onRowClick ? () => onRowClick(row.original) : undefined}
                  className={cn(
                    "bg-white",
                    // :has() outranks TableRow's own hover/aria-expanded rules,
                    // so an exempt cell never shades the row it sits in.
                    "hover:has-[[data-row-exempt]:hover]:bg-white",
                    "has-[[data-row-exempt]_[aria-expanded=true]]:bg-white",
                    onRowClick && "cursor-pointer",
                  )}
                >
                  {row.getVisibleCells().map((cell) => {
                    const isExempt =
                      cell.column.columnDef.meta?.exemptRowInteraction;
                    return (
                      <TableCell
                        key={cell.id}
                        data-row-exempt={isExempt || undefined}
                        onClick={
                          isExempt ? (e) => e.stopPropagation() : undefined
                        }
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={visibleColumnCount}
                  className="h-24 text-center text-muted-foreground"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {footer && <div className="border-t px-4 py-3">{footer}</div>}
      </div>

      {enablePagination && !isLoading && <DataTablePagination table={table} />}
    </div>
  );
}

function getColumnSizeStyle(column) {
  const size = column.columnDef.size;
  return size ? { width: size } : undefined;
}

function renderSkeletonRows(rows, cols) {
  return Array.from({ length: Math.min(rows, 8) }).map((_, rowIdx) => (
    <TableRow key={`skeleton-${rowIdx}`}>
      {Array.from({ length: cols }).map((__, colIdx) => (
        <TableCell key={`skeleton-${rowIdx}-${colIdx}`}>
          <Skeleton className="h-5 w-full" />
        </TableCell>
      ))}
    </TableRow>
  ));
}
