import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import ProjectForm from "@/product/project/components/ProjectForm";
import { ProjectFormDialogContext } from "./projectFormDialogStore";

const initialState = { open: false, mode: "add", project: null };

// True while a Radix Select / popper-positioned popover is mounted (i.e. open).
const isPopoverOpen = () =>
  !!document.querySelector(
    '[data-slot="select-content"],[data-radix-popper-content-wrapper]',
  );

export const ProjectFormDialogProvider = ({ children }) => {
  const [state, setState] = useState(initialState);

  // A click that closes a Select unmounts it synchronously (flushSync) *within*
  // the same pointer event. That un-suppresses the Dialog's outside-pointer
  // layer, so the Dialog then dismisses on the SAME click. By the time the
  // Dialog's handler runs, the Select is already gone — so we snapshot "was a
  // popover open?" in the capture phase, which runs BEFORE Radix's dismiss.
  const popoverWasOpenRef = useRef(false);
  useEffect(() => {
    const snapshot = () => {
      popoverWasOpenRef.current = isPopoverOpen();
    };
    document.addEventListener("pointerdown", snapshot, true); // capture phase
    return () => document.removeEventListener("pointerdown", snapshot, true);
  }, []);

  const guardOutside = (e) => {
    // If the click also closed a popover, don't let it close the dialog too.
    if (popoverWasOpenRef.current) e.preventDefault();
  };

  const openAdd = useCallback(
    () => setState({ open: true, mode: "add", project: null }),
    [],
  );

  const openEdit = useCallback(
    (project) => setState({ open: true, mode: "edit", project }),
    [],
  );

  const close = useCallback(
    () => setState((prev) => ({ ...prev, open: false })),
    [],
  );

  // Stable identity so consumers don't re-render on every provider render.
  const value = useMemo(
    () => ({ openAdd, openEdit, close }),
    [openAdd, openEdit, close],
  );

  const isEdit = state.mode === "edit";

  return (
    <ProjectFormDialogContext.Provider value={value}>
      {children}

      <Dialog open={state.open} onOpenChange={(open) => !open && close()}>
        <DialogContent
          className={
            "md:min-w-3xl max-h-[85vh] flex flex-col p-0 gap-0 overflow-hidden"
          }
          onPointerDownOutside={guardOutside}
          onInteractOutside={guardOutside}
        >
          <DialogHeader className="p-6 pb-4">
            <DialogTitle className={"text-lg"}>
              {isEdit ? "Edit Project" : "New Project"}
            </DialogTitle>
            <DialogDescription>
              {isEdit
                ? "Update the project details below."
                : "Fill in the details to create a new project."}
            </DialogDescription>
          </DialogHeader>

          <div className="overflow-y-auto px-6 pb-6 scrollbar-thin">
            <ProjectForm
              key={isEdit ? (state.project?.id ?? "edit") : "add"}
              mode={state.mode}
              project={state.project}
              onSuccess={close}
              onCancel={close}
            />
          </div>
        </DialogContent>
      </Dialog>
    </ProjectFormDialogContext.Provider>
  );
};
