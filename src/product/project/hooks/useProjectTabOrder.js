import { useParams } from "react-router-dom";

import { useLocalStorage } from "@/shared/hooks/useLocalStorage";
import { projectTabsData } from "../config/ProjectTabsData";

/**
 * Per-project tab order, persisted on this device.
 *
 * Only the ids are stored, never the tab objects: they carry `prefetch`
 * functions that don't survive JSON, and ids let a saved order be reconciled
 * against the config instead of freezing a copy of it. Reconciling both ways
 * matters — an id that no longer exists is dropped, and a tab shipped after the
 * user saved their order is appended rather than silently hidden.
 */
export const useProjectTabOrder = () => {
  const { projectId } = useParams();
  const [savedIds, setSavedIds, clearSavedIds] = useLocalStorage(
    `project-${projectId}-tab-order`,
    null,
  );

  const tabById = new Map(projectTabsData.map((tab) => [tab.id, tab]));
  const order = Array.isArray(savedIds) ? savedIds : [];

  const placed = new Set();
  const tabs = [];
  for (const id of order) {
    const tab = tabById.get(id);
    if (tab && !placed.has(id)) {
      placed.add(id);
      tabs.push(tab);
    }
  }
  for (const tab of projectTabsData) {
    if (!placed.has(tab.id)) tabs.push(tab);
  }

  return {
    tabs,
    isCustomized: order.length > 0,
    setOrder: (nextTabs) => setSavedIds(nextTabs.map((tab) => tab.id)),
    resetOrder: clearSavedIds,
  };
};
