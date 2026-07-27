import { GripVertical } from "lucide-react";
import { useEffect, useRef } from "react";
import { useDraggable } from "@dnd-kit/react";

import { cn } from "@/shared/lib/utils";

/**
 * Draggable backlog card (whole card). Drag vs click is separated by a pointer
 * distance threshold on DragDropProvider — a plain click navigates; a real drag
 * moves between dropzones. No in-list reordering.
 */
const BacklogItem = ({ card, columnId, renderCard, onCardClick }) => {
  const { ref, isDragging } = useDraggable({
    id: String(card.id),
    type: "item",
    data: { columnId: String(columnId) },
  });

  // Skip the post-drag click so dropping an item doesn't navigate.
  const didDragRef = useRef(false);
  useEffect(() => {
    if (isDragging) didDragRef.current = true;
  }, [isDragging]);

  const handleClick = () => {
    if (didDragRef.current) {
      didDragRef.current = false;
      return;
    }
    onCardClick?.(card);
  };

  return (
    <div
      ref={ref}
      role={onCardClick ? "link" : undefined}
      onClick={onCardClick ? handleClick : undefined}
      className={cn(
        "flex w-full items-start gap-2 rounded-lg border p-3 transition-shadow",
        "cursor-grab touch-none active:cursor-grabbing",
        isDragging
          ? "border-2 border-dashed border-primary/40 bg-primary/5 shadow-none"
          : "border-border bg-white shadow-sm hover:shadow-md",
        onCardClick && !isDragging && "hover:border-primary/40",
      )}
    >
      <div
        className={cn(
          "flex w-full items-start gap-2",
          isDragging && "invisible",
        )}
      >
        <GripVertical className="mt-0.5 size-4 shrink-0 text-muted-foreground/50" />
        <div className="min-w-0 flex-1">{renderCard(card)}</div>
      </div>
    </div>
  );
};

export default BacklogItem;
