import { useMemo, useState, useEffect } from "react";

import { Button } from "@/shared/components/ui/button";
import {
  MAX_VISIBLE_LANES,
  MONTH_BAR_HEIGHT,
  MONTH_LANE_HEIGHT,
  MONTH_MORE_HEIGHT,
  MONTH_ROW_HEIGHT,
  MONTH_ROW_PAD,
  WEEKDAY_LABELS,
} from "./calendarConstants";
import {
  assignMonthLanes,
  getDaysInMonth,
  getStartDayOffset,
  getStatusCategory,
  getStatusLabel,
  getTypeColor,
  getTypeLabel,
  getVisibleMonthArtifacts,
  isSameDay,
} from "./calendarUtils";

const CalendarMonthView = ({ artifacts, year, month }) => {
  const [morePopover, setMorePopover] = useState(null);

  const daysInMonth = getDaysInMonth(new Date(year, month));
  const offset = getStartDayOffset(year, month);
  const dates = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const visibleArtifacts = useMemo(
    () => getVisibleMonthArtifacts(artifacts, year, month),
    [artifacts, year, month],
  );

  const artifactsWithLanes = useMemo(
    () => assignMonthLanes(visibleArtifacts, offset),
    [visibleArtifacts, offset],
  );

  const hiddenByCell = useMemo(() => {
    // Keyed by "row-col" so "+N more" sits in the day cell that overflowed.
    const map = new Map();
    for (const item of artifactsWithLanes.items) {
      if (item.lane < MAX_VISIBLE_LANES) continue;
      for (const seg of item.segments) {
        for (let offsetCol = 0; offsetCol < seg.span; offsetCol += 1) {
          const col = seg.col + offsetCol;
          const key = `${seg.row}-${col}`;
          if (!map.has(key)) map.set(key, new Map());
          map.get(key).set(item.id, item);
        }
      }
    }

    const out = new Map();
    for (const [key, itemsMap] of map) {
      const [row, col] = key.split("-").map(Number);
      out.set(key, {
        row,
        col,
        count: itemsMap.size,
        items: Array.from(itemsMap.values()),
      });
    }
    return out;
  }, [artifactsWithLanes.items]);

  useEffect(() => {
    if (!morePopover) return;
    const onDown = (e) => {
      const pop = document.getElementById("gc-more-popover");
      if (pop && pop.contains(e.target)) return;
      setMorePopover(null);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [morePopover]);

  const totalCells = offset + daysInMonth;
  const totalRows = Math.ceil(totalCells / 7);

  const popoverItems =
    morePopover != null
      ? hiddenByCell.get(morePopover.key)?.items || []
      : [];

  return (
    <>
      <div className="grid grid-cols-7 rounded-t-lg border border-border bg-muted/40 py-2.5 text-xs text-muted-foreground">
        {WEEKDAY_LABELS.map((day) => (
          <div key={day} className="text-center font-medium">
            {day}
          </div>
        ))}
      </div>

      <div
        className="relative w-full rounded-b-lg border-x border-b border-border"
        style={{ height: `${totalRows * MONTH_ROW_HEIGHT}px` }}
      >
        <div
          className="absolute inset-0 grid grid-cols-7"
          style={{
            gridTemplateRows: `repeat(${totalRows}, ${MONTH_ROW_HEIGHT}px)`,
          }}
        >
          {Array.from({ length: offset }).map((_, i) => (
            <div key={`e-${i}`} className="border border-border/40" />
          ))}
          {dates.map((date) => {
            const d = new Date(year, month, date);
            const isToday = isSameDay(d, today);
            return (
              <div
                key={date}
                className={`flex items-start justify-center border border-border/40 pt-1 text-sm ${
                  isToday ? "bg-blue-50/40" : ""
                }`}
              >
                <span
                  className={
                    isToday
                      ? "flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs font-semibold text-white"
                      : "text-muted-foreground"
                  }
                >
                  {date}
                </span>
              </div>
            );
          })}
          {Array.from({
            length: totalRows * 7 - offset - daysInMonth,
          }).map((_, i) => (
            <div key={`t-${i}`} className="border border-border/40" />
          ))}
        </div>

        {morePopover && (
          <div
            id="gc-more-popover"
            className="absolute z-20 w-72 rounded-xl border border-border bg-background p-3 shadow-lg"
            style={{ left: morePopover.x, top: morePopover.y }}
          >
            <div className="mb-2 flex items-center justify-between">
              <div className="text-sm font-semibold">Items</div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 px-2"
                onClick={() => setMorePopover(null)}
              >
                ✕
              </Button>
            </div>
            <div className="flex max-h-44 flex-col gap-1.5 overflow-auto">
              {popoverItems.map((item) => (
                <div
                  key={item.id}
                  className="flex cursor-default items-center gap-2 rounded-lg border border-border/60 px-2 py-2 hover:bg-muted/50"
                >
                  <span
                    className="shrink-0 rounded px-1.5 py-0.5 text-[9px] font-bold text-white"
                    style={{ background: getTypeColor(item) }}
                  >
                    {getTypeLabel(item)}
                  </span>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium">
                      {item.title || item.name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {item.start_date} → {item.target_date || item.end_date}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div
          className="pointer-events-none absolute inset-0 grid grid-cols-7"
          style={{
            gridTemplateRows: `repeat(${totalRows}, ${MONTH_ROW_HEIGHT}px)`,
          }}
        >
          {Array.from(hiddenByCell.values()).map((info) => (
            <button
              key={`m-${info.row}-${info.col}`}
              type="button"
              className="pointer-events-auto z-10 self-start justify-self-center px-1 text-[11px] font-medium text-blue-600 hover:text-blue-700"
              style={{
                gridColumn: info.col + 1,
                gridRow: info.row + 1,
                marginTop: `${MONTH_ROW_PAD + MAX_VISIBLE_LANES * MONTH_LANE_HEIGHT}px`,
                height: `${MONTH_MORE_HEIGHT}px`,
                lineHeight: `${MONTH_MORE_HEIGHT}px`,
              }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                const container = e.currentTarget.closest(".relative");
                const rect = container?.getBoundingClientRect?.();
                const key = `${info.row}-${info.col}`;
                if (!rect) {
                  setMorePopover({ key, x: 16, y: 16 });
                  return;
                }
                setMorePopover({
                  key,
                  x: Math.min(
                    rect.width - 290,
                    Math.max(12, e.clientX - rect.left),
                  ),
                  y: Math.min(
                    rect.height - 220,
                    Math.max(12, e.clientY - rect.top),
                  ),
                });
              }}
            >
              +{info.count} more
            </button>
          ))}

          {artifactsWithLanes.items
            .filter((a) => a.lane < MAX_VISIBLE_LANES)
            .flatMap((art) =>
              art.segments.map((seg, idx) => {
                const cat = getStatusCategory(art);
                const typeColor = getTypeColor(art);
                return (
                  <div
                    key={`${art.id}-${idx}`}
                    title={`${art.title || art.name} · ${getTypeLabel(art)} · ${getStatusLabel(cat)}`}
                    className="pointer-events-auto mx-0.5 flex min-w-0 cursor-default items-center gap-1.5 overflow-hidden rounded-md px-2 py-0.5 text-[11px] text-white shadow-sm"
                    style={{
                      gridColumn: `${seg.col + 1} / span ${seg.span}`,
                      gridRow: `${seg.row + 1}`,
                      alignSelf: "start",
                      height: `${MONTH_BAR_HEIGHT}px`,
                      lineHeight: `${MONTH_BAR_HEIGHT}px`,
                      marginTop: `${MONTH_ROW_PAD + art.lane * MONTH_LANE_HEIGHT}px`,
                      backgroundColor: typeColor,
                    }}
                  >
                    {idx === 0 && (
                      <>
                        <span className="shrink-0 rounded bg-black/20 px-1 text-[9px] font-bold">
                          {getTypeLabel(art)}
                        </span>
                        <span className="truncate">
                          {art.title || art.name}
                        </span>
                        {seg.span >= 2 && cat && (
                          <span className="ml-auto shrink-0 rounded bg-white/25 px-1 text-[9px] font-medium">
                            {getStatusLabel(cat)}
                          </span>
                        )}
                      </>
                    )}
                  </div>
                );
              }),
            )}
        </div>
      </div>
    </>
  );
};

export default CalendarMonthView;
