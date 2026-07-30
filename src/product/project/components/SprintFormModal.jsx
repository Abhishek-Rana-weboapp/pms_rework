import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { lazy, Suspense, useEffect, useRef } from "react";
import { useSprintFormDialog } from "../context/SprintFormDialogStore";
import { Spinner } from "@/shared/components/ui/spinner";

// Deferred so the form's dependencies load on first open rather than with ProjectLayout.
const SprintFormBody = lazy(() => import("./SprintFormBody"));

const isPopoverOpen = () =>
  !!document.querySelector(
    '[data-slot="select-content"],[data-radix-popper-content-wrapper]',
  );

const SprintFormModal = () => {
  const { sprintForm, closeSprintForm } = useSprintFormDialog();
  const { open, mode, sprint } = sprintForm;
  const isEdit = mode === "edit";

  const popoverWasOpenRef = useRef(false);

  useEffect(() => {
    const snapshot = () => {
      popoverWasOpenRef.current = isPopoverOpen();
    };

    document.addEventListener("pointerdown", snapshot, true);

    return () => document.removeEventListener("pointerdown", snapshot, true);
  }, []);

  const guardOutside = (e) => {
    if (popoverWasOpenRef.current) {
      e.preventDefault();
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && closeSprintForm()}>
      <DialogContent
        onPointerDownOutside={guardOutside}
        onInteractOutside={guardOutside}
      >
        <DialogHeader>
          <DialogTitle className="text-lg">
            {isEdit ? "Edit Sprint" : "Create Sprint"}
          </DialogTitle>
        </DialogHeader>

        {open && (
          <Suspense
            fallback={
              <div className="flex items-center justify-center py-10">
                <Spinner />
              </div>
            }
          >
            <SprintFormBody
              key={isEdit ? `edit-${sprint?.id}` : "create"}
              mode={mode}
              sprint={sprint}
              onClose={closeSprintForm}
            />
          </Suspense>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SprintFormModal;
