import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import ChartPanel from "./ChartPanel";
import { ChartLegend } from "./ChartLegend";
import ChartTooltip from "./ChartTooltip";

const LEGEND = [
  { label: "Committed Story Points", color: "#3b82f6" },
  { label: "Delivered Story Points", color: "#22c55e" },
  { label: "Average Velocity", color: "#111827" },
];

const VelocityChart = ({ data = [], isLoading }) => (
  <ChartPanel
    title="Velocity Chart"
    description="Story points committed vs delivered per sprint"
    isLoading={isLoading}
    isEmpty={!data.length}
  >
    <ResponsiveContainer width="100%" height={230}>
      <ComposedChart
        data={data}
        margin={{ top: 5, right: 10, left: 0, bottom: 25 }}
        barGap={2}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="hsl(var(--border))"
          vertical={false}
        />
        <XAxis
          dataKey="sprint"
          tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
          axisLine={false}
          tickLine={false}
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
        <Bar
          dataKey="committed"
          name="Committed Story Points"
          fill="#3b82f6"
          radius={[2, 2, 0, 0]}
          barSize={24}
        />
        <Bar
          dataKey="delivered"
          name="Delivered Story Points"
          fill="#22c55e"
          radius={[2, 2, 0, 0]}
          barSize={24}
        />
        <Line
          type="monotone"
          dataKey="avg"
          name="Average Velocity"
          stroke="#111827"
          strokeWidth={2}
          dot={{ r: 4, fill: "#111827", stroke: "#fff", strokeWidth: 2 }}
        />
      </ComposedChart>
    </ResponsiveContainer>
    <ChartLegend items={LEGEND} />
  </ChartPanel>
);

export default VelocityChart;
