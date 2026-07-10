import { createContext, useContext } from "react";

export const ProjectFormDialogContext = createContext(null);

export const useProjectFormDialog = () => {
  const ctx = useContext(ProjectFormDialogContext);
  if (!ctx) {
    throw new Error(
      "useProjectFormDialog must be used within a ProjectFormDialogProvider"
    );
  }
  return ctx;
};
