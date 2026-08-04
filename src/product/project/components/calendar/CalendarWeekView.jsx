import { useMemo } from "react";

import {
  WEEK_BAR_HEIGHT,
  WEEK_LANE_HEIGHT,
  WEEK_TOP_PAD,
  WEEKDAY_LABELS,
} from "./calendarConstants";
import {
  assignWeekLanes,
  getStatusCategory,
  getStatusLabel,
  getTypeColor,
  getTypeLabel,
  getWeekArtifacts,
  getWeekDates,
  isSameDay,
} from "./calendarUtils";

const CalendarWeekView = ({ artifacts, weekStart }) => {
  const weekDates = useMemo(() => getWeekDates(weekStart), [weekStart]);

  const weekArtifactsWithLanes = useMemo(() => {
    const weekArtifacts = getWeekArtifacts(artifacts, weekStart);
    return assignWeekLanes(weekArtifacts);
  }, [artifacts, weekStart]);

  const maxLane = weekArtifactsWithLanes.reduce(
    (max, art) => Math.max(max, art.lane),
    -1,
  );
  const contentHeight = Math.max(
    400,
    WEEK_TOP_PAD + (maxLane + 1) * WEEK_LANE_HEIGHT + 60,
  );

  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <div className="grid grid-cols-7 border-b border-border bg-muted/40">
        {weekDates.map((date, i) => {
          const isToday = isSameDay(date, new Date());
          return (
            <div
              key={i}
              className={`border-r border-border/60 py-2.5 text-center last:border-r-0 ${
                isToday ? "border-b-2 border-b-blue-500 bg-blue-50" : ""
              }`}
            >
              <div
                className={`text-xs font-medium ${
                  isToday ? "text-blue-600" : "text-muted-foreground"
                }`}
              >
                {WEEKDAY_LABELS[i]}
              </div>
            </div>
          );
        })}
      </div>

      <div className="relative" style={{ minHeight: `${contentHeight}px` }}>
        <div className="absolute inset-0 grid grid-cols-7">
          {weekDates.map((date, i) => {
            const isToday = isSameDay(date, new Date());
            return (
              <div
                key={i}
                className={`border-r border-border/60 last:border-r-0 ${
                  isToday ? "bg-blue-50/30" : ""
                }`}
              >
                <div className="pt-2.5 pl-3">
                  <span
                    className={
                      isToday
                        ? "inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs font-semibold text-white"
                        : "text-sm font-semibold text-muted-foreground"
                    }
                  >
                    {date.getDate()}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="pointer-events-none absolute inset-0 grid grid-cols-7">
          {weekArtifactsWithLanes.map((art) => {
            const cat = getStatusCategory(art);
            const typeColor = getTypeColor(art);
            const isCurrent = Boolean(art.current);

            return (
              <div
                key={art.id}
                title={`${art.title || art.name} · ${getTypeLabel(art)} · ${getStatusLabel(cat)}`}
                className="pointer-events-auto mx-1 flex cursor-default items-center gap-2 overflow-hidden rounded-lg px-3 text-white shadow-sm"
                style={{
                  gridColumn: `${art.startCol + 1} / span ${art.span}`,
                  gridRow: 1,
                  alignSelf: "start",
                  height: `${WEEK_BAR_HEIGHT}px`,
                  marginTop: `${WEEK_TOP_PAD + art.lane * WEEK_LANE_HEIGHT}px`,
                  backgroundColor: typeColor,
                }}
              >
                <span className="shrink-0 rounded bg-black/20 px-1.5 py-0.5 text-[9px] font-bold">
                  {getTypeLabel(art)}
                </span>
                <span className="truncate text-xs font-medium">
                  {art.title || art.name}
                </span>
                {isCurrent ? (
                  <span className="ml-auto shrink-0 rounded bg-white/25 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                    Current
                  </span>
                ) : cat ? (
                  <span className="ml-auto shrink-0 rounded bg-white/25 px-1.5 py-0.5 text-[10px] font-medium">
                    {getStatusLabel(cat)}
                  </span>
                ) : null}
              </div>
            );
          })}
        </div>

        {weekArtifactsWithLanes.some((a) => a.current) && (
          <div className="pointer-events-none absolute right-0 bottom-0 left-0 grid grid-cols-7 pb-3">
            {weekArtifactsWithLanes
              .filter((a) => a.current)
              .map((art) => (
                <div
                  key={`bot-${art.id}`}
                  className="pointer-events-auto mx-1 flex cursor-default items-center gap-2 rounded-lg px-3 text-white shadow-md"
                  style={{
                    gridColumn: `${art.startCol + 1} / span ${art.span}`,
                    height: "32px",
                    background: "linear-gradient(135deg, #3b82f6, #6366f1)",
                  }}
                >
                  <span className="h-3 w-3 shrink-0 rounded-full bg-white/30" />
                  <span className="truncate text-xs font-semibold">
                    {art.title || art.name}
                  </span>
                  <span className="ml-auto shrink-0 rounded bg-white/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                    Current
                  </span>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CalendarWeekView;
