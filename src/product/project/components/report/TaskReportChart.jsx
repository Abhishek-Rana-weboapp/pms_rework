import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import ChartPanel from "./ChartPanel";
import ChartTooltip from "./ChartTooltip";

const TaskReportChart = ({
  data = [],
  axisLabels = {},
  isLoading,
  actions,
}) => (
  <ChartPanel
    title="Task Report"
    description="Tasks completed over time"
    actions={actions}
    isLoading={isLoading}
    isEmpty={!data.length}
  >
    <div className="rounded-md border border-border bg-muted/30 p-3">
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart
          data={data}
          margin={{ top: 10, right: 15, left: 5, bottom: 25 }}
        >
          <defs>
            <linearGradient id="taskFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#67e8f9" stopOpacity={0.5} />
              <stop offset="50%" stopColor="#99f6e4" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#d1fae5" stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
            axisLine={{ stroke: "hsl(var(--border))" }}
            tickLine={false}
            label={{
              value: axisLabels.x || "Time",
              position: "insideBottom",
              offset: -18,
              fontSize: 11,
              fill: "hsl(var(--muted-foreground))",
            }}
          />
          <YAxis
            tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
            axisLine={{ stroke: "hsl(var(--border))" }}
            tickLine={false}
            label={{
              value: axisLabels.y || "Tasks Completed",
              angle: -90,
              position: "insideLeft",
              offset: 8,
              fontSize: 11,
              fill: "hsl(var(--muted-foreground))",
            }}
          />
          <Tooltip content={<ChartTooltip />} />
          <Area
            type="monotone"
            dataKey="value"
            name="Tasks"
            stroke="#06b6d4"
            strokeWidth={2.5}
            fill="url(#taskFill)"
            dot={{ r: 3.5, fill: "#fff", stroke: "#06b6d4", strokeWidth: 2 }}
            activeDot={{ r: 5, fill: "#06b6d4" }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  </ChartPanel>
);

export default TaskReportChart;
