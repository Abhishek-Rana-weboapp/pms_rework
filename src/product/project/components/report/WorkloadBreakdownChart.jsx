import { Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import ChartPanel from "./ChartPanel";
import { ChartLegend } from "./ChartLegend";

const RADIAN = Math.PI / 180;

const renderPieLabel = ({
  cx,
  cy,
  midAngle,
  outerRadius,
  name,
  value,
}) => {
  const radius = outerRadius + 28;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  const ex = cx + (outerRadius + 10) * Math.cos(-midAngle * RADIAN);
  const ey = cy + (outerRadius + 10) * Math.sin(-midAngle * RADIAN);

  return (
    <g>
      <line
        x1={ex}
        y1={ey}
        x2={x}
        y2={y}
        stroke="hsl(var(--muted-foreground))"
        strokeWidth={1}
      />
      <text
        x={x}
        y={y - 6}
        textAnchor={x > cx ? "start" : "end"}
        fill="hsl(var(--foreground))"
        fontSize={11}
        fontWeight={600}
      >
        {name}
      </text>
      <text
        x={x}
        y={y + 8}
        textAnchor={x > cx ? "start" : "end"}
        fill="#3b82f6"
        fontSize={11}
        fontWeight={600}
      >
        {value}
      </text>
    </g>
  );
};

const WorkloadBreakdownChart = ({
  data = [],
  total = 0,
  isLoading,
}) => {
  const centerLabel = total > 0 ? "100%" : "0%";
  // Recharts reads per-slice `fill` from the data (Cell is deprecated).
  const pieData = data.map((entry) => ({
    ...entry,
    fill: entry.color,
  }));

  return (
    <ChartPanel
      title="Workload Breakdown"
      description="Task composition by type"
      isLoading={isLoading}
      isEmpty={!data.length}
    >
      <div className="relative overflow-visible">
        <ResponsiveContainer width="100%" height={300}>
          <PieChart margin={{ top: 36, right: 48, bottom: 24, left: 48 }}>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={78}
              dataKey="value"
              paddingAngle={1}
              startAngle={90}
              endAngle={-270}
              label={renderPieLabel}
              labelLine={false}
            />
            <Tooltip formatter={(value, name) => [value, name]} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <span className="text-xl font-bold text-foreground">{centerLabel}</span>
        </div>
      </div>
      <ChartLegend
        square
        items={data.map((d) => ({ label: d.name, color: d.color }))}
      />
    </ChartPanel>
  );
};

export default WorkloadBreakdownChart;
