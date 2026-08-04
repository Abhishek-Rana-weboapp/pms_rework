import { initialReportBuilderState } from "./reportBuilderState";
import {
  extractReportConfiguration,
  normalizeReportPayload,
} from "../components/report/reportUtils";

export const reportBuilderReducer = (state, action) => {
  switch (action.type) {
    case "SET_PRIMARY_MODULE":
      return {
        ...state,
        module: {
          primary: action.payload,
          associated: null,
        },
        selections: {
          columns: [],
          rowGroups: [],
          columnGroups: [],
          filters: [],
        },
        configuration: initialReportBuilderState.configuration,
        report: null,
        chart: null,
      };

    case "SET_ASSOCIATED_MODULE":
      return {
        ...state,
        module: {
          ...state.module,
          associated: action.payload,
        },
        selections: {
          columns: [],
          rowGroups: [],
          columnGroups: [],
          filters: [],
        },
        configuration: initialReportBuilderState.configuration,
        report: null,
        chart: null,
      };

    case "SET_CONFIGURATION":
      return {
        ...state,
        configuration: {
          columns: action.payload.columns ?? [],
          filters: action.payload.filters ?? [],
          rowGroups: action.payload.rowGroups ?? [],
          columnGroups: action.payload.columnGroups ?? [],
          aggregateColumns: action.payload.aggregateColumns ?? [],
        },
      };

    case "INITIALIZE_CONFIGURATION":
      return {
        ...state,
        selections: {
          columns: action.payload.columns ?? [],
          rowGroups: action.payload.rowGroups ?? [],
          columnGroups: action.payload.columnGroups ?? [],
          filters: action.payload.filters ?? [],
        },
      };

    case "SET_COLUMNS":
      return {
        ...state,
        selections: {
          ...state.selections,
          columns: action.payload,
        },
      };

    case "TOGGLE_COLUMN": {
      const { field, checked } = action.payload;

      return {
        ...state,
        selections: {
          ...state.selections,
          columns: checked
            ? [...state.selections.columns, field]
            : state.selections.columns.filter((column) => column !== field),
        },
      };
    }

    case "SET_ROW_GROUPS":
      return {
        ...state,
        selections: {
          ...state.selections,
          rowGroups: action.payload,
        },
      };

    case "TOGGLE_ROW_GROUP": {
      const { field, checked } = action.payload;

      return {
        ...state,
        selections: {
          ...state.selections,
          rowGroups: checked
            ? [...state.selections.rowGroups, field]
            : state.selections.rowGroups.filter((group) => group !== field),
        },
      };
    }

    case "SET_COLUMN_GROUPS":
      return {
        ...state,
        selections: {
          ...state.selections,
          columnGroups: action.payload,
        },
      };

    case "TOGGLE_COLUMN_GROUP": {
      const { field, checked } = action.payload;

      return {
        ...state,
        selections: {
          ...state.selections,
          columnGroups: checked
            ? [...state.selections.columnGroups, field]
            : state.selections.columnGroups.filter((group) => group !== field),
        },
      };
    }

    case "SET_FILTERS":
      return {
        ...state,
        selections: {
          ...state.selections,
          filters: action.payload,
        },
      };

    case "TOGGLE_FILTER": {
      const { field, checked } = action.payload;

      return {
        ...state,
        selections: {
          ...state.selections,
          filters: checked
            ? [
                ...state.selections.filters,
                { field, operator: "", value: "" },
              ]
            : state.selections.filters.filter(
                (filter) => filter.field !== field,
              ),
        },
      };
    }

    case "SET_FILTER_OPERATOR": {
      const { field, operator } = action.payload;

      return {
        ...state,
        selections: {
          ...state.selections,
          filters: state.selections.filters.map((filter) =>
            filter.field === field ? { ...filter, operator } : filter,
          ),
        },
      };
    }

    case "SET_FILTER_VALUE": {
      const { field, value } = action.payload;

      return {
        ...state,
        selections: {
          ...state.selections,
          filters: state.selections.filters.map((filter) =>
            filter.field === field ? { ...filter, value } : filter,
          ),
        },
      };
    }

    case "SET_REPORT":
      return {
        ...state,
        report: action.payload,
      };

    case "SET_CHART":
      return {
        ...state,
        chart: action.payload,
      };

    case "CLEAR_CHART":
      return {
        ...state,
        chart: null,
      };

    case "LOAD_SAVED_REPORT": {
      const payload = action.payload ?? {};

      return {
        ...state,
        mode: "edit",
        reportId: payload.id ?? null,
        module: {
          primary: payload.primary_module ?? null,
          associated: payload.associated_module ?? null,
        },
        selections: extractReportConfiguration(payload),
        report: normalizeReportPayload(payload),
        chart: payload.chart ?? null,
        save: {
          name: payload.report_name ?? "",
          description: payload.description ?? "",
        },
      };
    }

    case "SET_ACTIVE_TAB":
      return {
        ...state,
        ui: {
          ...state.ui,
          activeTab: action.payload,
        },
      };

    case "OPEN_EDIT":
      return {
        ...state,
        ui: {
          ...state.ui,
          isEditOpen: true,
        },
      };

    case "CLOSE_EDIT":
      return {
        ...state,
        ui: {
          ...state.ui,
          isEditOpen: false,
        },
      };

    case "OPEN_SAVE_MODAL":
      return {
        ...state,
        ui: {
          ...state.ui,
          isSaveModalOpen: true,
        },
      };

    case "CLOSE_SAVE_MODAL":
      return {
        ...state,
        ui: {
          ...state.ui,
          isSaveModalOpen: false,
        },
      };

    case "OPEN_CREATE_CHART":
      return {
        ...state,
        ui: {
          ...state.ui,
          isCreateChartOpen: true,
        },
      };

    case "CLOSE_CREATE_CHART":
      return {
        ...state,
        ui: {
          ...state.ui,
          isCreateChartOpen: false,
        },
      };

    case "SET_REPORT_NAME":
      return {
        ...state,
        save: {
          ...state.save,
          name: action.payload,
        },
      };

    case "SET_REPORT_DESCRIPTION":
      return {
        ...state,
        save: {
          ...state.save,
          description: action.payload,
        },
      };

    case "RESET_REPORT_BUILDER":
      return initialReportBuilderState;

    default:
      return state;
  }
};
