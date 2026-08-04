import { useParams } from "react-router-dom";

import { useAuthPermissions } from "@/product/auth/hooks/useAuthPermissions";
import { useLocalStorage } from "@/shared/hooks/useLocalStorage";
import { projectTabsData } from "../config/ProjectTabsData";

/**
 * Per-project tab preferences (order + visibility), persisted on this device.
 *
 * Only ids are stored — never the tab objects. They carry `prefetch` functions
 * that don't survive JSON, and ids let a saved preference be reconciled against
 * the config instead of freezing a copy of it. Reconciling both ways matters:
 * an id that no longer exists is dropped, and a tab shipped after the user
 * saved is appended (and shown) rather than silently hidden.
 *
 * Storage shape: `{ order: string[], hidden: string[] }`. Older saves that were
 * a bare id array are still accepted and treated as order-only.
 *
 * Permission filtering runs before preference visibility: a tab the user cannot
 * access never appears in the strip or customize menu.
 */
const emptyPrefs = () => ({ order: [], hidden: [] });

const normalizePrefs = (raw) => {
  if (Array.isArray(raw)) return { order: raw, hidden: [] };
  if (raw && typeof raw === "object") {
    return {
      order: Array.isArray(raw.order) ? raw.order : [],
      hidden: Array.isArray(raw.hidden) ? raw.hidden : [],
    };
  }
  return emptyPrefs();
};

/** Apply a saved id list to allowed tabs, dropping unknowns and appending new ones. */
const reconcileOrder = (orderIds, allowedTabs) => {
  const tabById = new Map(allowedTabs.map((tab) => [tab.id, tab]));
  const placed = new Set();
  const tabs = [];

  for (const id of orderIds) {
    const tab = tabById.get(id);
    if (tab && !placed.has(id)) {
      placed.add(id);
      tabs.push(tab);
    }
  }
  for (const tab of allowedTabs) {
    if (!placed.has(tab.id)) tabs.push(tab);
  }
  return tabs;
};

export const useProjectTabPreferences = () => {
  const { projectId } = useParams();
  const { can } = useAuthPermissions();

  // Key kept as `tab-order` so existing per-project saves keep working; the
  // value shape grew from `string[]` to `{ order, hidden }` via normalizePrefs.
  const [rawPrefs, setRawPrefs, clearPrefs] = useLocalStorage(
    `project-${projectId}-tab-order`,
    null,
  );

  const prefs = normalizePrefs(rawPrefs);
  const hiddenSet = new Set(prefs.hidden);

  // Drop tabs the signed-in user cannot view before applying order/hidden prefs.
  const allowedTabs = projectTabsData.filter((tab) => can(tab.permission));
  const orderedTabs = reconcileOrder(prefs.order, allowedTabs);

  const menuTabs = orderedTabs.map((tab) => ({
    ...tab,
    visible: !hiddenSet.has(tab.id),
  }));
  const tabs = menuTabs.filter((tab) => tab.visible);

  const writePrefs = (next) => {
    const normalized = normalizePrefs(next);
    // Persist `null` when back to defaults so isCustomized stays accurate and
    // we don't leave empty objects floating in storage.
    if (normalized.order.length === 0 && normalized.hidden.length === 0) {
      clearPrefs();
      return;
    }
    setRawPrefs(normalized);
  };

  return {
    /** Visible tabs, in display order — what the tab strip renders. */
    tabs,
    /** Every allowed tab (incl. preference-hidden), in display order. */
    menuTabs,
    isCustomized: prefs.order.length > 0 || prefs.hidden.length > 0,
    setOrder: (nextTabs) =>
      writePrefs({
        ...prefs,
        order: nextTabs.map((tab) => tab.id),
      }),
    setTabVisible: (id, visible) => {
      const nextHidden = new Set(prefs.hidden);
      if (visible) {
        nextHidden.delete(id);
      } else {
        // Never hide the last remaining tab — the strip would be empty.
        const visibleCount = orderedTabs.filter(
          (tab) => !nextHidden.has(tab.id),
        ).length;
        if (visibleCount <= 1) return;
        nextHidden.add(id);
      }
      writePrefs({ ...prefs, hidden: [...nextHidden] });
    },
    reset: clearPrefs,
  };
};
