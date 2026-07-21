import { useEffect, useRef, useState } from "react";
import { ArtifactFormDialogContext } from "./ArtifactFormDialogStore";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import ArtifactForm from "../components/ArtifactForm/ArtifactForm";
import { humanize } from "../config/artifacts/artifactConfig";

const initialState = {
  mode: "add",
  open: false,
  artifact: null,
  presetType: "",
  prefill: null,
};

const isPopoverOpen = () =>
  !!document.querySelector(
    '[data-slot="select-content"],[data-radix-popper-content-wrapper]',
  );

export const ArtifactFormDialogProvider = ({ children }) => {
  const [state, setState] = useState(initialState);

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

  // Scoped "Add" buttons pass the route's artifactType to pre-select it;
  // the universal Add button calls openAdd() and the user picks the type.
  // `prefill` seeds extra fields (e.g. { parent_type, parent_artifact } when
  // adding a child from an artifact's children section).
  const openAdd = (presetType = "", prefill = null) =>
    setState({ open: true, mode: "add", artifact: null, presetType, prefill });

  const openEdit = (artifact) =>
    setState({ open: true, mode: "edit", artifact, presetType: "", prefill: null });

  const close = () => setState((prev) => ({ ...prev, open: false }));

  const value = { openAdd, openEdit, close };

  const isEdit = state.mode === "edit";

  return (
    <ArtifactFormDialogContext.Provider value={value}>
      {children}

      <Dialog open={state.open} onOpenChange={(open) => !open && close()}>
        <DialogContent
          className="md:min-w-4xl  max-h-[85vh] flex flex-col p-0 gap-0 overflow-hidden"
          onPointerDownOutside={guardOutside}
          onInteractOutside={guardOutside}
        >
          <DialogHeader className="p-6 pb-4">
            <DialogTitle className="text-lg capitalize">{isEdit ? `Update ${state.artifact.task_type}` : `Add ${humanize(state.presetType)}`}
            </DialogTitle>
          </DialogHeader>

          <div className="overflow-y-auto px-6 pb-6 scrollbar-thin">
            <ArtifactForm
              key={isEdit ? "edit" : "add"}
              mode={state.mode}
              artifact={state.artifact}
              presetType={state.presetType}
              prefill={state.prefill}
              onSuccess={close}
              onCancel={close}
            />
          </div>
        </DialogContent>
      </Dialog>
    </ArtifactFormDialogContext.Provider>
  );
};
