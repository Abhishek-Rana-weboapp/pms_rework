import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import ChartPanel from "./ChartPanel";
import { ChartLegend } from "./ChartLegend";
import ChartTooltip from "./ChartTooltip";

const LEGEND = [
  { label: "Ideal Progress", color: "#111827" },
  { label: "Actual Progress", color: "#ef4444" },
  { label: "Projected Completion", color: "#f59e0b" },
];

const ActualDot = ({ cx, cy }) => {
  if (cx == null || cy == null) return null;
  return (
    <circle cx={cx} cy={cy} r={5} fill="#ef4444" stroke="#fff" strokeWidth={2} />
  );
};

const BurndownChart = ({ data = [], isLoading }) => (
  <ChartPanel
    title="Burndown Chart"
    description="Work progress against time"
    isLoading={isLoading}
    isEmpty={!data.length}
  >
    <ResponsiveContainer width="100%" height={230}>
      <LineChart
        data={data}
        margin={{ top: 5, right: 10, left: 0, bottom: 25 }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="hsl(var(--border))"
          vertical={false}
        />
        <XAxis
          dataKey="day"
          tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }}
          axisLine={false}
          tickLine={false}
          label={{
            value: "Time",
            position: "insideBottom",
            offset: -18,
            fontSize: 11,
            fill: "hsl(var(--muted-foreground))",
          }}
        />
        <YAxis
          tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
          axisLine={false}
          tickLine={false}
          label={{
            value: "Story Point",
            angle: -90,
            position: "insideLeft",
            offset: 12,
            fontSize: 10,
            fill: "hsl(var(--muted-foreground))",
          }}
        />
        <Tooltip content={<ChartTooltip />} />
        <Line
          type="linear"
          dataKey="ideal"
          name="Ideal Progress"
          stroke="#111827"
          strokeWidth={1.5}
          dot={false}
        />
        <Line
          type="monotone"
          dataKey="actual"
          name="Actual Progress"
          stroke="#ef4444"
          strokeWidth={2.5}
          dot={<ActualDot />}
        />
        <Line
          type="monotone"
          dataKey="projected"
          name="Projected Completion"
          stroke="#f59e0b"
          strokeWidth={1.5}
          strokeDasharray="5 3"
          dot={false}
          connectNulls={false}
        />
      </LineChart>
    </ResponsiveContainer>
    <ChartLegend items={LEGEND} square />
  </ChartPanel>
);

export default BurndownChart;
