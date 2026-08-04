import { createColumnHelper } from "@tanstack/react-table";

import { ReportTableCellContent } from "./ReportTableCellContent";
import { shouldRenderRichTextCell } from "./reportUtils";

const columnHelper = createColumnHelper();

/**
 * Builds TanStack columns for the data / count area only.
 * Row-group columns are rendered manually (rowSpan), matching the
 * previous ReportTable behavior.
 */
export function buildTanStackColumns(tableModel) {
  const { dataColumns, columnHeaders, hasColumnGroups } = tableModel;

  if (hasColumnGroups) {
    return columnHeaders.map((column) =>
      columnHelper.accessor((row) => row.counts?.[column.key] ?? "", {
        id: column.key,
        header: column.label,
        cell: (info) => info.getValue(),
        meta: { align: "center", mode: "count" },
      }),
    );
  }

  return dataColumns.map((column) =>
    columnHelper.accessor((row) => row.row?.[column.field] ?? "", {
      id: column.field,
      header: column.label,
      cell: (info) => {
        const value = info.getValue();
        return <ReportTableCellContent column={column} value={value} />;
      },
      meta: {
        align: "left",
        mode: "data",
        isRichText: shouldRenderRichTextCell(column),
      },
    }),
  );
}
