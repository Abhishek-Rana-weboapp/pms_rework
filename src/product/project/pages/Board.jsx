import { useMemo, useState } from "react";
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
import { getStatusCategoryOrder } from "@/shared/lib/statusColors";
import { normalizeArtifact } from "../config/artifacts/artifact.utils";
import { useSprintFormDialog } from "../context/SprintFormDialogStore";

const initialStatusForm = { open: false, mode: "add", status: null };
const BOARD_COLUMN_ORDER_KEY = "pms:board-column-order";

const readSavedColumnOrders = () => {
  if (typeof localStorage === "undefined") return {};

  try {
    return JSON.parse(localStorage.getItem(BOARD_COLUMN_ORDER_KEY) || "{}");
  } catch {
    return {};
  }
};

const Board = () => {
  const { projectId } = useParams();
  const { data: board, isLoading, isError } = useBoards();
  const { data: projectStatuses = [] } = useProjectStatuses(projectId);
  // `mutate` keeps a stable identity, so the handlers built from it below stay
  // cacheable and the Kanban subtree can be skipped on unrelated re-renders.
  const { mutate: moveArtifact } = useMoveArtifact();
  const { openEditSprint } = useSprintFormDialog();
  const [statusForm, setStatusForm] = useState(initialStatusForm);
  const [savedColumnOrders, setSavedColumnOrders] = useState(
    readSavedColumnOrders,
  );
  

  const activeSprint = board?.sprint_details ?? null;

  // Memoised because Kanban treats a new `columns` reference as "the parent has
  // fresh data" and resets its internal state — which would throw away the
  // user's same-column card order on every unrelated Board render (opening a
  // status dialog, moving a column). Now the reference only changes when the
  // underlying data does.
  const columns = useMemo(() => {
    // The board payload doesn't always carry a column's category, and the
    // category is what colours the column header — so fill it from the project
    // statuses, which is also where the edit dialog already reads it from.
    const categoryByStatusId = new Map(
      projectStatuses.map((status) => [String(status.id), status.category]),
    );

    const savedColumnOrder = savedColumnOrders[projectId] ?? [];
    const savedColumnRank = new Map(
      savedColumnOrder.map((statusId, index) => [String(statusId), index]),
    );

    // Group by category so the board reads left → right as TO DO, then
    // IN PROGRESS, then DONE. Within each group, use the browser-saved custom
    // order and fall back to the API order for columns the user has not moved.
    return (board?.columns ?? [])
      .map((col, apiIndex) => ({
        id: col.status_id,
        title: col.status_name,
        category:
          col.category || categoryByStatusId.get(String(col.status_id)) || "",
        cards: (col.items ?? []).map((item) => normalizeArtifact(item)),
        apiIndex,
      }))
      .sort((a, b) => {
        const categoryDifference =
          getStatusCategoryOrder(a.category, a.title) -
          getStatusCategoryOrder(b.category, b.title);
        if (categoryDifference !== 0) return categoryDifference;

        return (
          (savedColumnRank.get(String(a.id)) ??
            savedColumnOrder.length + a.apiIndex) -
          (savedColumnRank.get(String(b.id)) ??
            savedColumnOrder.length + b.apiIndex)
        );
      });
  }, [board, projectStatuses, savedColumnOrders, projectId]);

  const moveColumn = (columnId, direction) => {
    const currentIndex = columns.findIndex(
      (column) => String(column.id) === String(columnId),
    );
    const targetIndex = currentIndex + direction;
    const current = columns[currentIndex];
    const target = columns[targetIndex];

    if (
      !current ||
      !target ||
      getStatusCategoryOrder(current.category, current.title) !==
        getStatusCategoryOrder(target.category, target.title)
    ) {
      return;
    }

    const nextOrder = columns.map((column) => String(column.id));
    [nextOrder[currentIndex], nextOrder[targetIndex]] = [
      nextOrder[targetIndex],
      nextOrder[currentIndex],
    ];

    setSavedColumnOrders((previous) => {
      const next = { ...previous, [projectId]: nextOrder };
      try {
        localStorage.setItem(BOARD_COLUMN_ORDER_KEY, JSON.stringify(next));
      } catch {
        // Keep the current-session order even when browser storage is disabled.
      }
      return next;
    });
  };

  const handleCardMove = ({ cardId, fromColumnId, toColumnId, toIndex }) => {
    // Kanban already commits same-column sorting to its local state. Keep that
    // order only for this mounted board and avoid a server mutation; remounting
    // intentionally restores the API order.
    if (String(fromColumnId) === String(toColumnId)) return;

    moveArtifact({
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
            <DropdownMenuContent align="center" className="w-auto min-w-40">
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
                onMoveLeft={() => moveColumn(column.id, -1)}
                onMoveRight={() => moveColumn(column.id, 1)}
                canMoveLeft={columns.some(
                  (candidate, index) =>
                    index <
                      columns.findIndex(
                        (item) => String(item.id) === String(column.id),
                      ) &&
                    getStatusCategoryOrder(
                      candidate.category,
                      candidate.title,
                    ) ===
                      getStatusCategoryOrder(column.category, column.title),
                )}
                canMoveRight={columns.some(
                  (candidate, index) =>
                    index >
                      columns.findIndex(
                        (item) => String(item.id) === String(column.id),
                      ) &&
                    getStatusCategoryOrder(
                      candidate.category,
                      candidate.title,
                    ) ===
                      getStatusCategoryOrder(column.category, column.title),
                )}
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
