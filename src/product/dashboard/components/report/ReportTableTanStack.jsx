import { useMemo } from "react";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { useGroupedReportTable } from "./useGroupedReportTable";
import { buildTanStackColumns } from "./buildTanStackColumns";
import { isGroupedReport } from "./reportUtils";

function getRowSpan(rows, rowIndex, field) {
  const currentRow = rows[rowIndex];
  const currentGroup = currentRow.rowPath.find((item) => item.field === field);
  if (!currentGroup) return 1;

  let span = 1;
  for (let index = rowIndex + 1; index < rows.length; index++) {
    const nextRow = rows[index];
    const currentIndex = currentRow.rowPath.findIndex(
      (item) => item.field === field,
    );
    const nextGroup = nextRow.rowPath[currentIndex];
    if (!nextGroup || nextGroup.value !== currentGroup.value) break;
    span++;
  }
  return span;
}

function shouldRenderGroupCell(rows, rowIndex, field) {
  if (rowIndex === 0) return true;

  const currentRow = rows[rowIndex];
  const previousRow = rows[rowIndex - 1];
  const currentGroup = currentRow.rowPath.find((item) => item.field === field);
  const previousGroup = previousRow.rowPath.find(
    (item) => item.field === field,
  );

  return currentGroup?.value !== previousGroup?.value;
}

function formatGroupValue(value) {
  if (value == null || value === "") return "Unknown";
  return String(value).split("_").join(" ");
}

function PlainReportTable({ report }) {
  return (
    <>
      <TableHeader>
        <TableRow className="bg-gray-200 hover:bg-gray-50">
          {report.columns?.map((column) => (
            <TableHead
              key={column.field ?? column.name}
              className="whitespace-nowrap p-2 px-4 text-left font-medium text-gray-500 text-xs uppercase">
              {column.label}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>

      <TableBody>
        {report.rows?.map((row, rowIndex) => (
          <TableRow key={rowIndex}>
            {report.columns?.map((column) => {
              const value = row[column.field] ?? row[column.name] ?? "-";

              return (
                <TableCell
                  key={column.field ?? column.name}
                  className="max-w-96 truncate whitespace-nowrap p-2 px-4 text-sm"
                  title={value || "-"}
                >
                  {value || "-"}
                </TableCell>
              );
            })}
          </TableRow>
        ))}
      </TableBody>
    </>
  );
}

function GroupedReportTable({ tableModel, table }) {
  const { rowGroupColumns, columnHeaders, dataColumns, rows, hasColumnGroups } =
    tableModel;

  return (
    <>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          {rowGroupColumns.map((field) => (
            <TableHead
              key={field}
              className="border-r border-b border-neutral-300 bg-gray-50 p-2 text-gray-500 text-sm uppercase text-left"
            >
              {field.split("_").join(" ")}
            </TableHead>
          ))}

          {hasColumnGroups
            ? columnHeaders.map((column) => (
                <TableHead
                  key={column.key}
                  className="border-r border-b border-neutral-300 bg-gray-50 p-2 text-gray-500 text-sm uppercase text-center"
                >
                  {column.label}
                </TableHead>
              ))
            : dataColumns.map((column) => (
                <TableHead
                  key={column.field}
                  className="border-r border-b border-neutral-300 bg-gray-50 p-2 text-gray-500 text-sm uppercase text-left"
                >
                  {column.label}
                </TableHead>
              ))}
        </TableRow>
      </TableHeader>

      <TableBody>
        {table.getRowModel().rows.map((row, rowIndex) => {
          const rowItem = row.original;
          const showDataCells = !hasColumnGroups && rowItem.type === "data";
          const showCountCells = hasColumnGroups && rowItem.type === "count";

          return (
            <TableRow key={row.id} className="hover:bg-transparent">
              {rowGroupColumns.map((field) => {
                if (!shouldRenderGroupCell(rows, rowIndex, field)) {
                  return null;
                }

                const group = rowItem.rowPath.find(
                  (item) => item.field === field,
                );

                return (
                  <TableCell
                    key={field}
                    rowSpan={getRowSpan(rows, rowIndex, field)}
                    className="content-start border-r border-b border-neutral-300 bg-gray-100 p-2 text-left text-sm"
                  >
                    {formatGroupValue(group?.value)}
                  </TableCell>
                );
              })}

              {(showDataCells || showCountCells) &&
                row.getVisibleCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    className={`border border-neutral-300 p-2 text-sm ${
                      showCountCells ? "text-center" : "text-left"
                    }`}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
            </TableRow>
          );
        })}
      </TableBody>
    </>
  );
}

export default function ReportTableTanStack({ report }) {
  const isGrouped = isGroupedReport(report);
  const tableModel = useGroupedReportTable(isGrouped ? report : null);

  const columns = useMemo(
    () => buildTanStackColumns(tableModel),
    [tableModel],
  );

  const table = useReactTable({
    data: tableModel.rows,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (!report) return null;

  return (
    <div className="w-full overflow-hidden rounded-md border border-neutral-300">
      <Table className="min-w-max w-full border-collapse">
        {isGrouped ? (
          <GroupedReportTable tableModel={tableModel} table={table} />
        ) : (
          <PlainReportTable report={report} />
        )}
      </Table>
    </div>
  );
}
