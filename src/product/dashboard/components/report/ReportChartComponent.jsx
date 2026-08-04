import { humanize } from "@/product/project/config/artifacts/artifactConfig";
import {
  ResponsiveContainer,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  ReferenceLine,
} from "recharts";

const chartColors = [
  "#2563eb",
  "#16a34a",
  "#dc2626",
  "#9333ea",
  "#ea580c",
  "#0891b2",
];

const transformChartData = (chartData) => {
  const { labels = [], datasets = [] } = chartData;

  return labels.map((label, index) => {
    const row = { name: humanize(label.toLowerCase()) };

    datasets.forEach((dataset, datasetIndex) => {
      row[`value_${datasetIndex}`] = dataset.data[index] ?? 0;
    });

    return row;
  });
};

const resolveBenchmark = (chartData, benchmarkProp) => {
  if (["pie", "doughnut"].includes(chartData?.chart_type)) {
    return null;
  }

  const raw =
    benchmarkProp ??
    chartData?.benchmark ??
    chartData?.configuration?.benchmark;

  if (raw == null || raw === "") return null;

  const value = Number(raw);
  return Number.isFinite(value) ? value : null;
};

const BenchmarkLine = ({ value, axis = "y" }) => {
  if (value == null) return null;

  const props = axis === "x" ? { x: value } : { y: value };

  return (
    <ReferenceLine
      {...props}
      stroke="#dc2626"
      strokeDasharray="6 4"
      strokeWidth={2}
      ifOverflow="extendDomain"
      label={{
        value: `Benchmark (${value})`,
        position: "insideTopRight",
        fill: "#dc2626",
        fontSize: 12,
      }}
    />
  );
};

const ReportChartComponent = ({ chartData, benchmark: benchmarkProp }) => {
  if (!chartData) {
    return (
      <div className="flex h-80 items-center justify-center text-muted-foreground">
        No chart data available
      </div>
    );
  }

  const {
    chart_type,
    group_by,
    measure,
    x_axis,
    y_axis,
    datasets = [],
    slices = [],
  } = chartData;

  const data = transformChartData(chartData);
  const benchmark = resolveBenchmark(chartData, benchmarkProp);
  const groupLabel = group_by?.label ?? humanize(x_axis?.label.toLowerCase());
  const measureLabel = measure?.label ?? humanize(y_axis?.label.toLowerCase());
  

  const commonProps = {
    data,
    margin: {
      top: 28,
      right: 30,
      left: 20,
      bottom: 28,
    },
  };

  const yAxisLabel = {
    value: measureLabel,
    angle: -90,
    position: "insideLeft",
    // Rotated labels default to the top; middle + dy centers them on the plot.
    style: { textAnchor: "middle" },
    dy: 0,
    offset: -5,
  };

  const renderChart = () => {
    switch (chart_type) {
      case "bar":
        return (
          <BarChart {...commonProps} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis type="category" dataKey="name" width={100} />
            <Tooltip />
            <Legend position="top" height={28} />
            <BenchmarkLine value={benchmark} axis="x" />
            {datasets.map((dataset, index) => (
              <Bar
                key={dataset.label}
                dataKey={`value_${index}`}
                name={dataset.label}
                fill={chartColors[index % chartColors.length]}
                radius={[0, 4, 4, 0]}
              />
            ))}
          </BarChart>
        );

      case "column":
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="name"
              label={{
                value: groupLabel,
                position: "insideBottom",
                offset: -10,
              }}
            />
            <YAxis label={yAxisLabel} />
            <Tooltip />
            <Legend position="top" height={28} />
            <BenchmarkLine value={benchmark} />
            {datasets.map((dataset, index) => (
              <Bar
                key={dataset.label}
                dataKey={`value_${index}`}
                name={dataset.label}
                fill={chartColors[index % chartColors.length]}
                radius={[4, 4, 0, 0]}
              />
            ))}
          </BarChart>
        );

      case "line":
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="name"
              label={{
                value: groupLabel,
                position: "insideBottom",
                offset: -20,
              }}
            />
            <YAxis label={yAxisLabel} />
            <Tooltip />
            <Legend position="top" height={28} />
            <BenchmarkLine value={benchmark} />
            {datasets.map((dataset, index) => (
              <Line
                key={dataset.label}
                type="monotone"
                dataKey={`value_${index}`}
                name={dataset.label}
                stroke={chartColors[index % chartColors.length]}
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            ))}
          </LineChart>
        );

      case "area":
        return (
          <AreaChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="name"
              label={{
                value: groupLabel,
                position: "insideBottom",
                offset: -10,
              }}
            />
            <YAxis label={yAxisLabel} />
            <Tooltip />
            <Legend position="top" height={28} />
            <BenchmarkLine value={benchmark} />
            {datasets.map((dataset, index) => (
              <Area
                key={dataset.label}
                type="monotone"
                dataKey={`value_${index}`}
                name={dataset.label}
                stroke={chartColors[index % chartColors.length]}
                fill={chartColors[index % chartColors.length]}
                fillOpacity={0.3}
              />
            ))}
          </AreaChart>
        );

      case "pie":
        return (
          <PieChart>
            <Tooltip
              formatter={(value, name, props) => [
                `${value} (${props.payload.percentage}%)`,
                name,
              ]}
            />
            <Legend />
            <Pie
              data={slices}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={130}
              label={({ name, percentage }) => `${name} ${percentage}%`}
            >
              {slices.map((slice, index) => (
                <Cell
                  key={slice.name}
                  fill={chartColors[index % chartColors.length]}
                />
              ))}
            </Pie>
          </PieChart>
        );

      case "doughnut":
        return (
          <PieChart>
            <Tooltip
              formatter={(value, name, props) => [
                `${value} (${props.payload.percentage}%)`,
                name,
              ]}
            />
            <Legend />
            <Pie
              data={slices}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={130}
              paddingAngle={3}
              label={({ name, percentage }) => `${name} ${percentage}%`}
            >
              {slices.map((slice, index) => (
                <Cell
                  key={slice.name}
                  fill={chartColors[index % chartColors.length]}
                />
              ))}
            </Pie>
          </PieChart>
        );

      default:
        return (
          <div className="flex h-80 items-center justify-center text-muted-foreground">
            Unsupported chart type: {chart_type}
          </div>
        );
    }
  };

  return (
    <div className="h-80 w-full min-w-0" style={{ width: "100%" }}>
      <ResponsiveContainer width="100%" height="100%" minWidth={0}>
        {renderChart()}
      </ResponsiveContainer>
    </div>
  );
};

export default ReportChartComponent;
