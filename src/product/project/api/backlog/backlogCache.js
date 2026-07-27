export const BACKLOG_COLUMN_ID = "backlog";

const toIdSet = (ids) => new Set(ids.map(String));

const removeItemsByIds = (items, idSet) =>
  (items ?? []).filter((item) => !idSet.has(String(item.id)));

const collectRawItems = (sprintsData, backlogData, idSet) => {
  const found = [];

  for (const item of backlogData?.data?.results?.items ?? []) {
    if (idSet.has(String(item.id))) found.push(item);
  }

  for (const sprint of sprintsData?.data ?? []) {
    for (const item of sprint.items ?? []) {
      if (idSet.has(String(item.id))) found.push(item);
    }
  }

  return found;
};

/**
 * Optimistically move raw API items between backlog and sprint buckets in the
 * react-query cache. Mirrors a completed drag so columnsProp stays in sync
 * with local DnD state without a refetch flash.
 */
export const applyBacklogMove = (
  sprintsData,
  backlogData,
  { fromColumnId, toColumnId, artifactIds },
) => {
  const idSet = toIdSet(artifactIds);
  const itemsToMove = collectRawItems(sprintsData, backlogData, idSet);

  let nextSprints = sprintsData;
  let nextBacklog = backlogData;

  if (fromColumnId === BACKLOG_COLUMN_ID) {
    nextBacklog = {
      ...backlogData,
      data: {
        ...backlogData?.data,
        results: {
          ...backlogData?.data?.results,
          items: removeItemsByIds(backlogData?.data?.results?.items, idSet),
        },
      },
    };
  } else {
    nextSprints = {
      ...sprintsData,
      data: (sprintsData?.data ?? []).map((sprint) =>
        String(sprint.id) === String(fromColumnId)
          ? { ...sprint, items: removeItemsByIds(sprint.items, idSet) }
          : sprint,
      ),
    };
  }

  if (toColumnId === BACKLOG_COLUMN_ID) {
    nextBacklog = {
      ...nextBacklog,
      data: {
        ...nextBacklog?.data,
        results: {
          ...nextBacklog?.data?.results,
          items: [
            ...(nextBacklog?.data?.results?.items ?? []),
            ...itemsToMove,
          ],
        },
      },
    };
  } else {
    nextSprints = {
      ...nextSprints,
      data: (nextSprints?.data ?? []).map((sprint) =>
        String(sprint.id) === String(toColumnId)
          ? { ...sprint, items: [...(sprint.items ?? []), ...itemsToMove] }
          : sprint,
      ),
    };
  }

  return { sprints: nextSprints, backlog: nextBacklog };
};
