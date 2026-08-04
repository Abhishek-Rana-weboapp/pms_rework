import {
  AlertTriangle,
  ChartLine,
  Check,
  CircleGauge,
  Flame,
  Loader,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

import SectionWrapper from "@/shared/components/wrappers/SectionWrapper";
import { cn } from "@/shared/lib/utils";
import { humanize } from "../../config/artifacts/artifactConfig";

const SUMMARY_META = {
  total_tasks_completed: {
    icon: Check,
    iconClass: "bg-emerald-500/10 text-emerald-600",
  },
  story_points_completed: {
    icon: ChartLine,
    iconClass: "bg-sky-500/10 text-sky-600",
  },
  avg_velocity: {
    icon: CircleGauge,
    iconClass: "bg-violet-500/10 text-violet-600",
  },
  wip_count: {
    icon: Loader,
    iconClass: "bg-orange-500/10 text-orange-600",
  },
  burn_rate: {
    icon: Flame,
    iconClass: "bg-teal-500/10 text-teal-700",
  },
};

const formatValue = (key, value) => {
  if (value == null) return "—";
  if (key === "burn_rate") return `${value}%`;
  return value;
};

export const ReportSummaryCards = ({ count = {}, isLoading }) => {
  const keys = Object.keys(SUMMARY_META);

  return (
    <div className="grid gap-4 md:grid-cols-3 grid-cols-2 xl:grid-cols-5">
      {keys.map((key) => {
        const meta = SUMMARY_META[key];
        const Icon = meta.icon;
        return (
          <SectionWrapper
            key={key}
            className="flex items-start justify-between gap-3 max-sm:p-3"
          >
            <div className="min-w-0 space-y-1">
              <p className="text-xs sm:text-sm text-muted-foreground">{humanize(key)}</p>
              <p className="text-xl sm:text-2xl font-semibold tabular-nums md:text-3xl">
                {isLoading ? "—" : formatValue(key, count[key])}
              </p>
            </div>
            <span className={cn("rounded-lg p-2", meta.iconClass)}>
              <Icon className="size-5" />
            </span>
          </SectionWrapper>
        );
      })}
    </div>
  );
};

const trendStyles = {
  up: {
    wrap: "border-sky-100 bg-sky-50",
    icon: "text-sky-600",
    title: "text-sky-900",
    body: "text-sky-700",
    label: "Velocity Trending Up",
    Icon: TrendingUp,
  },
  down: {
    wrap: "border-rose-100 bg-rose-50",
    icon: "text-rose-600",
    title: "text-rose-900",
    body: "text-rose-700",
    label: "Velocity Trending Down",
    Icon: TrendingDown,
  },
  default: {
    wrap: "border-emerald-100 bg-emerald-50",
    icon: "text-emerald-600",
    title: "text-emerald-900",
    body: "text-emerald-700",
    label: "On Track",
    Icon: Check,
  },
};

export const ReportKeyInsights = ({ insights, wipCount, isLoading }) => {
  const trend = String(insights?.trend ?? "").toLowerCase();
  const style = trendStyles[trend] ?? trendStyles.default;
  const TrendIcon = style.Icon;

  return (
    <SectionWrapper>
      <h3 className="mb-4 font-semibold">Key Insights</h3>
      <div className="grid gap-4 md:grid-cols-3">
        <div className={cn("rounded-xl border p-4", style.wrap)}>
          <div className="mb-1.5 flex items-center gap-2">
            <TrendIcon className={cn("size-4", style.icon)} />
            <span className={cn("text-sm font-semibold", style.title)}>
              {style.label}
            </span>
          </div>
          <p className={cn("text-sm leading-relaxed", style.body)}>
            {isLoading
              ? "Loading…"
              : insights?.summary || "No insight available"}
          </p>
        </div>

        <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4">
          <div className="mb-1.5 flex items-center gap-2">
            <Check className="size-4 text-emerald-600" />
            <span className="text-sm font-semibold text-emerald-900">
              Change
            </span>
          </div>
          <p className="text-sm leading-relaxed text-emerald-700">
            {isLoading
              ? "Loading…"
              : insights?.change_percent != null
                ? `${insights.change_percent}% change vs previous period`
                : "No data"}
          </p>
        </div>

        <div className="rounded-xl border border-sky-100 bg-sky-50 p-4">
          <div className="mb-1.5 flex items-center gap-2">
            <AlertTriangle className="size-4 text-sky-600" />
            <span className="text-sm font-semibold text-sky-900">WIP</span>
          </div>
          <p className="text-sm leading-relaxed text-sky-700">
            {isLoading
              ? "Loading…"
              : `${wipCount ?? 0} tasks currently in progress`}
          </p>
        </div>
      </div>
    </SectionWrapper>
  );
};
