import { isSortable } from "@dnd-kit/react/sortable";

/**
 * Returns a new `columns` array with the dragged card moved to its target slot.
 * Handles both in-column reordering and cross-column moves, and is a no-op when
 * the card would land in the slot it already occupies. Pure — safe to call from
 * a state updater on every `dragover`.
 */
export function moveCard(columns, event) {
  const { source, target } = event.operation;
  if (!source || !target) return columns;

  const fromColumnId = source.data?.columnId;
  const toColumnId = target.data?.columnId;
  if (fromColumnId == null || toColumnId == null) return columns;

  const fromIdx = columns.findIndex(
    (c) => String(c.id) === String(fromColumnId),
  );
  const toIdx = columns.findIndex((c) => String(c.id) === String(toColumnId));
  if (fromIdx === -1 || toIdx === -1) return columns;

  const cardIdx = columns[fromIdx].cards.findIndex(
    (c) => String(c.id) === String(source.id),
  );
  if (cardIdx === -1) return columns;

  const targetIndex = isSortable(target)
    ? target.sortable.index
    : columns[toIdx].cards.length;

  if (fromColumnId === toColumnId && cardIdx === targetIndex) return columns;

  const next = columns.map((c) => ({ ...c, cards: [...c.cards] }));
  const [card] = next[fromIdx].cards.splice(cardIdx, 1);

  const insertAt =
    fromColumnId === toColumnId && cardIdx < targetIndex
      ? targetIndex - 1
      : targetIndex;

  next[toIdx].cards.splice(insertAt, 0, card);
  return next;
}
