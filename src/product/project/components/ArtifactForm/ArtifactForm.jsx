import { useParams } from "react-router-dom";
import {
  FormProvider,
  useForm,
  useFormContext,
  useWatch,
} from "react-hook-form";

import { Button } from "@/shared/components/ui/button";
import { FieldGroup } from "@/shared/components/ui/field";
import { Spinner } from "@/shared/components/ui/spinner";
import { toApiDate } from "@/shared/lib/helpers";
import { sanitizeHtml } from "@/shared/lib/sanitize";
import { useProjectStatuses } from "../../api/project/projectQueries";
import {
  artifactResolver,
  buildArtifactDefaults,
} from "../../config/artifacts/artifactSchema";
import {
  FIELD_CONFIG,
  getStepOneFields,
  layoutMap,
} from "../../config/artifacts/artifactFormConfig";
import ArtifactField from "./ArtifactField";
import { useArtifactFieldOptions } from "./useArtifactFieldOptions";
import {
  useCreateArtifact,
  useUpdateArtifact,
} from "../../api/artifact/artifactMutations";
import { useArtifactFormDialog } from "../../context/ArtifactFormDialogStore";
import { normalizeError } from "@/shared/lib/formErrors";
import { toast } from "sonner";

const RICHTEXT_FIELDS = new Set(
  Object.entries(FIELD_CONFIG)
    .filter(([, cfg]) => cfg.type === "richtext")
    .map(([name]) => name),
);

// Fields this form renders — backend errors for these show inline; anything
// else (or errors: null) falls through to a toast via normalizeError.
const FORM_FIELDS = Object.keys(FIELD_CONFIG);

const buildArtifactFormData = (values) => {
  const formData = new FormData();

  Object.entries(values).forEach(([key, value]) => {
    if (key === "attachments") return; // files appended below

    let serialized = value instanceof Date ? toApiDate(value) : value;
    if (RICHTEXT_FIELDS.has(key)) serialized = sanitizeHtml(serialized);

    if (serialized === undefined || serialized === null || serialized === "")
      return;
    formData.append(key, serialized);
  });

  (values.attachments ?? [])
    .filter((file) => file instanceof File)
    .forEach((file, i) => formData.append(`attachments[${i}].file`, file));

  return formData;
};

const ArtifactForm = ({
  mode = "add",
  artifact,
  presetType,
  prefill,
  onCancel,
}) => {
  const { projectId } = useParams();
  const { data: statuses, isLoading } = useProjectStatuses(projectId);

  if (isLoading) {
    return (
      <div className="flex h-[40vh] items-center justify-center">
        <Spinner className="size-6 text-muted-foreground" />
      </div>
    );
  }

  return (
    <ArtifactFormBody
      mode={mode}
      artifact={artifact}
      presetType={presetType}
      prefill={prefill}
      statuses={statuses ?? []}
      onCancel={onCancel}
    />
  );
};

const ArtifactFormBody = ({
  mode,
  artifact,
  presetType,
  prefill,
  statuses,
  onCancel,
}) => {
  const { close } = useArtifactFormDialog();
  const methods = useForm({
    resolver: artifactResolver,
    defaultValues: buildArtifactDefaults({
      presetType,
      artifact,
      statuses,
      prefill,
    }),
    mode: "onSubmit",
  });

  const createArtifactMutation = useCreateArtifact();
  const updateArtifactMutation = useUpdateArtifact();
  const { setError } = methods;

  const isEdit = mode === "edit";
  const typeLabel = presetType || "Artifact";

  const handleServerError = (error) =>
    normalizeError(error, {
      setError,
      fields: FORM_FIELDS,
      fallback: isEdit
        ? `Failed to update ${typeLabel}.`
        : `Failed to create ${typeLabel}.`,
    });

  const onSubmit = (values) => {
    const payload = buildArtifactFormData(values);

    if (!isEdit) {
      createArtifactMutation.mutate(payload, {
        onSuccess: () => {
          toast.success(`${typeLabel} created successfully`);
          close();
        },
        onError: handleServerError,
      });
    } else {
      updateArtifactMutation.mutate(
        { id: artifact.id, payload },
        {
          onSuccess: () => {
            toast.success(`${typeLabel} updated successfully`);
            close();
          },
          onError: handleServerError,
        },
      );
    }
  };

  return (
    <FormProvider {...methods}>
      {/* Buttons submit imperatively (type="button") so a stray Enter keypress
          inside a field can't submit the dialog form. */}
      <form
        onSubmit={(e) => e.preventDefault()}
        className="flex flex-col gap-6"
      >
        <ArtifactFormFields isPending={isEdit ? updateArtifactMutation.isPending : createArtifactMutation.isPending} />

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            type="button"
            disabled={isEdit ? updateArtifactMutation.isPending : createArtifactMutation.isPending}
            onClick={methods.handleSubmit(onSubmit)}
          >
            {isEdit ? (
              updateArtifactMutation.isPending ? (
                <span className="flex items-center gap-2">
                  <Spinner /> Saving
                </span>
              ) : (
                "Save Changes"
              )
            ) : createArtifactMutation.isPending ? (
              <span className="flex items-center gap-2">
                <Spinner /> Saving
              </span>
            ) : (
              "Create"
            )}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
};

export default ArtifactForm;

const ArtifactFormFields = ({isPending}) => {
  const { control } = useFormContext();
  const taskType = useWatch({ control, name: "task_type" });
  const parentType = useWatch({ control, name: "parent_type" });

  const { optionSources } = useArtifactFieldOptions({ taskType, parentType });

  return (
    <FieldGroup className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {getStepOneFields(taskType).map(({ name, layout }) => (
        <div key={name} className={layoutMap[layout]}>
          <ArtifactField disabled={isPending} name={name} {...(optionSources[name] ?? {})} />
        </div>
      ))}
    </FieldGroup>
  );
};
