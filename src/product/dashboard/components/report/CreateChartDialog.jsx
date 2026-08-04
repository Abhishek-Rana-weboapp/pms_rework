import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { FieldError } from "@/shared/components/ui/field";
import { Label } from "@/shared/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Spinner } from "@/shared/components/ui/spinner";
import {
  getErrorMessage,
  getServerFieldErrorMap,
} from "@/shared/lib/formErrors";
import { useCreateReportChart } from "../../api/mutations";
import {
  buildChartPayload,
  buildGroupByOptions,
  buildMeasureOptions,
  chartToFormState,
  getChartId,
} from "./reportUtils";
import ReportChartComponent from "./ReportChartComponent";

const CHART_OPTIONS = [
  { label: "Line Chart", value: "line" },
  { label: "Bar Chart", value: "bar" },
  { label: "Pie Chart", value: "pie" },
  { label: "Column Chart", value: "column" },
  { label: "Doughnut Chart", value: "doughnut" },
  { label: "Area Chart", value: "area" },
];

const SORT_OPTIONS = [
  { label: "Ascending", value: "value_asc" },
  { label: "Descending", value: "value_desc" },
];

const MAX_GROUP_OPTIONS = [
  { label: "10", value: "10" },
  { label: "15", value: "15" },
  { label: "20", value: "20" },
];

const FALLBACK_MEASURE_OPTIONS = [
  { label: "Count Story points", value: "story_point-count" },
  { label: "Sum Story points", value: "story_point-sum" },
  { label: "Average Story points", value: "story_point-average" },
  { label: "Minimum Story points", value: "story_point-minimum" },
  { label: "Maximum Story points", value: "story_point-maximum" },
  { label: "Count Time Spent", value: "time_spent-count" },
  { label: "Sum Time Spent", value: "time_spent-sum" },
  { label: "Average Time Spent", value: "time_spent-average" },
  { label: "Minimum Time Spent", value: "time_spent-minimum" },
  { label: "Maximum Time Spent", value: "time_spent-maximum" },
];

const MEASURE_ERROR_KEYS = new Set(["measure", "measure_field", "yAxis"]);

const FORM_FIELD_KEYS = new Set([
  "yAxis",
  "group_by",
  "sort_by",
  "maximum_groups",
  "benchmark",
  "chart_type",
  "report_id",
  "chart_id",
]);

const CHART_DATA_FAMILY = {
  line: "cartesian",
  bar: "cartesian",
  column: "cartesian",
  area: "cartesian",
  pie: "circular",
  doughnut: "circular",
};

function getChartDataFamily(chartType) {
  return CHART_DATA_FAMILY[chartType] ?? chartType;
}

function needsChartDataRefetch(fromType, toType) {
  return getChartDataFamily(fromType) !== getChartDataFamily(toType);
}

function hasRequiredChartFields(form, reportId) {
  return Boolean(form?.yAxis && form?.group_by && reportId);
}

function mapChartFieldErrors(errorMap) {
  const mapped = {};

  Object.entries(errorMap).forEach(([field, message]) => {
    if (MEASURE_ERROR_KEYS.has(field)) {
      mapped.yAxis = mapped.yAxis ? `${mapped.yAxis} ${message}` : message;
      return;
    }

    if (FORM_FIELD_KEYS.has(field)) {
      mapped[field] = message;
      return;
    }

    toast.error(message);
  });

  return mapped;
}

function FieldSelect({
  label,
  value,
  onValueChange,
  options,
  placeholder = "Select...",
  disabled = false,
  error,
}) {
  return (
    <div className="flex flex-col gap-2">
      <Label className="text-xs font-normal text-muted-foreground">{label}</Label>
      <Select
        value={value || undefined}
        onValueChange={onValueChange}
        disabled={disabled}
      >
        <SelectTrigger
          className="w-full text-sm"
          aria-invalid={Boolean(error)}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={String(option.value)} value={String(option.value)}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error ? <FieldError>{error}</FieldError> : null}
    </div>
  );
}

const initialChartState = (reportId) => ({
  yAxis: "",
  group_by: "",
  sort_by: "value_desc",
  maximum_groups: 10,
  benchmark: "",
  chart_type: "line",
  report_id: reportId,
  chart_id: null,
});

const CreateChartDialog = ({
  open,
  onOpenChange,
  reportId,
  selections,
  configuration,
  editingChart = null,
  onSaved,
}) => {
  const isEditMode = Boolean(editingChart?.id ?? editingChart?.chart_id);

  const [form, setForm] = useState(() => initialChartState(reportId));
  const [chartData, setChartData] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [hasApplied, setHasApplied] = useState(false);

  const { mutate: createChart, isPending } = useCreateReportChart();

  const measureOptions = (() => {
    const fromConfig = buildMeasureOptions(configuration?.aggregateColumns);
    return fromConfig.length ? fromConfig : FALLBACK_MEASURE_OPTIONS;
  })();

  // Prefer full catalog so edit mode can select groups even if selections are empty.
  const catalogRowFields = (configuration?.rowGroups ?? []).map(
    (group) => group.field,
  );
  const catalogColumnFields = (configuration?.columnGroups ?? []).map(
    (group) => group.field,
  );

  const groupByOptions = buildGroupByOptions({
    rowGroups: catalogRowFields.length
      ? catalogRowFields
      : selections?.rowGroups,
    columnGroups: catalogColumnFields.length
      ? catalogColumnFields
      : selections?.columnGroups,
    rowGroupOptions: configuration?.rowGroups,
    columnGroupOptions: configuration?.columnGroups,
  });

  useEffect(() => {
    if (!open) return;

    if (editingChart) {
      setForm(chartToFormState(editingChart, reportId));
      setChartData(editingChart);
    } else {
      setForm(initialChartState(reportId));
      setChartData(null);
    }
    setFieldErrors({});
    setHasApplied(false);
  }, [open, reportId, editingChart]);

  const setField = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
    setFieldErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
    // Config changes require Apply again before Save.
    if (field !== "chart_type") {
      setHasApplied(false);
    }
  };

  const fetchChart = (nextForm) => {
    if (!hasRequiredChartFields(nextForm, reportId)) return;

    setFieldErrors({});

    const payload = buildChartPayload({
      ...nextForm,
      report_id: Number(reportId),
      maximum_groups: Number(nextForm.maximum_groups),
      group_by: nextForm.group_by || null,
      benchmark: nextForm.benchmark || null,
      chart_id: isEditMode
        ? (nextForm.chart_id ?? getChartId(editingChart))
        : null,
    });

    createChart(payload, {
      onSuccess: (data) => {
        const chartId =
          data?.id ??
          data?.chart_id ??
          nextForm.chart_id ??
          getChartId(editingChart);

        setChartData(
          chartId != null ? { ...data, id: data?.id ?? chartId } : data,
        );
        setFieldErrors({});
        setHasApplied(true);

        if (chartId != null) {
          setForm((current) => ({
            ...current,
            chart_id: chartId,
          }));
        }
      },
      onError: (error) => {
        setHasApplied(false);
        const errorMap = getServerFieldErrorMap(error);

        if (!errorMap) {
          toast.error(getErrorMessage(error, "Failed to create chart"));
          return;
        }

        setFieldErrors(mapChartFieldErrors(errorMap));
      },
    });
  };

  const handleApply = () => {
    if (!hasRequiredChartFields(form, reportId)) return;
    fetchChart(form);
  };

  const handleChartTypeChange = (chartType) => {
    const previousType = form.chart_type;
    setForm((current) => ({
      ...current,
      chart_type: chartType,
    }));
    setFieldErrors((current) => {
      if (!current.chart_type) return current;
      const next = { ...current };
      delete next.chart_type;
      return next;
    });

    if (!hasRequiredChartFields(form, reportId)) {
      setHasApplied(false);
      return;
    }

    // Same data family: preview updates locally from last Apply — Save stays
    // enabled only if Apply already ran.
    if (!needsChartDataRefetch(previousType, chartType)) {
      return;
    }

    // Different data family: refetch, then allow Save after success.
    setHasApplied(false);
    fetchChart({ ...form, chart_type: chartType });
  };

  const handleSave = () => {
    if (!chartData || !hasApplied) return;

    const chartId = form.chart_id ?? getChartId(editingChart) ?? getChartId(chartData);
    const nextChart = {
      ...chartData,
      ...(chartId != null ? { id: chartId } : {}),
      chart_type: form.chart_type,
      chart_data: chartData.chart_data
        ? {
            ...chartData.chart_data,
            chart_type: form.chart_type,
          }
        : chartData.chart_data,
    };

    onSaved?.(nextChart);
    onOpenChange(false);
  };

  const previewChartData = chartData?.chart_data
    ? {
        ...chartData.chart_data,
        chart_type: form.chart_type || chartData.chart_data.chart_type,
      }
    : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] w-full flex-col gap-4 overflow-hidden sm:max-w-5xl">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Edit Chart" : "Create Chart"}
          </DialogTitle>
          <DialogDescription>
            Configure measures and grouping, then preview the chart.
          </DialogDescription>
        </DialogHeader>

        <div className="grid min-h-0 flex-1 gap-4 overflow-hidden md:grid-cols-3">
          <div className="flex min-h-0 flex-col gap-4 overflow-y-auto rounded-lg border bg-card p-4 md:col-span-1">
            <h3 className="text-sm font-medium">Chart Configuration</h3>

            <FieldSelect
              label="Measure (Y-axis)"
              value={form.yAxis}
              onValueChange={(value) => setField("yAxis", value)}
              options={measureOptions}
              error={fieldErrors.yAxis}
            />

            <FieldSelect
              label="Grouping"
              value={form.group_by}
              onValueChange={(value) => setField("group_by", value)}
              options={groupByOptions}
              placeholder={
                groupByOptions.length
                  ? "Select..."
                  : "Add row/column groups first"
              }
              disabled={!groupByOptions.length}
              error={fieldErrors.group_by}
            />

            <FieldSelect
              label="Sort by"
              value={form.sort_by}
              onValueChange={(value) => setField("sort_by", value)}
              options={SORT_OPTIONS}
              error={fieldErrors.sort_by}
            />

            <FieldSelect
              label="Maximum Grouping"
              value={String(form.maximum_groups)}
              onValueChange={(value) =>
                setField("maximum_groups", Number(value))
              }
              options={MAX_GROUP_OPTIONS}
              error={fieldErrors.maximum_groups}
            />

            <FieldSelect
              label="Benchmark for Y-axis"
              value={form.benchmark ? String(form.benchmark) : ""}
              onValueChange={(value) => setField("benchmark", value)}
              options={measureOptions}
              placeholder="Optional"
              error={fieldErrors.benchmark}
            />

            <div className="mt-auto flex justify-end pt-2">
              <Button
                type="button"
                onClick={handleApply}
                disabled={isPending || !hasRequiredChartFields(form, reportId)}
              >
                {isPending ? (
                  <span className="flex items-center gap-2">
                    <Spinner className="size-4" />
                    Applying
                  </span>
                ) : (
                  "Apply"
                )}
              </Button>
            </div>
          </div>

          <div className="flex min-h-0 flex-col gap-3 md:col-span-2">
            <div className="min-h-0 flex-1 overflow-y-auto rounded-lg border bg-card p-4">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <h4 className="text-sm font-medium">Chart Preview</h4>

                <div className="flex flex-col gap-1">
                  <Select
                    value={form.chart_type}
                    onValueChange={handleChartTypeChange}
                  >
                    <SelectTrigger
                      className="w-44 text-sm"
                      aria-invalid={Boolean(fieldErrors.chart_type)}
                    >
                      <SelectValue placeholder="Chart type" />
                    </SelectTrigger>
                    <SelectContent>
                      {CHART_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {fieldErrors.chart_type ? (
                    <FieldError>{fieldErrors.chart_type}</FieldError>
                  ) : null}
                </div>
              </div>

              <ReportChartComponent chartData={previewChartData} />
            </div>

            <div className="flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                disabled={!chartData || !hasApplied || isPending}
                onClick={handleSave}
              >
                Save
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateChartDialog;
