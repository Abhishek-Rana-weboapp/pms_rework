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

  report: null,

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
