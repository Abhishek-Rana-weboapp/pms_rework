import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "motion/react";

import ProjectFormStepOne from "./ProjectFormStepOne";
import ProjectFormStepTwo from "./ProjectFormStepTwo";
import {
  projectDefaultValues,
  projectFirstStepTriggerArray,
  projectSchema,
} from "../config/projectSchema";
import { extractPrefilledProjectData } from "../config/projectHelpers";
import {
  useCreateProject,
  useUpdateProject,
} from "../api/project/projectMutations";
import { Button } from "@/shared/components/ui/button";
import { Spinner } from "@/shared/components/ui/spinner";
import { toApiDate } from "@/shared/lib/helpers";
import { sanitizeHtml } from "@/shared/lib/sanitize";
import {
  usePriorities,
  useProjectTypes,
} from "@/product/settings/api/settingsQueries";
import { useEmployees } from "@/product/dashboard/api/queries";

// Fields that must only be sent when they have a value (blank would fail the API's
// server-side validation); everything else is sent even when empty so it clears.
const EDIT_REQUIRED = ["project_name", "project_type", "priority", "description"];
// Not scalar form fields — handled separately or not part of the edit payload.
const EDIT_SKIP = new Set([
  "attachments",
  "status",
  "custom_statuses",
  "selected_status_ids",
]);

// Build the multipart payload for an update. Mirrors the create serialization
// (dates -> string) but as FormData so newly-added attachment files can ride along.
const buildUpdateFormData = (data) => {
  const formData = new FormData();

  Object.entries(data).forEach(([key, value]) => {
    if (EDIT_SKIP.has(key)) return;
    let serialized = value instanceof Date ? toApiDate(value) : value;
    // description is rich-text HTML (Tiptap) — sanitize before it leaves the client.
    if (key === "description") serialized = sanitizeHtml(serialized);
    if (EDIT_REQUIRED.includes(key)) {
      if (serialized) formData.append(key, serialized);
    } else {
      formData.append(key, serialized ?? "");
    }
  });

  (data.attachments ?? []).forEach((file, index) => {
    formData.append(`attachments[${index}].file`, file);
  });

  return formData;
};

const stepVariants = {
  enter: (direction) => ({ x: direction > 0 ? 60 : -60, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (direction) => ({ x: direction > 0 ? -60 : 60, opacity: 0 }),
};

// Data + loading boundary. In edit mode the option lists must be loaded before the
// form mounts so each <Select> can resolve its prefilled value on the first paint
// (no reset()-after-mount, no focus-stealing remount). Once ready, we build the
// resolved defaultValues and hand them to the inner form.
const ProjectForm = ({ mode, project, onSuccess, onCancel }) => {
  const { data: projectTypesData = [], isLoading: loadingTypes } =
    useProjectTypes();
  const { data: priorityData = [], isLoading: loadingPriorities } =
    usePriorities();
  const { isLoading: loadingEmployees } = useEmployees();

  const isEdit = mode === "edit";

  // Gate on the queries' loading state (not their length) so an empty list can't
  // spin forever. Employees are needed so the Manager select can show its value.
  if (isEdit && (loadingTypes || loadingPriorities || loadingEmployees)) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Spinner className="size-6 text-muted-foreground" />
      </div>
    );
  }

  const defaultValues =
    isEdit && project
      ? extractPrefilledProjectData(project, {
          projectTypes: projectTypesData,
          priorities: priorityData,
        })
      : projectDefaultValues;

  return (
    <ProjectFormFields
      mode={mode}
      projectId={project?.id}
      defaultValues={defaultValues}
      onSuccess={onSuccess}
      onCancel={onCancel}
    />
  );
};

const ProjectFormFields = ({
  mode,
  projectId,
  defaultValues,
  onSuccess,
  onCancel,
}) => {
  const isEdit = mode === "edit";
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);

  const methods = useForm({
    resolver: zodResolver(projectSchema),
    defaultValues,
  });

  const createProjectMutation = useCreateProject({
    onSuccess: () => onSuccess?.(),
  });
  const updateProjectMutation = useUpdateProject({
    onSuccess: () => onSuccess?.(),
  });
  const isPending =
    createProjectMutation.isPending || updateProjectMutation.isPending;

  const handleCreateProject = (data) => {
    createProjectMutation.mutate({
      ...data,
      description: sanitizeHtml(data.description),
      start_date: toApiDate(data.start_date),
      end_date: toApiDate(data.end_date),
    });
  };

  const handleUpdateProject = (data) => {
    updateProjectMutation.mutate({
      id: projectId,
      formData: buildUpdateFormData(data),
    });
  };

  // Create is a two-step wizard; validate step 1 before advancing.
  const handleNext = async () => {
    const valid = await methods.trigger(projectFirstStepTriggerArray);
    if (valid) {
      setDirection(1);
      setStep(2);
    }
  };
  const handleBack = () => {
    setDirection(-1);
    setStep(1);
  };

  const submitCreate = methods.handleSubmit(handleCreateProject);
  const submitUpdate = methods.handleSubmit(handleUpdateProject);

  return (
    <FormProvider {...methods}>
      <form onSubmit={(e) => e.preventDefault()} className="flex flex-col gap-6">
        <fieldset disabled={isPending} className="contents">
          <div className="h-[60vh] overflow-hidden">
            <AnimatePresence initial={false} mode="wait" custom={direction}>
              <motion.div
                key={step}
                custom={direction}
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className="h-full overflow-y-auto no-scrollbar p-0.5"
              >
                {/* Edit is single-step (statuses are set only at creation). */}
                {isEdit || step === 1 ? (
                  <ProjectFormStepOne />
                ) : (
                  <ProjectFormStepTwo />
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex justify-end gap-2">
            {isEdit ? (
              <>
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
                <Button type="button" onClick={submitUpdate} disabled={isPending}>
                  {updateProjectMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </>
            ) : step === 1 ? (
              <>
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
                <Button type="button" onClick={handleNext}>
                  Next
                </Button>
              </>
            ) : (
              <>
                <Button type="button" variant="outline" onClick={handleBack}>
                  Back
                </Button>
                <Button type="button" onClick={submitCreate} disabled={isPending}>
                  {createProjectMutation.isPending
                    ? "Creating..."
                    : "Create Project"}
                </Button>
              </>
            )}
          </div>
        </fieldset>
      </form>
    </FormProvider>
  );
};

export default ProjectForm;
