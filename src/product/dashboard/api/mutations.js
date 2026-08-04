import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { queryKeys } from "@/shared/services/api/queryKeys";
import {
  createReportChart,
  deleteReportChart,
  generateReport,
  moveChartToDashboard,
  saveReport,
  updateReport,
  updateReportChart,
} from "./endpoints";

export const useGenerateReports = () => {
  return useMutation({
    mutationFn: generateReport,
  });
};

export const useSaveReport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: saveReport,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.reports.all });
      toast.success("Report saved successfully");
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message || "Failed to save report",
      );
    },
  });
};

export const useUpdateReport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateReport,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.reports.all });
      if (variables?.reportId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.reports.detail(variables.reportId),
        });
      }
      toast.success("Report updated successfully");
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message || "Failed to update report",
      );
    },
  });
};

export const useCreateReportChart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createReportChart,
    onSuccess: (_data, variables) => {
      const reportId = variables?.report_id;
      if (reportId != null) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.reports.detail(reportId),
        });
      }
      queryClient.invalidateQueries({ queryKey: queryKeys.reports.all });
    },
  });
};

export const useUpdateReportChart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateReportChart,
    onSuccess: (_data, variables) => {
      const reportId = variables?.payload?.report_id;
      if (reportId != null) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.reports.detail(reportId),
        });
      }
      queryClient.invalidateQueries({ queryKey: queryKeys.reports.all });
      toast.success("Chart updated successfully");
    },
    onError: (error) => {
      // Field errors are handled by the dialog; only toast non-field failures.
      const fieldErrors = error?.response?.data?.errors;
      const hasFields =
        fieldErrors &&
        typeof fieldErrors === "object" &&
        !Array.isArray(fieldErrors) &&
        Object.keys(fieldErrors).length > 0;

      if (!hasFields) {
        toast.error(
          error?.response?.data?.message || "Failed to update chart",
        );
      }
    },
  });
};

export const useMoveChartToDashboard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ chartId, moveToDashboard = true }) =>
      moveChartToDashboard(chartId, moveToDashboard),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
      toast.success("Chart moved to dashboard");
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message || "Failed to move chart to dashboard",
      );
    },
  });
};

export const useDeleteReportChart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ chartId }) => deleteReportChart(chartId),
    onSuccess: (_data, variables) => {
      if (variables?.reportId != null) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.reports.detail(variables.reportId),
        });
      }
      queryClient.invalidateQueries({ queryKey: queryKeys.reports.all });
      toast.success("Chart deleted successfully");
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message || "Failed to delete chart",
      );
    },
  });
};
