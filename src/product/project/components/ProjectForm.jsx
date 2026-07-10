import { useState } from "react";
import { format } from "date-fns";
import ProjectFormStepOne from "./ProjectFormStepOne";
import ProjectFormStepTwo from "./ProjectFormStepTwo";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  projectDefaultValues,
  projectFirstStepTriggerArray,
  projectSchema,
} from "../config/projectSchema";
import { useCreateProject } from "../api/project/projectMutations";
import { Button } from "@/shared/components/ui/button";
import { AnimatePresence, motion } from "motion/react";
import { extractPrefilledProjectData } from "../config/projectHelpers";
import { useProjectTypes } from "@/product/settings/api/settingsQueries";
import { Spinner } from "@/shared/components/ui/spinner";

// The form holds Date objects; the API expects YYYY-MM-DD strings.
const toApiDate = (date) => (date ? format(date, "yyyy-MM-dd") : null);

const stepVariants = {
  enter: (direction) => ({ x: direction > 0 ? 60 : -60, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (direction) => ({ x: direction > 0 ? -60 : 60, opacity: 0 }),
};

// Gate: in edit mode we need the option lists loaded so the prefill values can
// be resolved *before* the form mounts. Rendering the inner form only once the
// values are known lets each <Select> mount with its value already set — no
// reset()-after-mount, and therefore no remount hack that would steal focus.
const ProjectForm = ({ mode, project, onSuccess, onCancel }) => {
  const { data: projectTypesData } = useProjectTypes();

  const isEdit = mode === "edit";
  const optionsReady = Boolean(projectTypesData?.results);

  if (isEdit && !optionsReady) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Spinner className="size-6 text-muted-foreground" />
      </div>
    );
  }

  const defaultValues =
    isEdit && project
      ? extractPrefilledProjectData(project, projectTypesData.results)
      : projectDefaultValues;

  return (
    <ProjectFormFields
      defaultValues={defaultValues}
      onSuccess={onSuccess}
      onCancel={onCancel}
    />
  );
};

const ProjectFormFields = ({ defaultValues, onSuccess, onCancel }) => {
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);

  const methods = useForm({
    resolver: zodResolver(projectSchema),
    defaultValues,
  });

  const createProjectMutation = useCreateProject({
    onSuccess: () => onSuccess?.(),
  });

  const handleCreateProject = (data) => {
    const payload = {
      ...data,
      start_date: toApiDate(data.start_date),
      end_date: toApiDate(data.end_date),
    };
    createProjectMutation.mutate(payload);
  };

  // Validate step 1 before advancing; only move forward if it passes.
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

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={(e) => e.preventDefault()}
        className="flex flex-col gap-6"
      >
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
              {step === 1 ? <ProjectFormStepOne /> : <ProjectFormStepTwo />}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex justify-end gap-2">
          {step === 1 ? (
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
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
              >
                Back
              </Button>
              <Button
                type="button"
                onClick={submitCreate}
                disabled={createProjectMutation.isPending}
              >
                {createProjectMutation.isPending
                  ? "Creating..."
                  : "Create Project"}
              </Button>
            </>
          )}
        </div>
      </form>
    </FormProvider>
  );
};

export default ProjectForm;
