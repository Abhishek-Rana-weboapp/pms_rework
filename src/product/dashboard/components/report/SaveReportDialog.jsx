import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Spinner } from "@/shared/components/ui/spinner";
import { Textarea } from "@/shared/components/ui/textarea";
import { Button } from "@/shared/components/ui/button";

const SaveReportDialog = ({
  open,
  onOpenChange,
  mode = "create",
  name = "",
  description = "",
  onNameChange,
  onDescriptionChange,
  onSubmit,
  isSubmitting = false,
}) => {
  const isUpdate = mode === "edit";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isUpdate ? "Update Report" : "Save Report"}
          </DialogTitle>
          <DialogDescription>
            {isUpdate
              ? "Update the name and description for this report."
              : "Give your report a name and optional description."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="report-name">Report name</Label>
            <Input
              id="report-name"
              value={name}
              onChange={(event) => onNameChange?.(event.target.value)}
              placeholder="Enter report name"
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="report-description">Description</Label>
            <Textarea
              id="report-description"
              value={description}
              onChange={(event) => onDescriptionChange?.(event.target.value)}
              placeholder="Optional description"
              rows={3}
              disabled={isSubmitting}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={onSubmit}
            disabled={isSubmitting || !name.trim()}
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <Spinner className="size-4" />
                {isUpdate ? "Updating" : "Saving"}
              </span>
            ) : isUpdate ? (
              "Update"
            ) : (
              "Save"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SaveReportDialog;
