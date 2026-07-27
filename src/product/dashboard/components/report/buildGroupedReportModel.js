/**
 * Pure transform: report `{ columns, groups }` → TanStack-friendly table model.
 */
export function buildGroupedReportModel(data) {
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
      if (
        columnGroup.column_field &&
        !columnGroupColumnSet.has(columnGroup.column_field)
      ) {
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
        {
          field: columnGroup.column_field,
          value: columnGroup.column_value,
        },
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
      {
        field: group.group_field,
        value: group.group_value,
      },
    ];

    // Row groups only — render leaf data rows
    if (group.rows && !group.column_groups) {
      group.rows.forEach((row) => {
        flattenedRows.push({
          type: "data",
          rowPath: currentPath,
          row,
        });
      });
      return;
    }

    // Row + column groups — leaf becomes count cells
    if (group.column_groups) {
      const counts = {};

      function collectCounts(columnGroups, path = []) {
        columnGroups.forEach((columnGroup) => {
          const nextPath = [
            ...path,
            {
              field: columnGroup.column_field,
              value: columnGroup.column_value,
            },
          ];

          if (columnGroup.rows) {
            const key = nextPath
              .map((item) => `${item.field}=${String(item.value)}`)
              .join("|");
            counts[key] = columnGroup.rows.length;
            return;
          }

          collectCounts(columnGroup.column_groups ?? [], nextPath);
        });
      }

      collectCounts(group.column_groups);

      flattenedRows.push({
        type: "count",
        rowPath: currentPath,
        counts,
      });
      return;
    }

    group.groups?.forEach((childGroup) => {
      flattenRowGroups(childGroup, currentPath);
    });
  }

  groups.forEach((group) => flattenRowGroups(group));

  const groupedFields = new Set([...rowGroupColumns, ...columnGroupColumns]);
  const dataColumns = columns.filter(
    (column) => !groupedFields.has(column.field),
  );

  return {
    columns,
    rowGroupColumns,
    columnGroupColumns,
    columnHeaders,
    dataColumns,
    rows: flattenedRows,
    hasColumnGroups,
  };
}
