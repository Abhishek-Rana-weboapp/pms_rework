import { PaginationControls } from "@/shared/components/PaginationControls";
import { PageSizeSelect } from "@/shared/components/PageSizeSelect";

export function DataTablePagination({
  table,
  pageSizeOptions = [10, 20, 30, 50, 100],
}) {
  "use no memo"; // reads mutable TanStack table state (page counts) — see note in DataTable
  const { pageIndex, pageSize } = table.getState().pagination;
  const selectedCount = table.getFilteredSelectedRowModel().rows.length;
  // getRowCount() honours the manual `rowCount` option in server mode and
  // falls back to the filtered client rows otherwise.
  const totalCount = table.getRowCount();

  return (
    <div className="flex flex-col-reverse items-center gap-4 px-1 sm:flex-row sm:justify-between">
      <div className="flex-1 text-sm text-muted-foreground">
        {table.getIsSomeRowsSelected() || table.getIsAllRowsSelected()
          ? `${selectedCount} of ${totalCount} row(s) selected.`
          : `${totalCount} row(s).`}
      </div>

      <div className="flex flex-col-reverse items-center gap-4 sm:flex-row sm:gap-6 lg:gap-8">
        <PageSizeSelect
          pageSize={pageSize}
          onPageSizeChange={(size) => table.setPageSize(size)}
          options={pageSizeOptions}
        />

        {/* TanStack Table is 0-indexed; PaginationControls is 1-indexed. */}
        <PaginationControls
          page={pageIndex + 1}
          pageCount={table.getPageCount() || 1}
          onPageChange={(nextPage) => table.setPageIndex(nextPage - 1)}
          className="mx-0 w-auto"
        />
      </div>
    </div>
  );
}
