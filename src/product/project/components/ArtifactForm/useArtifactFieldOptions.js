import { useParams } from "react-router-dom";

import { createFullName } from "@/shared/lib/helpers";
import { usePriorities } from "@/product/settings/api/settingsQueries";
import { useEmployees } from "@/product/dashboard/api/queries";
import {
  useArtifacts,
  useProjectStatuses,
} from "../../api/project/projectQueries";
import {
  ARTIFACT_TYPE_OPTIONS,
  getAllowedParents,
  getArtifactTypeLabel,
} from "../../config/artifacts/artifactFormConfig";

/**
 * View-model for the artifact form's selects: fetches every option list the
 * FIELD_CONFIG selects declare and shapes them into
 * `{ [fieldName]: { options, isLoading } }` for ArtifactField to spread.
 *
 * Deliberately form-agnostic: it takes the WATCHED VALUES (taskType,
 * parentType) as plain arguments and returns plain data — it never touches
 * useFormContext. Data sourcing lives here; form side-effects (e.g. seeding
 * the default status) stay in the form component where they're visible.
 *
 * All queries run unconditionally so hook order is stable across type
 * switches; the dependent parent-artifact fetch is gated with `enabled`.
 * `statuses` is also returned raw for the form's default-status seeding.
 */
export const useArtifactFieldOptions = ({ taskType, parentType }) => {
  const { projectId } = useParams();

  const { data: priorities, isLoading: prioritiesLoading } = usePriorities();
  const { data: employeesData, isLoading: developersLoading } = useEmployees({
    pageSize: 1000,
  });
  const { data: statuses, isLoading: statusesLoading } =
    useProjectStatuses(projectId);
  // Cascade: parent artifact options load once a parent kind is picked.
  const { data: parentArtifactsData, isLoading: parentsLoading } = useArtifacts(
    { type: parentType, page_size: 1000 },
    { enabled: !!projectId && !!parentType },
  );

  const optionSources = {
    task_type: { options: ARTIFACT_TYPE_OPTIONS },
    priority: {
      options: (priorities ?? []).map((p) => ({
        label: p.priority,
        value: p.id,
      })),
      isLoading: prioritiesLoading,
    },
    developer: {
      options: (employeesData?.results ?? []).map((dev) => ({
        label: createFullName(dev),
        value: dev.id,
      })),
      isLoading: developersLoading,
    },
    status: {
      options: (statuses ?? []).map((s) => ({
        label: s.status_name,
        value: s.id,
      })),
      isLoading: statusesLoading,
    },
    parent_type: {
      options: getAllowedParents(taskType).map((p) => ({
        label: getArtifactTypeLabel(p),
        value: p,
      })),
    },
    parent_artifact: {
      options: (parentArtifactsData?.results ?? []).map((a) => ({
        label: a.title,
        value: a.id,
      })),
      isLoading: !!parentType && parentsLoading,
    },
  };

  return { optionSources, statuses };
};
