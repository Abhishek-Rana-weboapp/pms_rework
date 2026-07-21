import SectionWrapper from "@/shared/components/wrappers/SectionWrapper";
import { Spinner } from "@/shared/components/ui/spinner";
import Kanban from "@/shared/components/kanban/Kanban";
import BoardCard from "../components/BoardCard";
import { useBoards } from "../api/project/projectQueries";
import { useMoveArtifact } from "../api/project/projectMutations";
import { normalizeArtifact } from "../config/artifacts/artifact.utils";

const Board = () => {
  const { data: board, isLoading, isError } = useBoards();
  const moveArtifact = useMoveArtifact();

  // Board shape -> Kanban shape: a status becomes a column, its artifacts become
  // normalized cards. status_id is the column id, which is exactly what the move
  // API wants as `status`. (No useMemo — React Compiler memoizes this.)
  //
  // The board payload omits `priority`, so there's no priorityColorMap to thread
  // in — normalizeArtifact just leaves priority empty.
  const columns = (board?.columns ?? []).map((col) => ({
    id: col.status_id,
    title: col.status_name,
    cards: (col.items ?? []).map((item) => normalizeArtifact(item)),
  }));

  const handleCardMove = ({ cardId, fromColumnId, toColumnId, toIndex }) => {
    moveArtifact.mutate({
      id: cardId,
      status: toColumnId,
      position: toIndex,
      fromColumnId,
      toColumnId,
    });
  };

  return (
    // Fill the outlet's height and clip it: the board scrolls its columns
    // horizontally and each column scrolls its cards vertically, so this page
    // itself never overflows.
    <SectionWrapper className="flex h-full flex-col gap-5 overflow-hidden">
      <h1 className="shrink-0 text-lg font-semibold">Board</h1>

      {isLoading ? (
        <div className="flex flex-1 items-center justify-center">
          <Spinner />
        </div>
      ) : isError ? (
        <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
          Couldn't load the board. Please try again.
        </div>
      ) : columns.length === 0 ? (
        <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
          No active sprint to show on the board.
        </div>
      ) : (
        <div className="min-h-0 flex-1">
          <Kanban
            columns={columns}
            onCardMove={handleCardMove}
            renderCard={(card) => <BoardCard card={card} />}
          />
        </div>
      )}
    </SectionWrapper>
  );
};

export default Board;
