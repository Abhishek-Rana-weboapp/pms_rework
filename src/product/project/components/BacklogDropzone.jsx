import { useDroppable } from "@dnd-kit/react";

import { Badge } from "@/shared/components/ui/badge";
import { cn } from "@/shared/lib/utils";
import BacklogItem from "./BacklogItem";
import { useSprintFormDialog } from "../context/SprintFormDialogStore";
import { Button } from "@/shared/components/ui/button";

const BacklogDropzone = ({
  columnId,
  cards = [],
  renderCard,
  onCardClick,
  issues,
  storyPoints,
}) => {
  const { openCreateSprint } = useSprintFormDialog();
  const { ref, isDropTarget } = useDroppable({
    id: String(columnId),
    type: "column",
    accept: "item",
    data: { columnId: String(columnId) },
  });

  return (
    <section
      ref={ref}
      className={cn(
        "w-full rounded-xl border border-border bg-muted/30 p-4 transition-colors",
        isDropTarget && "border-primary/50 bg-primary/5",
      )}
    >
      <header className="mb-3 flex justify-between items-center gap-2">
        <div className="flex flex-wrap gap-2 items-center">
          <h4 className="text-sm font-semibold text-foreground">Backlog</h4>
          <Badge variant="secondary">{cards.length}</Badge>
          {issues != null && (
            <span className="text-xs text-muted-foreground">
              {issues} issues
            </span>
          )}
          {storyPoints != null && (
            <span className="text-xs text-muted-foreground">
              {storyPoints} pts
            </span>
          )}
        </div>

        <Button onClick={openCreateSprint}>Create Sprint</Button>
      </header>

      <div className="flex min-h-[120px] flex-col gap-2">
        {cards.map((card) => (
          <BacklogItem
            key={card.id}
            card={card}
            columnId={columnId}
            renderCard={renderCard}
            onCardClick={onCardClick}
          />
        ))}
        {cards.length === 0 && (
          <p className="py-6 text-center text-xs text-muted-foreground">
            Drop items here
          </p>
        )}
      </div>
    </section>
  );
};

export default BacklogDropzone;
