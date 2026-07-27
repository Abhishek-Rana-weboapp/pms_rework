import { useDroppable } from "@dnd-kit/react";

import { Badge } from "@/shared/components/ui/badge";
import { cn } from "@/shared/lib/utils";
import BacklogItem from "./BacklogItem";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { Button } from "@/shared/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import { useBacklogContext } from "../context/BacklogStore";
import { useSprintFormDialog } from "../context/SprintFormDialogStore";

const formatDay = (value) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const formatRange = (start, end) => {
  const from = formatDay(start);
  const to = formatDay(end);
  if (from && to) return `${from} – ${to}`;
  return from || to || null;
};

const SprintDropzone = ({ sprint, columnId, cards = [], renderCard, onCardClick }) => {
  const { openEditSprint } = useSprintFormDialog();
  const { confirmStartSprint, confirmDeleteSprint } = useBacklogContext();
  const { ref, isDropTarget } = useDroppable({
    id: String(columnId),
    type: "column",
    accept: "item",
    data: { columnId: String(columnId) },
  });

  const dateRange = formatRange(sprint?.start_date, sprint?.end_date);

  return (
    <section
      ref={ref}
      className={cn(
        "w-full rounded-xl border border-border bg-muted/30 p-4 transition-colors",
        isDropTarget && "border-primary/50 bg-primary/5",
      )}
    >
      <header className="mb-3 flex justify-between items-center gap-2">
        <div className="flex items-center gap-2">
          <h4 className="text-sm font-semibold text-foreground">
            {sprint?.sprint_name ?? "Sprint"}
          </h4>
          {sprint?.status && <Badge variant="outline">{sprint.status}</Badge>}
          <Badge variant="secondary">{cards.length}</Badge>
          {dateRange && (
            <span className="text-xs text-muted-foreground">{dateRange}</span>
          )}
          {sprint?.StoryPoints != null && (
            <span className="text-xs text-muted-foreground">
              {sprint.StoryPoints} pts
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className={"text-xs py-0.5 px-2"}
            size="sm"
            onClick={() => confirmStartSprint(sprint)}
          >
            Start Sprint
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => openEditSprint(sprint)}>
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => confirmDeleteSprint(sprint)}>
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <div className="flex min-h-[80px] flex-col gap-2">
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
          <p className="py-4 text-center text-xs text-muted-foreground">
            Drop items here
          </p>
        )}
      </div>
    </section>
  );
};

export default SprintDropzone;
