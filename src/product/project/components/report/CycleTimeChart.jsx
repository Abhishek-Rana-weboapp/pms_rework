import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import ChartPanel from "./ChartPanel";
import { ChartLegend } from "./ChartLegend";
import ChartTooltip from "./ChartTooltip";
import { CYCLE_LEGEND, colorForType } from "./reportConstants";

const CycleTimeChart = ({ data = [], isLoading }) => (
  <ChartPanel
    title="Cycle-Time Chart"
    description="Average days to complete by task type"
    isLoading={isLoading}
    isEmpty={!data.length}
  >
    <ResponsiveContainer width="100%" height={220}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 0, right: 20, left: 0, bottom: 25 }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="hsl(var(--border))"
          horizontal={false}
        />
        <XAxis
          type="number"
          tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
          axisLine={false}
          tickLine={false}
          orientation="top"
          label={{
            value: "Days",
            position: "insideBottom",
            offset: -18,
            fontSize: 11,
            fill: "hsl(var(--muted-foreground))",
          }}
        />
        <YAxis
          dataKey="type"
          type="category"
          tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
          axisLine={false}
          tickLine={false}
          width={56}
          label={{
            value: "Type",
            angle: -90,
            position: "insideLeft",
            offset: -10,
            fontSize: 10,
            fill: "hsl(var(--muted-foreground))",
          }}
        />
        <Tooltip content={<ChartTooltip />} />
        <Bar dataKey="days" name="Days" radius={[0, 4, 4, 0]} barSize={24}>
          {data.map((entry, index) => (
            <Cell
              key={`${entry.type}-${index}`}
              fill={colorForType(entry.type, index)}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
    <ChartLegend items={CYCLE_LEGEND} square />
  </ChartPanel>
);

export default CycleTimeChart;
