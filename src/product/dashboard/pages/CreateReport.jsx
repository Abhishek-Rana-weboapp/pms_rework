import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import { useReportBuilder } from "../context/ReportBuilderContext";
import SectionWrapper from "@/shared/components/wrappers/SectionWrapper";
import ReportModuleSelector from "../components/report/ReportModuleSelector";
import {
  useAssociatedModules,
  usePrimaryModules,
  useReportConfiguration,
  useSavedReport,
} from "../api/queries";
import {
  useDeleteReportChart,
  useGenerateReports,
  useMoveChartToDashboard,
  useSaveReport,
  useUpdateReport,
} from "../api/mutations";
import { Button } from "@/shared/components/ui/button";
import ReportEditDrawer from "../components/report/ReportEditDrawer";
import ReportTableTanStack from "../components/report/ReportTableTanStack";
import SaveReportDialog from "../components/report/SaveReportDialog";
import CreateChartDialog from "../components/report/CreateChartDialog";
import ReportChartSection from "../components/report/ReportChartSection";
import PageLoader from "@/shared/components/layout/PageLoader";
import {
  buildGeneratePayload,
  buildSavePayload,
  getChartId,
  getDefaultSelectedColumns,
  normalizeReportConfiguration,
  normalizeReportPayload,
} from "../components/report/reportUtils";

function useLocationReport(reportId) {
  const { state } = useLocation();
  const report = state?.report;

  if (!reportId || !report || String(report.id) !== String(reportId)) {
    return null;
  }

  return report;
}

function useHydrateSavedReport(reportId, savedReport) {
  const { actions } = useReportBuilder();
  const lastHydratedKey = useRef(null);

  useEffect(() => {
    if (!reportId || !savedReport) return;

    const key = String(savedReport.id ?? reportId);
    if (key !== String(reportId)) return;
    if (lastHydratedKey.current === key) return;

    lastHydratedKey.current = key;
    actions.loadSavedReport({
      ...savedReport,
      id: savedReport.id ?? Number(reportId),
    });
  }, [reportId, savedReport, actions]);
}

function useSyncReportConfiguration(isEditMode) {
  const { state, actions } = useReportBuilder();
  const lastInitKey = useRef(null);
  const didBackfillColumns = useRef(false);

  const {
    data: reportConfiguration,
    isLoading: isLoadingConfiguration,
  } = useReportConfiguration(state.module.primary, state.module.associated);

  useEffect(() => {
    didBackfillColumns.current = false;
    lastInitKey.current = null;
  }, [state.module.primary, state.module.associated, state.reportId]);

  useEffect(() => {
    if (!reportConfiguration) return;

    const catalog = normalizeReportConfiguration(reportConfiguration);
    actions.setConfiguration(catalog);

    const key = `${state.module.primary}|${state.module.associated ?? ""}`;

    if (isEditMode) {
      if (
        !didBackfillColumns.current &&
        state.selections.columns.length === 0 &&
        state.report?.columns?.length
      ) {
        didBackfillColumns.current = true;
        actions.initializeConfiguration({
          columns: state.report.columns
            .map((column) => column.field ?? column.name)
            .filter(Boolean),
          rowGroups: state.selections.rowGroups,
          columnGroups: state.selections.columnGroups,
          filters: state.selections.filters,
        });
      }
      return;
    }

    if (lastInitKey.current === key) return;
    lastInitKey.current = key;

    actions.initializeConfiguration({
      columns: getDefaultSelectedColumns(reportConfiguration.columns),
      rowGroups: [],
      columnGroups: [],
      filters: [],
    });
  }, [
    reportConfiguration,
    state.module.primary,
    state.module.associated,
    state.selections.columns.length,
    state.selections.rowGroups,
    state.selections.columnGroups,
    state.selections.filters,
    state.report?.columns,
    isEditMode,
    actions,
  ]);

  return { isLoadingConfiguration };
}

const CreateReport = () => {
  const { reportId } = useParams();
  const navigate = useNavigate();
  const { state, actions } = useReportBuilder();
  const isEditMode = Boolean(reportId);
  const locationReport = useLocationReport(reportId);
  const [editingChart, setEditingChart] = useState(null);

  const { data: primaryModules = [] } = usePrimaryModules({
    enabled: !isEditMode,
  });
  const {
    data: associatedModules = [],
    isLoading: isLoadingAssociatedModules,
  } = useAssociatedModules(state.module.primary, {
    enabled: !isEditMode,
  });

  const {
    data: savedReport,
    isLoading: isLoadingSavedReport,
    isError: isSavedReportError,
  } = useSavedReport(reportId);

  useHydrateSavedReport(reportId, savedReport);
  const { isLoadingConfiguration } = useSyncReportConfiguration(isEditMode);

  const { mutate: generateReport, isPending: isGenerating } =
    useGenerateReports();
  const { mutate: saveReport, isPending: isSaving } = useSaveReport();
  const { mutate: updateReport, isPending: isUpdating } = useUpdateReport();
  const { mutate: moveChart, isPending: isMovingChart } =
    useMoveChartToDashboard();
  const { mutate: deleteChart, isPending: isDeletingChart } =
    useDeleteReportChart();

  const chartId = getChartId(state.chart);
  const isChartActionPending = isMovingChart || isDeletingChart;

  const handleGenerateReport = () => {
    generateReport(
      buildGeneratePayload({
        primaryModule: state.module.primary,
        associatedModule: state.module.associated,
        selections: state.selections,
        reportId: isEditMode ? (state.reportId ?? reportId) : undefined,
      }),
      {
        onSuccess: (data) => {
          const tableData = normalizeReportPayload(data);
          if (tableData) {
            actions.setReport(tableData);
          }
        },
      },
    );
  };

  const handleSaveOrUpdate = () => {
    const payload = buildSavePayload({
      name: state.save.name.trim(),
      description: state.save.description,
      primaryModule: state.module.primary,
      associatedModule: state.module.associated,
      selections: state.selections,
    });

    if (isEditMode) {
      updateReport(
        {
          reportId: state.reportId ?? reportId,
          payload,
        },
        {
          onSuccess: () => {
            actions.closeSaveModal();
          },
        },
      );
      return;
    }

    saveReport(payload, {
      onSuccess: (data) => {
        actions.closeSaveModal();
        const nextId = data?.id ?? data?.report_id ?? data?.report?.id;
        if (nextId == null) return;

        navigate(`${nextId}`, {
          replace: true,
          state: { report: data },
        });
      },
    });
  };

  const handleOpenCreateChart = () => {
    setEditingChart(null);
    actions.openCreateChart();
  };

  const handleEditChart = () => {
    if (!state.chart) return;
    setEditingChart(state.chart);
    actions.openCreateChart();
  };

  const handleMoveChartToDashboard = () => {
    if (!chartId) return;
    moveChart({ chartId, moveToDashboard: true });
  };

  const handleDeleteChart = () => {
    if (!chartId) return;
    deleteChart(
      {
        chartId,
        reportId: state.reportId ?? reportId,
      },
      {
        onSuccess: () => {
          actions.clearChart();
          setEditingChart(null);
        },
      },
    );
  };

  const handleChartSaved = (chart) => {
    actions.setChart(chart);
    setEditingChart(null);
  };

  const handleCreateChartOpenChange = (open) => {
    if (open) {
      actions.openCreateChart();
      return;
    }
    actions.closeCreateChart();
    setEditingChart(null);
  };

  if (isEditMode && isLoadingSavedReport) {
    return <PageLoader />;
  }

  if (isEditMode && isSavedReportError) {
    return (
      <div className="space-y-4 p-4">
        <SectionWrapper>
          <h1 className="font-medium">Report not found</h1>
          <p className="text-sm text-gray-600">
            The saved report could not be loaded.
          </p>
        </SectionWrapper>
      </div>
    );
  }

  const title = isEditMode
    ? state.save.name || locationReport?.report_name || "Edit Report"
    : "Create Report";
  const subtitle = isEditMode
    ? state.save.description ||
      locationReport?.description ||
      "Update your saved report"
    : "Build custom reports for your data";

  return (
    <div className="space-y-4 p-4">
      <SectionWrapper>
        <h1 className="font-medium">{title}</h1>
        <p className="text-sm text-gray-600">{subtitle}</p>
      </SectionWrapper>

      {!isEditMode && (
        <SectionWrapper>
          <ReportModuleSelector
            primaryModules={primaryModules}
            associatedModules={associatedModules}
            isLoadingAssociatedModules={isLoadingAssociatedModules}
            handleGenerateReport={handleGenerateReport}
          />
        </SectionWrapper>
      )}

      {state.report && (
        <SectionWrapper>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-medium">
              {isEditMode ? "Report" : "Report Preview"}
            </h2>

            <div className="flex flex-wrap items-center gap-2">
              {isEditMode && !chartId && (
                <Button variant="outline" onClick={handleOpenCreateChart}>
                  Create Chart
                </Button>
              )}
              <Button variant="cancel" onClick={actions.openSaveModal}>
                {isEditMode ? "Update" : "Save"}
              </Button>
              <Button onClick={actions.openEdit}>Edit</Button>
            </div>
          </div>

          <ReportChartSection
            chart={state.chart}
            onEditChart={handleEditChart}
            onMoveToDashboard={handleMoveChartToDashboard}
            onDeleteChart={handleDeleteChart}
            isActionPending={isChartActionPending}
          />

          {isGenerating ? (
            <PageLoader />
          ) : (
            <ReportTableTanStack report={state.report} />
          )}
        </SectionWrapper>
      )}

      <ReportEditDrawer
        isOpen={state.ui.isEditOpen}
        onClose={actions.closeEdit}
        onApply={handleGenerateReport}
        isGenerating={isGenerating}
        isLoadingConfiguration={isLoadingConfiguration}
      />

      <SaveReportDialog
        open={state.ui.isSaveModalOpen}
        onOpenChange={(open) => {
          if (!open) actions.closeSaveModal();
        }}
        mode={isEditMode ? "edit" : "create"}
        name={state.save.name}
        description={state.save.description}
        onNameChange={actions.setReportName}
        onDescriptionChange={actions.setReportDescription}
        onSubmit={handleSaveOrUpdate}
        isSubmitting={isSaving || isUpdating}
      />

      <CreateChartDialog
        open={state.ui.isCreateChartOpen}
        onOpenChange={handleCreateChartOpenChange}
        reportId={state.reportId ?? reportId}
        selections={state.selections}
        configuration={state.configuration}
        editingChart={editingChart}
        onSaved={handleChartSaved}
      />
    </div>
  );
};

export default CreateReport;
