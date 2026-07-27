# ReportTableTanStack

This document describes how to replace the existing custom `ReportTable` implementation with a version based on `@tanstack/react-table`.

## Goal

- Keep the same report behavior as `ReportTable.jsx`
- Support:
  - plain reports
  - grouped reports
  - nested row groups
  - optional column groups
  - count display for column-grouped reports
- Use TanStack Table for model and rendering instead of custom HTML table logic

## Install

```bash
npm install @tanstack/react-table
```

## Data shape

The report object is expected to contain:

- `columns`: array of column definitions
- `rows`: array of flat rows for non-grouped reports
- `groups`: nested grouping structure for grouped reports

Grouped report objects may include:

- `group_field`
- `group_value`
- `rows` for leaf-level rows
- `groups` for nested row groups
- `column_groups` for column-group mode

## Hook: `useGroupedReportTable`

This hook reads the report payload and builds a TanStack-friendly table model:

```jsx
import { useMemo } from "react";

export function useGroupedReportTable(data) {
  return useMemo(() => {
    if (!data) {
      return {
        columns: [],
        rowGroupColumns: [],
        columnGroupColumns: [],
        columnHeaders: [],
        dataColumns: [],
        rows: [],
        hasColumnGroups: false,
      };
    }

    const { columns = [], groups = [] } = data;

    const rowGroupColumns = [];
    const columnGroupColumns = [];
    const rowGroupColumnSet = new Set();
    const columnGroupColumnSet = new Set();

    function collectRowGroupFields(group) {
      if (group.group_field && !rowGroupColumnSet.has(group.group_field)) {
        rowGroupColumnSet.add(group.group_field);
        rowGroupColumns.push(group.group_field);
      }
      group.groups?.forEach(collectRowGroupFields);
    }

    function collectColumnGroupFields(group) {
      group.column_groups?.forEach((columnGroup) => {
        if (!columnGroupColumnSet.has(columnGroup.column_field)) {
          columnGroupColumnSet.add(columnGroup.column_field);
          columnGroupColumns.push(columnGroup.column_field);
        }
        collectColumnGroupFields(columnGroup);
      });
      group.groups?.forEach(collectColumnGroupFields);
    }

    groups.forEach(collectRowGroupFields);
    groups.forEach(collectColumnGroupFields);

    const hasColumnGroups = columnGroupColumns.length > 0;
    const columnHeaders = [];

    function flattenColumnGroups(columnGroups, path = []) {
      columnGroups.forEach((columnGroup) => {
        const currentPath = [
          ...path,
          { field: columnGroup.column_field, value: columnGroup.column_value },
        ];

        if (columnGroup.rows) {
          const key = currentPath
            .map((item) => `${item.field}=${String(item.value)}`)
            .join("|");

          const label = currentPath
            .map((item) => item.value ?? "Unknown")
            .join(" - ");

          columnHeaders.push({ key, label, path: currentPath });
          return;
        }

        flattenColumnGroups(columnGroup.column_groups ?? [], currentPath);
      });
    }

    if (hasColumnGroups) {
      function collectAllColumnGroups(group) {
        if (group.column_groups) {
          flattenColumnGroups(group.column_groups);
        }
        group.groups?.forEach(collectAllColumnGroups);
      }
      groups.forEach(collectAllColumnGroups);

      const uniqueHeaders = new Map();
      columnHeaders.forEach((header) => {
        if (!uniqueHeaders.has(header.key)) {
          uniqueHeaders.set(header.key, header);
        }
      });
      columnHeaders.length = 0;
      columnHeaders.push(...uniqueHeaders.values());
    }

    const flattenedRows = [];

    function flattenRowGroups(group, rowPath = []) {
      const currentPath = [
        ...rowPath,
        { field: group.group_field, value: group.group_value },
      ];

      if (group.rows && !group.column_groups) {
        group.rows.forEach((row) => {
          flattenedRows.push({ type: "data", rowPath: currentPath, row });
        });
        return;
      }

      if (group.column_groups) {
        const counts = {};
        function collectCounts(columnGroups, path = []) {
          columnGroups.forEach((columnGroup) => {
            const currentPath = [
              ...path,
              { field: columnGroup.column_field, value: columnGroup.column_value },
            ];

            if (columnGroup.rows) {
              const key = currentPath
                .map((item) => `${item.field}=${String(item.value)}`)
                .join("|");
              counts[key] = columnGroup.rows.length;
              return;
            }

            collectCounts(columnGroup.column_groups ?? [], currentPath);
          });
        }
        collectCounts(group.column_groups);
        flattenedRows.push({ type: "count", rowPath: currentPath, counts });
        return;
      }

      group.groups?.forEach((childGroup) => flattenRowGroups(childGroup, currentPath));
    }

    groups.forEach((group) => flattenRowGroups(group));

    const groupedFields = new Set([...rowGroupColumns, ...columnGroupColumns]);
    const dataColumns = columns.filter((column) => !groupedFields.has(column.field));

    return {
      columns,
      rowGroupColumns,
      columnGroupColumns,
      columnHeaders,
      dataColumns,
      rows: flattenedRows,
      hasColumnGroups,
    };
  }, [data]);
}
```

## Column builder

Use `createColumnHelper` to build TanStack columns from the report model:

```jsx
import { createColumnHelper } from "@tanstack/react-table";

const columnHelper = createColumnHelper();

export function buildTanStackColumns(tableModel) {
  const { rowGroupColumns, dataColumns, columnHeaders, hasColumnGroups } =
    tableModel;

  const columns = [
    ...rowGroupColumns.map((field) =>
      columnHelper.accessor(
        (row) => row.rowPath.find((item) => item.field === field)?.value ?? "",
        {
          id: field,
          header: field.split("_").join(" "),
          cell: (info) => info.getValue(),
        },
      ),
    ),
  ];

  if (hasColumnGroups) {
    columns.push(
      ...columnHeaders.map((column) =>
        columnHelper.accessor(
          (row) => row.counts[column.key] ?? "",
          {
            id: column.key,
            header: column.label,
            cell: (info) => info.getValue(),
          },
        ),
      ),
    );
  } else {
    columns.push(
      ...dataColumns.map((column) =>
        columnHelper.accessor(
          (row) => row.row[column.field] ?? "",
          {
            id: column.field,
            header: column.label,
            cell: (info) => info.getValue(),
          },
        ),
      ),
    );
  }

  return columns;
}
```

## Component

This component renders plain tables normally and grouped reports with TanStack Table:

```jsx
import React from "react";
import { useReactTable, getCoreRowModel } from "@tanstack/react-table";
import { useGroupedReportTable } from "./useGroupedReportTable";
import { buildTanStackColumns } from "./buildTanStackColumns";

function getRowSpan(rows, rowIndex, field) {
  const currentRow = rows[rowIndex];
  const currentGroup = currentRow.rowPath.find((item) => item.field === field);
  if (!currentGroup) return 1;

  let span = 1;
  for (let index = rowIndex + 1; index < rows.length; index++) {
    const nextRow = rows[index];
    const currentIndex = currentRow.rowPath.findIndex((item) => item.field === field);
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
  const previousGroup = previousRow.rowPath.find((item) => item.field === field);
  return currentGroup?.value !== previousGroup?.value;
}

export default function ReportTableTanStack({ report }) {
  if (!report) return null;

  const isGrouped = !!report.groups;
  const tableModel = useGroupedReportTable(report);

  if (!isGrouped) {
    return (
      <div className="w-full overflow-hidden rounded-md border border-neutral-300">
        <div className="w-full overflow-x-auto scrollbar-thin">
          <table className="min-w-max w-full border-collapse">
            <thead>
              <tr className="bg-gray-200">
                {report.columns?.map((column) => (
                  <th
                    key={column.name}
                    className="whitespace-nowrap p-2 px-4 text-left font-medium"
                  >
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {report.rows?.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {report.columns?.map((column) => (
                    <td
                      key={column.field ?? column.name}
                      className="max-w-96 truncate whitespace-nowrap p-2 px-4 text-sm"
                      title={row[column.field] ?? row[column.name] ?? "-"}
                    >
                      {row[column.field] ?? row[column.name] ?? "-"}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  const columns = buildTanStackColumns(tableModel);
  const table = useReactTable({
    data: tableModel.rows,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="w-full overflow-hidden rounded-md border border-neutral-300">
      <div className="w-full overflow-x-auto scrollbar-thin">
        <table className="min-w-max w-full border-collapse">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    colSpan={header.colSpan}
                    className="border-r border-b border-neutral-300 text-left p-2 bg-gray-100 capitalize"
                  >
                    {header.isPlaceholder ? null : header.renderHeader()}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row, rowIndex) => (
              <tr key={row.id}>
                {tableModel.rowGroupColumns.map((field) => {
                  if (!shouldRenderGroupCell(tableModel.rows, rowIndex, field)) {
                    return null;
                  }

                  const group = row.original.rowPath.find((item) => item.field === field);
                  return (
                    <td
                      key={field}
                      rowSpan={getRowSpan(tableModel.rows, rowIndex, field)}
                      className="border-r border-b border-neutral-300 text-left p-2 content-start bg-gray-100 text-sm"
                    >
                      {String(group?.value ?? "Unknown").split("_").join(" ")}
                    </td>
                  );
                })}
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="border border-neutral-300 text-left p-2 text-sm">
                    {cell.renderCell()}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

## Notes

- Use TanStack for data modeling and row rendering.
- Keep group cell rendering separate from `row.getVisibleCells()` because row group columns are handled manually.
- Column groups are represented as dynamic headers and count values.
- This approach keeps compatibility with your existing `ReportTable` behavior while moving to `@tanstack/react-table`.// filepath: src/Pages/Reports/ReportTableTanStack.md

# ReportTableTanStack

This document describes how to replace the existing custom `ReportTable` implementation with a version based on `@tanstack/react-table`.

## Goal

- Keep the same report behavior as `ReportTable.jsx`
- Support:
  - plain reports
  - grouped reports
  - nested row groups
  - optional column groups
  - count display for column-grouped reports
- Use TanStack Table for model and rendering instead of custom HTML table logic

## Install

```bash
npm install @tanstack/react-table
```

## Data shape

The report object is expected to contain:

- `columns`: array of column definitions
- `rows`: array of flat rows for non-grouped reports
- `groups`: nested grouping structure for grouped reports

Grouped report objects may include:

- `group_field`
- `group_value`
- `rows` for leaf-level rows
- `groups` for nested row groups
- `column_groups` for column-group mode

## Hook: `useGroupedReportTable`

This hook reads the report payload and builds a TanStack-friendly table model:

```jsx
import { useMemo } from "react";

export function useGroupedReportTable(data) {
  return useMemo(() => {
    if (!data) {
      return {
        columns: [],
        rowGroupColumns: [],
        columnGroupColumns: [],
        columnHeaders: [],
        dataColumns: [],
        rows: [],
        hasColumnGroups: false,
      };
    }

    const { columns = [], groups = [] } = data;

    const rowGroupColumns = [];
    const columnGroupColumns = [];
    const rowGroupColumnSet = new Set();
    const columnGroupColumnSet = new Set();

    function collectRowGroupFields(group) {
      if (group.group_field && !rowGroupColumnSet.has(group.group_field)) {
        rowGroupColumnSet.add(group.group_field);
        rowGroupColumns.push(group.group_field);
      }
      group.groups?.forEach(collectRowGroupFields);
    }

    function collectColumnGroupFields(group) {
      group.column_groups?.forEach((columnGroup) => {
        if (!columnGroupColumnSet.has(columnGroup.column_field)) {
          columnGroupColumnSet.add(columnGroup.column_field);
          columnGroupColumns.push(columnGroup.column_field);
        }
        collectColumnGroupFields(columnGroup);
      });
      group.groups?.forEach(collectColumnGroupFields);
    }

    groups.forEach(collectRowGroupFields);
    groups.forEach(collectColumnGroupFields);

    const hasColumnGroups = columnGroupColumns.length > 0;
    const columnHeaders = [];

    function flattenColumnGroups(columnGroups, path = []) {
      columnGroups.forEach((columnGroup) => {
        const currentPath = [
          ...path,
          { field: columnGroup.column_field, value: columnGroup.column_value },
        ];

        if (columnGroup.rows) {
          const key = currentPath
            .map((item) => `${item.field}=${String(item.value)}`)
            .join("|");

          const label = currentPath
            .map((item) => item.value ?? "Unknown")
            .join(" - ");

          columnHeaders.push({ key, label, path: currentPath });
          return;
        }

        flattenColumnGroups(columnGroup.column_groups ?? [], currentPath);
      });
    }

    if (hasColumnGroups) {
      function collectAllColumnGroups(group) {
        if (group.column_groups) {
          flattenColumnGroups(group.column_groups);
        }
        group.groups?.forEach(collectAllColumnGroups);
      }
      groups.forEach(collectAllColumnGroups);

      const uniqueHeaders = new Map();
      columnHeaders.forEach((header) => {
        if (!uniqueHeaders.has(header.key)) {
          uniqueHeaders.set(header.key, header);
        }
      });
      columnHeaders.length = 0;
      columnHeaders.push(...uniqueHeaders.values());
    }

    const flattenedRows = [];

    function flattenRowGroups(group, rowPath = []) {
      const currentPath = [
        ...rowPath,
        { field: group.group_field, value: group.group_value },
      ];

      if (group.rows && !group.column_groups) {
        group.rows.forEach((row) => {
          flattenedRows.push({ type: "data", rowPath: currentPath, row });
        });
        return;
      }

      if (group.column_groups) {
        const counts = {};
        function collectCounts(columnGroups, path = []) {
          columnGroups.forEach((columnGroup) => {
            const currentPath = [
              ...path,
              { field: columnGroup.column_field, value: columnGroup.column_value },
            ];

            if (columnGroup.rows) {
              const key = currentPath
                .map((item) => `${item.field}=${String(item.value)}`)
                .join("|");
              counts[key] = columnGroup.rows.length;
              return;
            }

            collectCounts(columnGroup.column_groups ?? [], currentPath);
          });
        }
        collectCounts(group.column_groups);
        flattenedRows.push({ type: "count", rowPath: currentPath, counts });
        return;
      }

      group.groups?.forEach((childGroup) => flattenRowGroups(childGroup, currentPath));
    }

    groups.forEach((group) => flattenRowGroups(group));

    const groupedFields = new Set([...rowGroupColumns, ...columnGroupColumns]);
    const dataColumns = columns.filter((column) => !groupedFields.has(column.field));

    return {
      columns,
      rowGroupColumns,
      columnGroupColumns,
      columnHeaders,
      dataColumns,
      rows: flattenedRows,
      hasColumnGroups,
    };
  }, [data]);
}
```

## Column builder

Use `createColumnHelper` to build TanStack columns from the report model:

```jsx
import { createColumnHelper } from "@tanstack/react-table";

const columnHelper = createColumnHelper();

export function buildTanStackColumns(tableModel) {
  const { rowGroupColumns, dataColumns, columnHeaders, hasColumnGroups } =
    tableModel;

  const columns = [
    ...rowGroupColumns.map((field) =>
      columnHelper.accessor(
        (row) => row.rowPath.find((item) => item.field === field)?.value ?? "",
        {
          id: field,
          header: field.split("_").join(" "),
          cell: (info) => info.getValue(),
        },
      ),
    ),
  ];

  if (hasColumnGroups) {
    columns.push(
      ...columnHeaders.map((column) =>
        columnHelper.accessor(
          (row) => row.counts[column.key] ?? "",
          {
            id: column.key,
            header: column.label,
            cell: (info) => info.getValue(),
          },
        ),
      ),
    );
  } else {
    columns.push(
      ...dataColumns.map((column) =>
        columnHelper.accessor(
          (row) => row.row[column.field] ?? "",
          {
            id: column.field,
            header: column.label,
            cell: (info) => info.getValue(),
          },
        ),
      ),
    );
  }

  return columns;
}
```

## Component

This component renders plain tables normally and grouped reports with TanStack Table:

```jsx
import React from "react";
import { useReactTable, getCoreRowModel } from "@tanstack/react-table";
import { useGroupedReportTable } from "./useGroupedReportTable";
import { buildTanStackColumns } from "./buildTanStackColumns";

function getRowSpan(rows, rowIndex, field) {
  const currentRow = rows[rowIndex];
  const currentGroup = currentRow.rowPath.find((item) => item.field === field);
  if (!currentGroup) return 1;

  let span = 1;
  for (let index = rowIndex + 1; index < rows.length; index++) {
    const nextRow = rows[index];
    const currentIndex = currentRow.rowPath.findIndex((item) => item.field === field);
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
  const previousGroup = previousRow.rowPath.find((item) => item.field === field);
  return currentGroup?.value !== previousGroup?.value;
}

export default function ReportTableTanStack({ report }) {
  if (!report) return null;

  const isGrouped = !!report.groups;
  const tableModel = useGroupedReportTable(report);

  if (!isGrouped) {
    return (
      <div className="w-full overflow-hidden rounded-md border border-neutral-300">
        <div className="w-full overflow-x-auto scrollbar-thin">
          <table className="min-w-max w-full border-collapse">
            <thead>
              <tr className="bg-gray-200">
                {report.columns?.map((column) => (
                  <th
                    key={column.name}
                    className="whitespace-nowrap p-2 px-4 text-left font-medium"
                  >
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {report.rows?.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {report.columns?.map((column) => (
                    <td
                      key={column.field ?? column.name}
                      className="max-w-96 truncate whitespace-nowrap p-2 px-4 text-sm"
                      title={row[column.field] ?? row[column.name] ?? "-"}
                    >
                      {row[column.field] ?? row[column.name] ?? "-"}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  const columns = buildTanStackColumns(tableModel);
  const table = useReactTable({
    data: tableModel.rows,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="w-full overflow-hidden rounded-md border border-neutral-300">
      <div className="w-full overflow-x-auto scrollbar-thin">
        <table className="min-w-max w-full border-collapse">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    colSpan={header.colSpan}
                    className="border-r border-b border-neutral-300 text-left p-2 bg-gray-100 capitalize"
                  >
                    {header.isPlaceholder ? null : header.renderHeader()}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row, rowIndex) => (
              <tr key={row.id}>
                {tableModel.rowGroupColumns.map((field) => {
                  if (!shouldRenderGroupCell(tableModel.rows, rowIndex, field)) {
                    return null;
                  }

                  const group = row.original.rowPath.find((item) => item.field === field);
                  return (
                    <td
                      key={field}
                      rowSpan={getRowSpan(tableModel.rows, rowIndex, field)}
                      className="border-r border-b border-neutral-300 text-left p-2 content-start bg-gray-100 text-sm"
                    >
                      {String(group?.value ?? "Unknown").split("_").join(" ")}
                    </td>
                  );
                })}
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="border border-neutral-300 text-left p-2 text-sm">
                    {cell.renderCell()}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

## Notes

- Use TanStack for data modeling and row rendering.
- Keep group cell rendering separate from `row.getVisibleCells()` because row group columns are handled manually.
- Column groups are represented as dynamic headers and count values.
- This approach keeps compatibility with your existing `ReportTable` behavior while moving to `@tanstack/react-table`.