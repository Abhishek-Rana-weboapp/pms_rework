import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight, GripVertical } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { DragDropProvider, DragOverlay, useDroppable } from "@dnd-kit/react";
import { useSortable } from "@dnd-kit/react/sortable";

import { moveCard } from "@/shared/lib/dnd/moveCard";

import { Badge } from "@/shared/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import { cn } from "@/shared/lib/utils";

// Fixed column widths (px). The rail keeps its content at these fixed widths so
// the width tween just reveals/clips it instead of reflowing the layout.
const COLUMN_WIDTH = 288; // matches w-72
const RAIL_WIDTH = 48; // matches w-12

/**
 * Reusable Kanban board built on @dnd-kit/react (the new signal-based dnd-kit,
 * NOT the classic @dnd-kit/core API).
 *
 * Columns and cards are addressed by a stable `id`. Cards are sortable within a
 * column and draggable across columns; columns themselves are fixed but can be
 * collapsed into a rail (Zoho-style). The board is self-contained — it seeds
 * internal state from `columns` and stays usable without a controlling parent —
 * but every change is surfaced through `onColumnsChange` / `onCardMove` so a
 * parent can persist it.
 *
 * Layout: the board fills its parent's height (`h-full`), scrolls horizontally
 * when columns overflow, and each column scrolls its own cards vertically. Give
 * it a height-bounded parent for the internal scrolling to engage.
 *
 * @param {Array<{id: string|number, title: string, cards: Array<{id: string|number}>}>} columns
 * @param {(nextColumns) => void} [onColumnsChange] Fired once per completed drag with the new columns.
 * @param {(detail: {cardId, fromColumnId, toColumnId, toIndex, columns}) => void} [onCardMove] Fired when a card lands in a (possibly new) column; `toIndex` is its position within that column.
 * @param {(card, column) => React.ReactNode} [renderCard] Custom card body. Defaults to the card title.
 * @param {(column) => React.ReactNode} [renderColumnHeader] Custom column header. Defaults to title + count.
 * @param {boolean} [collapsible=true] Whether columns can be collapsed into a rail.
 * @param {React.ReactNode} [trailing] Optional node rendered after all columns (e.g. "Add column").
 */
const Kanban = ({
  columns: columnsProp = [],
  onColumnsChange,
  onCardMove,
  renderCard,
  renderColumnHeader,
  collapsible = true,
  trailing,
  className,
}) => {
  const [columns, setColumns] = useState(columnsProp);
  const [collapsed, setCollapsed] = useState(() => new Set());
  // The card currently under the pointer, rendered full-fidelity in the overlay
  // while its in-list original stays behind as a light drop-placeholder.
  const [activeCard, setActiveCard] = useState(null);

  // Re-sync only when the PARENT hands us a new `columns` reference (controlled
  // use). Internal drag commits keep their own state, so they don't get reverted
  // here. Done during render — React's recommended "derive state from props"
  // pattern — rather than in an effect, to avoid a flash of stale order.
  const [prevColumnsProp, setPrevColumnsProp] = useState(columnsProp);
  if (prevColumnsProp !== columnsProp) {
    setPrevColumnsProp(columnsProp);
    setColumns(columnsProp);
  }

  // Snapshot taken at drag start so a cancelled drag can be restored exactly,
  // and so we can report the card's ORIGINAL column (by drag end the card's own
  // `data.columnId` already reflects its new home).
  const dragStart = useRef({ columns: columnsProp, cardId: null, fromColumnId: null });
  // Mirrors the latest optimistic order produced during the drag, so drag end
  // can commit and report without depending on React's async state.
  const latest = useRef(columns);

  const toggleCollapse = (id) =>
    setCollapsed((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  return (
    <DragDropProvider
      onDragStart={(event) => {
        const { source } = event.operation;
        const cardId = source?.id ?? null;
        dragStart.current = {
          columns,
          cardId,
          fromColumnId: source?.data?.columnId ?? null,
        };
        latest.current = columns;

        // Capture the dragged card + its column for the overlay.
        for (const col of columns) {
          const card = col.cards.find((c) => c.id === cardId);
          if (card) {
            setActiveCard({ card, column: col });
            break;
          }
        }
      }}
      onDragOver={(event) => {
        setColumns((cols) => {
          const next = moveCard(cols, event);
          latest.current = next;
          return next;
        });
      }}
      onDragEnd={(event) => {
        setActiveCard(null);

        if (event.canceled) {
          setColumns(dragStart.current.columns);
          latest.current = dragStart.current.columns;
          return;
        }

        const next = latest.current;
        const { cardId, fromColumnId } = dragStart.current;
        const toColumn = next.find((c) =>
          c.cards.some((card) => card.id === cardId),
        );
        const toColumnId = toColumn?.id ?? fromColumnId;
        // Landing index within the destination column (the API's `position`).
        const toIndex = toColumn
          ? toColumn.cards.findIndex((card) => card.id === cardId)
          : -1;

        // Skip callbacks (and any persistence) when the card was dropped exactly
        // where it started — a no-op drag shouldn't hit the server.
        const fromIndex = dragStart.current.columns
          .find((c) => c.id === fromColumnId)
          ?.cards.findIndex((card) => card.id === cardId);
        if (toColumnId === fromColumnId && toIndex === fromIndex) return;

        onColumnsChange?.(next);
        onCardMove?.({ cardId, fromColumnId, toColumnId, toIndex, columns: next });
      }}
    >
      <div
        className={cn(
          "flex h-full min-h-0 items-stretch gap-4 overflow-x-auto pb-2",
          className,
        )}
      >
        {columns.map((column) => (
          <KanbanColumn
            key={column.id}
            column={column}
            renderCard={renderCard}
            renderColumnHeader={renderColumnHeader}
            collapsible={collapsible}
            collapsed={collapsed.has(column.id)}
            onToggleCollapse={() => toggleCollapse(column.id)}
          />
        ))}
        {trailing}
      </div>

      {/* Full-fidelity clone that follows the pointer, so the in-list original
          can render as a light placeholder at the live drop position. */}
      <DragOverlay>
        {activeCard && (
          <div className="flex w-72 rotate-1 cursor-grabbing items-start gap-1.5 rounded-lg border border-border bg-white p-3 shadow-lg">
            <CardBody
              card={activeCard.card}
              column={activeCard.column}
              renderCard={renderCard}
            />
          </div>
        )}
      </DragOverlay>
    </DragDropProvider>
  );
};

const KanbanColumn = ({
  column,
  renderCard,
  renderColumnHeader,
  collapsible,
  collapsed,
  onToggleCollapse,
}) => {
  const cards = column.cards ?? [];
  const reduceMotion = useReducedMotion();

  // A column-level droppable so a card can land in EMPTY columns (and the gaps
  // below the last card), where there is no card sortable to collide with. When
  // collapsed, the rail itself is the drop target so a drag can still target the
  // column. `data.columnId` lets moveCard resolve the destination uniformly.
  const { ref: dropRef, isDropTarget } = useDroppable({
    id: column.id,
    type: "column",
    accept: "item",
    data: { columnId: column.id },
  });

  // Reduced motion: collapse instantly (duration 0) instead of tweening.
  const widthTransition = {
    duration: reduceMotion ? 0 : 0.28,
    ease: [0.4, 0, 0.2, 1],
  };
  const fade = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: reduceMotion ? 0 : 0.15 },
  };

  return (
    // `motion` drives the width; the inner content keeps a fixed width so the
    // tween reveals/clips it rather than reflowing text mid-animation.
    <motion.section
      ref={dropRef}
      initial={false}
      animate={{ width: collapsed ? RAIL_WIDTH : COLUMN_WIDTH }}
      transition={widthTransition}
      className={cn(
        "relative h-full shrink-0 overflow-hidden rounded-xl border border-border bg-muted/40 transition-colors",
        isDropTarget && "border-primary/50 bg-primary/5",
      )}
    >
      <AnimatePresence initial={false} mode="wait">
        {collapsed ? (
          <motion.div
            key="rail"
            {...fade}
            className="flex h-full w-12 flex-col items-center gap-3 py-3"
          >
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={onToggleCollapse}
                  aria-label={`Expand ${column.title}`}
                  className="cursor-pointer text-muted-foreground hover:text-foreground"
                >
                  <ChevronRight className="size-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent  side="right">Expand</TooltipContent>
            </Tooltip>
            <Badge variant="secondary">{cards.length}</Badge>
            <div className="flex flex-1 items-center justify-center overflow-hidden">
              <span className="-rotate-90 whitespace-nowrap text-sm font-semibold text-foreground">
                {column.title}
              </span>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="full"
            {...fade}
            className="flex h-full w-72 flex-col"
          >
            <header className="flex shrink-0 items-center gap-2 px-3 py-2.5">
              {collapsible && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={onToggleCollapse}
                      aria-label={`Collapse ${column.title}`}
                      className="cursor-pointer text-muted-foreground hover:text-foreground"
                    >
                      <ChevronLeft className="size-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">Collapse</TooltipContent>
                </Tooltip>
              )}
              {renderColumnHeader ? (
                renderColumnHeader(column)
              ) : (
                <>
                  <h3 className="min-w-0 flex-1 truncate text-sm font-semibold text-foreground">
                    {column.title}
                  </h3>
                  <Badge variant="secondary">{cards.length}</Badge>
                </>
              )}
            </header>

            <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto rounded-b-xl px-2 pb-2">
              {cards.map((card, index) => (
                <KanbanCard
                  key={card.id}
                  card={card}
                  column={column}
                  index={index}
                  renderCard={renderCard}
                />
              ))}
              {cards.length === 0 && (
                <p className="px-1 py-6 text-center text-xs text-muted-foreground">
                  Drop items here
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
};

const KanbanCard = ({ card, column, index, renderCard }) => {
  // No `handle` — the whole card is the drag source. The grip icon is a purely
  // visual affordance.
  const { ref, isDragging } = useSortable({
    id: card.id,
    index,
    type: "item",
    accept: "item",
    group: column.id,
    // `columnId` lets the move logic resolve a card's column from the drag event
    // without walking the whole board.
    data: { columnId: column.id },
  });

  return (
    <div
      ref={ref}
      className={cn(
        "flex items-start gap-1.5 rounded-lg border p-3 transition-shadow",
        "cursor-grab touch-none active:cursor-grabbing",
        // While dragging, the overlay carries the real card and this element is
        // just the drop-position preview: a light dashed outline with its
        // content hidden (but its box kept, so the slot doesn't collapse).
        isDragging
          ? "border-2 border-dashed border-primary/40 bg-primary/5 shadow-none"
          : "border-border bg-white shadow-sm hover:shadow-md",
      )}
    >
      <div className={cn("flex w-full items-start gap-1.5", isDragging && "invisible")}>
        <CardBody card={card} column={column} renderCard={renderCard} />
      </div>
    </div>
  );
};

// The visual content shared by an in-list card and the drag overlay: a grip
// affordance plus the (optionally custom-rendered) card body.
const CardBody = ({ card, column, renderCard }) => (
  <>
    <GripVertical className="mt-0.5 size-4 shrink-0 text-muted-foreground/50" />
    <div className="min-w-0 flex-1">
      {renderCard ? (
        renderCard(card, column)
      ) : (
        <p className="text-sm font-medium text-foreground">
          {card.title ?? card.content ?? String(card.id)}
        </p>
      )}
    </div>
  </>
);

export default Kanban;
