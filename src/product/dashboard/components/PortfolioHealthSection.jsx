import SectionWrapper from "@/shared/components/wrappers/SectionWrapper";
import React from "react";
import { Pie, PieChart, ResponsiveContainer } from "recharts";

const PortfolioHealthSection = ({ data }) => {
  const onTrack = data?.on_track ?? 0;
  const delayed = data?.delayed ?? 0;

  const total = onTrack + delayed;

  const chartData =
    total === 0
      ? [
          {
            name: "Empty",
            value: 1,
            fill: "#e2e8f0",
          },
        ]
      : [
          {
            name: "On Track",
            value: onTrack,
            fill: "#06b6d4",
          },
          {
            name: "Delayed",
            value: delayed,
            fill: "#ef4444",
          },
        ];

  const healthyPercentage =
    total > 0 ? Math.round((onTrack / total) * 100) : 0;

  const mainLabel =
    total === 0
      ? "No Data"
      : onTrack >= delayed
        ? "Healthy"
        : "Delayed";

  return (
    <SectionWrapper>

        <h3 className="font-semibold">Portfolio Health</h3>
        <div className="relative flex flex-col items-center">
          <div className="relative h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius="60%"
                  outerRadius="92%"
                  paddingAngle={total > 0 ? 2 : 0}
                  stroke="none"
                  startAngle={90}
                  endAngle={-270}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold tracking-tight text-slate-900">
                  {healthyPercentage}%
                </span>
                <span className="text-xs font-medium text-slate-500">
                  {mainLabel}
                </span>
              </div>
            </div>
          </div>
          <div className="mt-2 flex w-full items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-cyan-500" />
              <span className="text-[11px] text-slate-500">
                On Track ({onTrack})
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-rose-500" />
              <span className="text-[11px] text-slate-500">
                Delayed ({delayed})
              </span>
            </div>
          </div>
        </div>
    </SectionWrapper>
  );
};

export default PortfolioHealthSection;