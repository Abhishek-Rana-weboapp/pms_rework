/**
 * Report API / table helpers.
 *
 * Detail API shape:
 * `{ id, report_name, configuration, preview: { columns, groups?, rows? } }`
 *
 * Generate API shape (also accepted):
 * `{ columns, groups?, rows? }` or wrapped in `preview`
 */

export function isGroupedReport(report) {
  return Array.isArray(report?.groups) && report.groups.length > 0;
}

/**
 * Normalize any report/detail/generate payload into table data:
 * `{ columns, rows?, groups? }`
 */
export function normalizeReportPayload(payload) {
  if (!payload || typeof payload !== "object") return null;

  const candidates = [payload.preview, payload].filter(
    (item) => item && typeof item === "object",
  );

  for (const candidate of candidates) {
    const columns = candidate.columns;
    const rows = candidate.rows;
    const groups = candidate.groups;

    const hasColumns = Array.isArray(columns) && columns.length > 0;
    const hasRows = Array.isArray(rows) && rows.length > 0;
    const hasGroups = Array.isArray(groups) && groups.length > 0;

    if (hasColumns || hasRows || hasGroups) {
      return {
        columns: columns ?? [],
        rows: rows ?? [],
        ...(hasGroups ? { groups } : {}),
      };
    }
  }

  return null;
}

/**
 * Map saved-report `configuration` into report-builder selections.
 */
export function extractReportConfiguration(payload) {
  const config = payload?.configuration ?? {};

  return {
    columns: config.selected_fields ?? [],
    rowGroups: config.row_groups ?? [],
    columnGroups: config.column_groups ?? [],
    filters: config.filters ?? [],
  };
}

/**
 * Build the POST body for `reports/generate/`.
 */
export function buildGeneratePayload({
  primaryModule,
  associatedModule,
  selections = {},
  reportId,
}) {
  const payload = {
    primary_module: primaryModule,
    associated_module: associatedModule,
  };

  if (selections.columns?.length) {
    payload.columns = selections.columns;
  }
  if (selections.rowGroups?.length) {
    payload.row_groups = selections.rowGroups;
  }
  if (selections.columnGroups?.length) {
    payload.column_groups = selections.columnGroups;
  }
  if (selections.filters?.length) {
    payload.filters = selections.filters;
  }
  if (reportId != null && reportId !== "") {
    payload.report_id = Number(reportId);
  }

  return payload;
}
