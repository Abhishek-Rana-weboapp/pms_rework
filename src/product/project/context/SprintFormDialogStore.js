import { createContext, useContext } from "react";

export const SprintFormDialogContext = createContext(null);

export const useSprintFormDialog = () => {
  const context = useContext(SprintFormDialogContext);
  if (!context) {
    throw new Error(
      "useSprintFormDialog must be used within a SprintFormDialogProvider",
    );
  }
  return context;
};
