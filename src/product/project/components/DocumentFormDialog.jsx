import { Plus } from "lucide-react";
import { useState } from "react";

import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/components/ui/dialog";
import DocumentForm from "./DocumentForm";

// Closing unmounts DialogContent, so the form resets itself between openings —
// no manual reset() on success or cancel.
const DocumentFormDialog = ({ target, targetId }) => {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" disabled={!targetId} className={"pr-4"}>
          <Plus />
          Add 
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add document</DialogTitle>
          <DialogDescription>
            Upload a file or link to one hosted elsewhere.
          </DialogDescription>
        </DialogHeader>

        <DocumentForm
          target={target}
          targetId={targetId}
          onSuccess={close}
          onCancel={close}
        />
      </DialogContent>
    </Dialog>
  );
};

export default DocumentFormDialog;
