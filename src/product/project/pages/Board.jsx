import { useState } from "react";
import { useParams } from "react-router-dom";
import { MoreVertical, Pencil, PlusIcon } from "lucide-react";

import SectionWrapper from "@/shared/components/wrappers/SectionWrapper";
import { Spinner } from "@/shared/components/ui/spinner";
import Kanban from "@/shared/components/kanban/Kanban";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { Button } from "@/shared/components/ui/button";

import BoardCard from "../components/BoardCard";
import BoardColumnHeader from "../components/BoardColumnHeader";
import StatusFormModal from "../components/StatusFormModal";
import {
  useBoards,
  useProjectStatuses,
} from "../api/project/projectQueries";
import { useMoveArtifact } from "../api/project/projectMutations";
import { normalizeArtifact } from "../config/artifacts/artifact.utils";
import { useSprintFormDialog } from "../context/SprintFormDialogStore";

const initialStatusForm = { open: false, mode: "add", status: null };

const Board = () => {
  const { projectId } = useParams();
  const { data: board, isLoading, isError } = useBoards();
  const { data: projectStatuses = [] } = useProjectStatuses(projectId);
  const moveArtifact = useMoveArtifact();
  const { openEditSprint } = useSprintFormDialog();
  const [statusForm, setStatusForm] = useState(initialStatusForm);

  const activeSprint = board?.sprint_details ?? null;

  const columns = (board?.columns ?? []).map((col) => ({
    id: col.status_id,
    title: col.status_name,
    category: col.category,
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

  const openCreateStatus = () =>
    setStatusForm({ open: true, mode: "add", status: null });

  const openEditStatus = (column) => {
    const full = projectStatuses.find(
      (s) => String(s.id) === String(column.id),
    );
    setStatusForm({
      open: true,
      mode: "edit",
      status: {
        id: column.id,
        status_name: full?.status_name ?? column.title,
        category: full?.category ?? column.category ?? "",
      },
    });
  };

  const handleStatusFormOpenChange = (open) => {
    if (!open) setStatusForm((prev) => ({ ...prev, open: false }));
    else setStatusForm((prev) => ({ ...prev, open: true }));
  };

  return (
    <SectionWrapper className="flex h-full flex-col gap-5 overflow-hidden">
      <div className="flex items-center justify-between">
        <h1 className="shrink-0 text-lg font-semibold">Board</h1>
        <div className="flex items-center gap-2">
          <Button>Complete Sprint</Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8" size="icon">
                <MoreVertical />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-auto min-w-40">
              <DropdownMenuItem
                className="cursor-pointer"
                disabled={!activeSprint}
                onSelect={() => {
                  if (activeSprint) openEditSprint(activeSprint);
                }}
              >
                <Pencil className="h-4 w-4" />
                Edit Sprint
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

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
            renderColumnHeader={(column) => (
              <BoardColumnHeader
                column={column}
                onEditStatus={openEditStatus}
              />
            )}
            trailing={
              <button
                type="button"
                onClick={openCreateStatus}
                className="flex h-full w-72 shrink-0 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-muted/20 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-foreground"
              >
                <PlusIcon className="size-5" />
                Create Status
              </button>
            }
          />
        </div>
      )}

      <StatusFormModal
        open={statusForm.open}
        onOpenChange={handleStatusFormOpenChange}
        mode={statusForm.mode}
        status={statusForm.status}
      />
    </SectionWrapper>
  );
};

export default Board;
