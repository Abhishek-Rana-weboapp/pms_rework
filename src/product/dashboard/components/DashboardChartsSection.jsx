import { Spinner } from "@/shared/components/ui/spinner";
import SectionWrapper from "@/shared/components/wrappers/SectionWrapper";
import { useDashboardCharts } from "../api/queries";
import ReportChartComponent from "./report/ReportChartComponent";

function humanize(value = "") {
  return String(value)
    .split("_")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

const DashboardChartsSection = ({ charts = [] }) => {
  const chartQueries = useDashboardCharts(charts);

  if (!charts.length) return null;

  return (
    <SectionWrapper className="w-full rounded-xl border border-slate-200/80 p-6 shadow-sm">
      <div className="mb-4">
        <h2 className="text-base font-bold text-slate-900">Report Charts</h2>
        <p className="mt-0.5 text-xs text-slate-500">
          Charts moved from custom reports
        </p>
      </div>

      <div className="flex w-full flex-col gap-4">
        {charts.map((chart, index) => {
          const query = chartQueries[index];
          const chartPayload = query?.data;
          const chartData = chartPayload?.chart_data ?? chartPayload;
          const title =
            chartPayload?.title ||
            chart.configuration?.group_by ||
            chart.chart_type ||
            `Chart ${chart.id}`;

          return (
            <div
              key={chart.uuid || chart.id}
              className="w-full min-w-0 rounded-lg border border-slate-200 p-4"
            >
              <div className="mb-3 flex items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-semibold capitalize text-slate-800">
                    {humanize(title)}
                  </h3>
                  <p className="text-xs capitalize text-slate-500">
                    {chart.chart_type}
                    {chart.configuration?.measure_field
                      ? ` · ${humanize(chart.configuration.measure)} ${humanize(chart.configuration.measure_field)}`
                      : ""}
                  </p>
                </div>
              </div>

              {query?.isLoading ? (
                <div className="flex h-72 items-center justify-center">
                  <Spinner />
                </div>
              ) : query?.isError ? (
                <div className="flex h-72 items-center justify-center text-sm text-red-500">
                  Failed to load chart
                </div>
              ) : (
                <ReportChartComponent
                  chartData={chartData}
                  benchmark={
                    ["pie", "doughnut"].includes(
                      chartData?.chart_type ?? chart.chart_type,
                    )
                      ? null
                      : (chart.configuration?.benchmark ??
                        chartPayload?.configuration?.benchmark ??
                        chartPayload?.benchmark ??
                        chartData?.benchmark)
                  }
                />
              )}
            </div>
          );
        })}
      </div>
    </SectionWrapper>
  );
};

export default DashboardChartsSection;
