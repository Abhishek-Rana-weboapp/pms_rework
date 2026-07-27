import { useCallback, useMemo, useState } from "react";

import SprintFormModal from "../components/SprintFormModal";
import { SprintFormDialogContext } from "./SprintFormDialogStore";

const initialSprintForm = { open: false, mode: "add", sprint: null };

/**
 * Project-scoped sprint create/edit dialog. Mounted on ProjectLayout so
 * Backlog and Board (and any future tab) can open the same modal.
 */
export const SprintFormDialogProvider = ({ children }) => {
  const [sprintForm, setSprintForm] = useState(initialSprintForm);

  const openCreateSprint = useCallback(
    () => setSprintForm({ open: true, mode: "add", sprint: null }),
    [],
  );

  const openEditSprint = useCallback(
    (sprint) => setSprintForm({ open: true, mode: "edit", sprint }),
    [],
  );

  const closeSprintForm = useCallback(
    () => setSprintForm((prev) => ({ ...prev, open: false })),
    [],
  );

  const value = useMemo(
    () => ({
      sprintForm,
      openCreateSprint,
      openEditSprint,
      closeSprintForm,
    }),
    [sprintForm, openCreateSprint, openEditSprint, closeSprintForm],
  );

  return (
    <SprintFormDialogContext.Provider value={value}>
      {children}
      <SprintFormModal />
    </SprintFormDialogContext.Provider>
  );
};
