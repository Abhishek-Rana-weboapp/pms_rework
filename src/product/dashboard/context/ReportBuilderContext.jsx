import { createContext, useContext, useMemo, useReducer } from "react";

import { initialReportBuilderState } from "./reportBuilderState";
import { reportBuilderReducer } from "./reportBuilderReducer";

const ReportBuilderContext = createContext(null);

export const ReportBuilderProvider = ({ children }) => {
  const [state, dispatch] = useReducer(
    reportBuilderReducer,
    initialReportBuilderState,
  );

  // dispatch is stable — memoize actions so consumers can safely depend on them
  const actions = useMemo(
    () => ({
      setPrimaryModule: (module) =>
        dispatch({ type: "SET_PRIMARY_MODULE", payload: module }),

      setAssociatedModule: (module) =>
        dispatch({ type: "SET_ASSOCIATED_MODULE", payload: module }),

      setConfiguration: (configuration) =>
        dispatch({
          type: "SET_CONFIGURATION",
          payload: configuration,
        }),

      initializeConfiguration: ({
        columns = [],
        rowGroups = [],
        columnGroups = [],
        filters = [],
      }) =>
        dispatch({
          type: "INITIALIZE_CONFIGURATION",
          payload: { columns, rowGroups, columnGroups, filters },
        }),

      setColumns: (columns) =>
        dispatch({ type: "SET_COLUMNS", payload: columns }),

      toggleColumn: (field, checked) =>
        dispatch({ type: "TOGGLE_COLUMN", payload: { field, checked } }),

      setRowGroups: (groups) =>
        dispatch({ type: "SET_ROW_GROUPS", payload: groups }),

      toggleRowGroup: (field, checked) =>
        dispatch({ type: "TOGGLE_ROW_GROUP", payload: { field, checked } }),

      setColumnGroups: (groups) =>
        dispatch({ type: "SET_COLUMN_GROUPS", payload: groups }),

      toggleColumnGroup: (field, checked) =>
        dispatch({ type: "TOGGLE_COLUMN_GROUP", payload: { field, checked } }),

      setFilters: (filters) =>
        dispatch({ type: "SET_FILTERS", payload: filters }),

      toggleFilter: (field, checked) =>
        dispatch({ type: "TOGGLE_FILTER", payload: { field, checked } }),

      setFilterOperator: (field, operator) =>
        dispatch({
          type: "SET_FILTER_OPERATOR",
          payload: { field, operator },
        }),

      setFilterValue: (field, value) =>
        dispatch({ type: "SET_FILTER_VALUE", payload: { field, value } }),

      setReport: (report) =>
        dispatch({ type: "SET_REPORT", payload: report }),

      setChart: (chart) =>
        dispatch({ type: "SET_CHART", payload: chart }),

      clearChart: () => dispatch({ type: "CLEAR_CHART" }),

      loadSavedReport: (report) =>
        dispatch({ type: "LOAD_SAVED_REPORT", payload: report }),

      setActiveTab: (tab) =>
        dispatch({ type: "SET_ACTIVE_TAB", payload: tab }),

      openEdit: () => dispatch({ type: "OPEN_EDIT" }),
      closeEdit: () => dispatch({ type: "CLOSE_EDIT" }),
      openSaveModal: () => dispatch({ type: "OPEN_SAVE_MODAL" }),
      closeSaveModal: () => dispatch({ type: "CLOSE_SAVE_MODAL" }),
      openCreateChart: () => dispatch({ type: "OPEN_CREATE_CHART" }),
      closeCreateChart: () => dispatch({ type: "CLOSE_CREATE_CHART" }),

      setReportName: (name) =>
        dispatch({ type: "SET_REPORT_NAME", payload: name }),

      setReportDescription: (description) =>
        dispatch({ type: "SET_REPORT_DESCRIPTION", payload: description }),

      reset: () => dispatch({ type: "RESET_REPORT_BUILDER" }),
    }),
    [],
  );

  const value = useMemo(() => ({ state, actions }), [state, actions]);

  return (
    <ReportBuilderContext.Provider value={value}>
      {children}
    </ReportBuilderContext.Provider>
  );
};

export const useReportBuilder = () => {
  const context = useContext(ReportBuilderContext);

  if (!context) {
    throw new Error(
      "useReportBuilder must be used inside ReportBuilderProvider",
    );
  }

  return context;
};
