export const initialReportBuilderState = {
  mode: "create", // "create" | "edit"
  reportId: null,

  module: {
    primary: null,
    associated: null,
  },

  selections: {
    columns: [],
    rowGroups: [],
    columnGroups: [],
    filters: [],
  },

  /** Available options from `reports/edit/` for the edit drawer. */
  configuration: {
    columns: [],
    filters: [],
    rowGroups: [],
    columnGroups: [],
    aggregateColumns: [],
  },

  report: null,

  /** Saved / preview chart attached to the report (`data.chart`). */
  chart: null,

  ui: {
    activeTab: "columns",
    isEditOpen: false,
    isSaveModalOpen: false,
    isCreateChartOpen: false,
  },

  save: {
    name: "",
    description: "",
  },
};
