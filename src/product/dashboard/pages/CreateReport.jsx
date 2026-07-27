import { useEffect, useRef } from "react";
import { useLocation, useParams } from "react-router-dom";

import { useReportBuilder } from "../context/ReportBuilderContext";
import SectionWrapper from "@/shared/components/wrappers/SectionWrapper";
import ReportModuleSelector from "../components/report/ReportModuleSelector";
import {
  useAssociatedModules,
  usePrimaryModules,
  useSavedReport,
} from "../api/queries";
import { useGenerateReports } from "../api/mutations";
import { Button } from "@/shared/components/ui/button";
import ReportEditDrawer from "../components/report/ReportEditDrawer";
import ReportTableTanStack from "../components/report/ReportTableTanStack";
import PageLoader from "@/shared/components/layout/PageLoader";
import {
  buildGeneratePayload,
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

const CreateReport = () => {
  const { reportId } = useParams();
  const { state, actions } = useReportBuilder();
  const isEditMode = Boolean(reportId);
  const locationReport = useLocationReport(reportId);

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

  const { mutate, isPending: isGenerating } = useGenerateReports();

  const handleGenerateReport = () => {
    mutate(
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
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-medium">
              {isEditMode ? "Report" : "Report Preview"}
            </h2>

            <div className="flex items-center gap-2">
              <Button variant="cancel" onClick={actions.openSaveModal}>
                {isEditMode ? "Update" : "Save"}
              </Button>
              <Button onClick={actions.openEdit}>Edit</Button>
            </div>
          </div>

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
        columns={state.report?.columns || []}
        onApply={handleGenerateReport}
        isGenerating={isGenerating}
      />
    </div>
  );
};

export default CreateReport;
