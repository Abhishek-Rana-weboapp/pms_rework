import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/components/ui/alert-dialog";
import { Spinner } from "@/shared/components/ui/spinner";

import { useDeleteSprint, useStartSprint } from "../api/backlog/backlogMutations";
import { useBacklogContext } from "../context/BacklogStore";

const alertCopy = {
  start: {
    title: "Start Sprint",
    description: (name) =>
      `Start "${name}"? This will activate the sprint and move it out of planning.`,
    action: "Start Sprint",
  },
  delete: {
    title: "Delete Sprint",
    description: (name) => `Delete "${name}"? This action cannot be undone.`,
    action: "Delete Sprint",
  },
};

const BacklogAlerts = () => {
  const { alert, closeAlert } = useBacklogContext();
  const { type, sprint } = alert;

  const deleteSprint = useDeleteSprint({ onSuccess: closeAlert });
  const startSprint = useStartSprint({ onSuccess: closeAlert });

  if (!type || !sprint) return null;

  const copy = alertCopy[type];
  const sprintName = sprint.sprint_name ?? "this sprint";
  const isPending = deleteSprint.isPending || startSprint.isPending;

  const handleConfirm = () => {
    if (type === "delete") {
      deleteSprint.mutate(sprint.id);
      return;
    }

    if (type === "start") {
      startSprint.mutate(sprint.id);
    }
  };

  return (
    <AlertDialog open onOpenChange={(open) => !open && !isPending && closeAlert()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{copy.title}</AlertDialogTitle>
          <AlertDialogDescription>
            {copy.description(sprintName)}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant={type === "delete" ? "destructive" : "default"}
            disabled={isPending}
            onClick={(e) => {
              e.preventDefault();
              handleConfirm();
            }}
          >
            {isPending && <Spinner />}
            {copy.action}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default BacklogAlerts;
