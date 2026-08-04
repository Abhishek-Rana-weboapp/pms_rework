import { useMemo, useRef, useState } from "react";
import { GripVertical } from "lucide-react";
import { DragDropProvider, DragOverlay, PointerSensor, KeyboardSensor } from "@dnd-kit/react";
import { PointerActivationConstraints } from "@dnd-kit/dom";
import { useNavigate, useParams } from "react-router-dom";

import SectionWrapper from "@/shared/components/wrappers/SectionWrapper";
import { Spinner } from "@/shared/components/ui/spinner";
import { moveCard } from "@/shared/lib/dnd/moveCard";
import { cn } from "@/shared/lib/utils";
import { useBacklog, useSprints } from "../api/backlog/backlogQueries";
import BacklogCard from "../components/BacklogCard";
import BacklogDropzone from "../components/BacklogDropzone";
import SprintDropzone from "../components/SprintDropzone";
import { normalizeArtifact } from "../config/artifacts/artifact.utils";
import {
  BACKLOG_COLUMN_ID,
  useMoveBacklogItem,
  useRemoveBacklogItem,
} from "../api/backlog/backlogMutations";
import { getDescendantIds } from "@/shared/lib/helpers";
import { BacklogProvider } from "../context/BacklogContext";

export { BACKLOG_COLUMN_ID };

/** Activate drag after ~8px move — no hold delay, so click still navigates cleanly. */
const backlogSensors = [
  PointerSensor.configure({
    activationConstraints: [
      new PointerActivationConstraints.Distance({ value: 8 }),
    ],
  }),
  KeyboardSensor,
];

const normalizeBacklogItem = (item) =>
  normalizeArtifact({
    ...item,
    status_detail: item.status_details ?? item.status_detail,
  });

const buildColumns = (sprintsRes, backlogRes) => {
  const sprints = sprintsRes?.data ?? [];
  const backlogResults = backlogRes?.data?.results;

  const sprintColumns = sprints.map((sprint) => ({
    id: String(sprint.id),
    meta: sprint,
    cards: (sprint.items ?? []).map(normalizeBacklogItem),
  }));

  const backlogColumn = {
    id: BACKLOG_COLUMN_ID,
    meta: backlogResults,
    cards: (backlogResults?.items ?? []).map(normalizeBacklogItem),
  };

  return [...sprintColumns, backlogColumn];
};

const Backlog = () => {
  const navigate = useNavigate();
  const { orgUuid, projectId } = useParams();
  const { data: sprintsRes, isLoading: sprintsLoading, isError: sprintsError } =
    useSprints();
  const { data: backlogRes, isLoading: backlogLoading, isError: backlogError } =
    useBacklog();

  const columnsProp = useMemo(
    () => buildColumns(sprintsRes, backlogRes),
    [sprintsRes, backlogRes],
  );

  const [columns, setColumns] = useState(columnsProp);
  const [prevColumnsProp, setPrevColumnsProp] = useState(columnsProp);
  const [activeCard, setActiveCard] = useState(null);

  const isDraggingRef = useRef(false);

  // Kanban-style sync: adopt server/cache data only when not dragging so we
  // never clobber dnd-kit mid-gesture. Optimistic cache updates keep props
  // aligned with local state after a drop.
  if (!isDraggingRef.current && prevColumnsProp !== columnsProp) {
    setPrevColumnsProp(columnsProp);
    setColumns(columnsProp);
  }

  const { mutate: moveItem } = useMoveBacklogItem({
    onError: () => {
      setColumns(dragStart.current.columns);
      latest.current = dragStart.current.columns;
    },
  });
  const { mutate: removeItem } = useRemoveBacklogItem({
    onError: () => {
      setColumns(dragStart.current.columns);
      latest.current = dragStart.current.columns;
    },
  });

  const dragStart = useRef({ columns: columnsProp, cardId: null, fromColumnId: null });
  const latest = useRef(columns);

  const isLoading = sprintsLoading || backlogLoading;
  const isError = sprintsError || backlogError;

  const sprintColumns = columns.filter((c) => c.id !== BACKLOG_COLUMN_ID);
  const backlogColumn = columns.find((c) => c.id === BACKLOG_COLUMN_ID);

  const isActiveSprint = (sprint) =>
    String(sprint?.status ?? "").toLowerCase() === "active";

  const handleCardClick = (card) => {
    const type = (card?.raw?.task_type ?? "").toLowerCase();
    if (!type || !card?.id) return;
    navigate(
      `/${orgUuid}/projects/${projectId}/artifact/${type}/${card.id}`,
    );
  };

  const handleDragStart = (event) => {
    isDraggingRef.current = true;
    const cardId = event.operation.source?.id ?? null;

    const sourceColumn = columns.find((column) =>
      column.cards.some((card) => String(card.id) === String(cardId)),
    );

    const startedCard = sourceColumn?.cards.find(
      (card) => String(card.id) === String(cardId),
    );

    dragStart.current = {
      columns,
      cardId,
      fromColumnId: sourceColumn?.id ?? null,
    };

    latest.current = columns;
    setActiveCard(startedCard ?? null);
  };

  const handleDragOver = (event) => {
    const { source, target } = event.operation;
    // Only move between dropzones — never reorder within the same column.
    if (
      !source ||
      !target ||
      String(source.data?.columnId) === String(target.data?.columnId)
    ) {
      return;
    }

    setColumns((cols) => {
      const next = moveCard(cols, event);
      latest.current = next;
      return next;
    });
  };

  const handleDragEnd = (event) => {
    setActiveCard(null);

    try {
      const { cardId, fromColumnId } = dragStart.current;

      if (event.canceled) {
        setColumns(dragStart.current.columns);
        latest.current = dragStart.current.columns;
        return;
      }

      const finalColumns = latest.current;

      const destinationColumn = finalColumns.find((column) =>
        column.cards.some((card) => String(card.id) === String(cardId)),
      );

      if (!destinationColumn) {
        return;
      }

      if (String(destinationColumn.id) === String(fromColumnId)) {
        return;
      }

      const item = finalColumns
        .flatMap((column) => column.cards)
        .find((card) => String(card.id) === String(cardId));

      const artifactIds = [String(cardId), ...getDescendantIds(item)];

      setColumns(finalColumns);
      latest.current = finalColumns;

      if (destinationColumn.id === BACKLOG_COLUMN_ID) {
        removeItem({
          sprintId: fromColumnId,
          artifactIds,
          fromColumnId,
          toColumnId: BACKLOG_COLUMN_ID,
        });
      } else {
        moveItem({
          sprintId: destinationColumn.id,
          artifactIds,
          fromColumnId,
          toColumnId: destinationColumn.id,
        });
      }
    } finally {
      isDraggingRef.current = false;
    }
  };

  return (
    <BacklogProvider>
      <SectionWrapper className="flex flex-col gap-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Spinner />
          </div>
        ) : isError ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Couldn&apos;t load backlog data. Please try again.
          </p>
        ) : (
          <DragDropProvider
            sensors={backlogSensors}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          >
            <div className="flex flex-col gap-4">
              {sprintColumns.map((column) => (
                <SprintDropzone
                  key={column.id}
                  sprint={column.meta}
                  columnId={column.id}
                  cards={column.cards}
                  renderCard={(card) => (
                    <BacklogCard
                      card={card}
                      canChangeStatus={isActiveSprint(column.meta)}
                    />
                  )}
                  onCardClick={handleCardClick}
                />
              ))}

              {backlogColumn && (
                <BacklogDropzone
                  columnId={backlogColumn.id}
                  cards={backlogColumn.cards}
                  renderCard={(card) => <BacklogCard card={card} />}
                  onCardClick={handleCardClick}
                  issues={backlogColumn.meta?.Issues}
                  storyPoints={backlogColumn.meta?.StoryPoints}
                />
              )}
            </div>

            <DragOverlay>
              {activeCard && (
                <div
                  className={cn(
                    "flex w-full rotate-1 cursor-grabbing items-start gap-2",
                    "rounded-lg border border-border bg-white p-3 shadow-lg",
                  )}
                >
                  <GripVertical className="mt-0.5 size-4 shrink-0 text-muted-foreground/50" />
                  <div className="min-w-0 flex-1">
                    <BacklogCard card={activeCard} />
                  </div>
                </div>
              )}
            </DragOverlay>
          </DragDropProvider>
        )}
      </SectionWrapper>
    </BacklogProvider>
  );
};

export default Backlog;
