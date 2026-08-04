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
 * Normalize API field lists to string field names.
 * Accepts `["a"]`, `[{ field: "a" }]`, or `[{ name: "a" }]`.
 */
export function normalizeFieldList(items) {
  if (!Array.isArray(items)) return [];

  return items
    .map((item) => {
      if (typeof item === "string" || typeof item === "number") {
        return String(item);
      }
      if (item && typeof item === "object") {
        const field = item.field ?? item.name ?? item.value;
        return field != null && field !== "" ? String(field) : null;
      }
      return null;
    })
    .filter(Boolean);
}

/**
 * Map saved-report config into report-builder selections.
 * Supports both nested `configuration` and top-level field lists.
 * Falls back to `preview.columns` when selected fields are empty.
 */
export function extractReportConfiguration(payload) {
  const config = payload?.configuration ?? {};
  const preview = payload?.preview ?? {};

  const selectedFields = normalizeFieldList(
    config.selected_fields ?? payload?.selected_fields,
  );
  const previewFields = normalizeFieldList(preview.columns);

  return {
    columns: selectedFields.length > 0 ? selectedFields : previewFields,
    rowGroups: normalizeFieldList(config.row_groups ?? payload?.row_groups),
    columnGroups: normalizeFieldList(
      config.column_groups ?? payload?.column_groups,
    ),
    filters: Array.isArray(config.filters)
      ? config.filters
      : Array.isArray(payload?.filters)
        ? payload.filters
        : [],
  };
}

/**
 * Normalize `reports/edit/` response into drawer catalog options.
 */
export function normalizeReportConfiguration(data) {
  if (!data || typeof data !== "object") {
    return {
      columns: [],
      filters: [],
      rowGroups: [],
      columnGroups: [],
      aggregateColumns: [],
    };
  }

  return {
    columns: data.columns ?? [],
    filters: data.filters ?? [],
    rowGroups: data.row_groups ?? [],
    columnGroups: data.column_groups ?? [],
    aggregateColumns: data.aggregate_columns ?? [],
  };
}

export function getDefaultSelectedColumns(columns = []) {
  return columns.filter((column) => column.selected).map((column) => column.field);
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
    payload.selected_fields = selections.columns;
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

/**
 * Build POST/PUT body for save / update report.
 * Fields are top-level (not nested under `configuration`).
 */
export function buildSavePayload({
  name,
  description,
  primaryModule,
  associatedModule,
  selections = {},
}) {
  return {
    report_name: name,
    description: description ?? "",
    primary_module: primaryModule,
    associated_module: associatedModule,
    selected_fields: selections.columns ?? [],
    row_groups: selections.rowGroups ?? [],
    column_groups: selections.columnGroups ?? [],
  };
}

/**
 * Measure options from `aggregate_columns` configuration.
 */
export function buildMeasureOptions(aggregateColumns = []) {
  return aggregateColumns.flatMap((column) =>
    (column.functions ?? []).map((fn) => ({
      label: `${capitalize(fn)} ${column.label}`,
      value: `${column.field}-${fn}`,
    })),
  );
}

/**
 * Group-by options from selected row/column groups (+ labels from catalog).
 */
export function buildGroupByOptions({
  rowGroups = [],
  columnGroups = [],
  rowGroupOptions = [],
  columnGroupOptions = [],
} = {}) {
  const labelByField = new Map(
    [...rowGroupOptions, ...columnGroupOptions].map((item) => [
      item.field,
      item.label,
    ]),
  );

  return [...new Set([...rowGroups, ...columnGroups])].map((field) => ({
    label: labelByField.get(field) ?? field,
    value: field,
  }));
}

/**
 * Split `field-measure` y-axis value into chart API payload fields.
 */
export function buildChartPayload(state) {
  const [measure_field, measure] = String(state.yAxis || "").split("-");
  const { yAxis, ...rest } = state;

  const payload = {
    measure,
    measure_field,
    ...rest,
  };

  if (payload.chart_id == null || payload.chart_id === "") {
    delete payload.chart_id;
  }

  return payload;
}

/**
 * Prefill Create Chart form state from a saved report `chart` object.
 */
export function chartToFormState(chart, reportId) {
  const config = chart?.configuration ?? {};
  const measureField = config.measure_field ?? "";
  const measure = config.measure ?? "";

  return {
    yAxis:
      measureField && measure ? `${measureField}-${measure}` : "",
    group_by: config.group_by ?? "",
    sort_by: config.sort_by ?? "value_desc",
    maximum_groups: config.maximum_groups ?? 10,
    benchmark: config.benchmark ?? "",
    chart_type: chart?.chart_type ?? chart?.chart_data?.chart_type ?? "line",
    report_id: reportId,
    chart_id: chart?.id ?? chart?.chart_id ?? null,
  };
}

export function getChartId(chart) {
  return chart?.id ?? chart?.chart_id ?? null;
}

function capitalize(value = "") {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

/** Fields authored via TipTap across the app. */
const RICH_TEXT_FIELDS = new Set([
  "description",
  "acceptance_criteria",
  "implementation_plan",
]);

/**
 * Whether a report column should render with {@link RichText}.
 * Prefers API `type`, then known TipTap field names.
 */
export function isRichTextColumn(column) {
  if (!column || typeof column !== "object") return false;

  const type = String(
    column.type ?? column.field_type ?? column.data_type ?? "",
  ).toLowerCase();

  if (
    type === "richtext" ||
    type === "rich_text" ||
    type === "html" ||
    type === "tiptap"
  ) {
    return true;
  }

  const field = column.field ?? column.name;
  return Boolean(field && RICH_TEXT_FIELDS.has(field));
}

/** True when a cell value looks like stored rich-text HTML. */
export function looksLikeHtml(value) {
  return typeof value === "string" && /<[a-z][\s\S]*>/i.test(value.trim());
}

export function shouldRenderRichTextCell(column, value) {
  return isRichTextColumn(column) || looksLikeHtml(value);
}
