import { EllipsisVertical } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import ReportChartComponent from "./ReportChartComponent";
import { getChartId } from "./reportUtils";

const ReportChartSection = ({
  chart,
  onEditChart,
  onMoveToDashboard,
  onDeleteChart,
  isActionPending = false,
}) => {
  if (!chart) return null;

  const chartData = chart.chart_data ?? chart;
  const chartId = getChartId(chart);
  const isPieFamily = ["pie", "doughnut"].includes(chartData?.chart_type);
  const benchmark = isPieFamily
    ? null
    : (chart?.configuration?.benchmark ??
      chart?.benchmark ??
      chartData?.benchmark ??
      chartData?.configuration?.benchmark);

  return (
    <div className="mb-6 rounded-md border border-neutral-200 p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="text-sm font-medium text-gray-700">Chart</h3>

        {chartId ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                disabled={isActionPending}
                aria-label="Chart actions"
              >
                <EllipsisVertical className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-44">
              <DropdownMenuItem
                disabled={isActionPending}
                onSelect={() => onMoveToDashboard?.()}
              >
                Move to dashboard
              </DropdownMenuItem>
              <DropdownMenuItem
                disabled={isActionPending}
                onSelect={() => onEditChart?.()}
              >
                Edit Chart
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                disabled={isActionPending}
                onSelect={() => onDeleteChart?.()}
              >
                Delete Chart
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : null}
      </div>

      <ReportChartComponent chartData={chartData} benchmark={benchmark} />
    </div>
  );
};

export default ReportChartSection;
