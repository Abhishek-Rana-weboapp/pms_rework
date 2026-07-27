import { useCallback, useMemo, useState } from "react";

import BacklogAlerts from "../components/BacklogAlerts";
import { BacklogContext } from "./BacklogStore";

const initialAlert = { type: null, sprint: null };

/** Backlog-page alerts only (start / delete sprint). Sprint form lives in SprintFormDialogProvider. */
export const BacklogProvider = ({ children }) => {
  const [alert, setAlert] = useState(initialAlert);

  const confirmStartSprint = useCallback(
    (sprint) => setAlert({ type: "start", sprint }),
    [],
  );

  const confirmDeleteSprint = useCallback(
    (sprint) => setAlert({ type: "delete", sprint }),
    [],
  );

  const closeAlert = useCallback(() => setAlert(initialAlert), []);

  const value = useMemo(
    () => ({
      alert,
      confirmStartSprint,
      confirmDeleteSprint,
      closeAlert,
    }),
    [alert, confirmStartSprint, confirmDeleteSprint, closeAlert],
  );

  return (
    <BacklogContext.Provider value={value}>
      {children}
      <BacklogAlerts />
    </BacklogContext.Provider>
  );
};
