import { Badge } from "@/shared/components/ui/badge";
import { getStatusCategoryColors } from "@/shared/lib/statusColors";
import { useProjectStatuses } from "../api/project/projectQueries";
import { useParams } from "react-router-dom";
import { useGlobalStatus } from "@/product/settings/api/settingsQueries";

const normalize = (value) => value?.trim().toUpperCase();

const findStatusCategory = (statuses, status) => {
  return statuses.find(
    (item) => normalize(item.status_name) === normalize(status),
  )?.category;
};

const ArtifactStatusBadge = ({ status, category }) => {
  const { projectId } = useParams();

  const { data: globalStatuses = [] } = useGlobalStatus();

  const { data: projectStatuses = [] } = useProjectStatuses(projectId, {
    enabled: Boolean(projectId),
  });

  if (!status || status === "—") {
    return <span className="text-muted-foreground">—</span>;
  }

  let resolvedCategory = category;

  // Backend provided the category
  if (!resolvedCategory) {
    // Prefer project statuses when available
    if (projectStatuses.length > 0) {
      resolvedCategory = findStatusCategory(projectStatuses, status);
    }

    // Fallback to global statuses
    if (!resolvedCategory) {
      resolvedCategory = findStatusCategory(globalStatuses, status);
    }
  }

  const { badge } = getStatusCategoryColors(resolvedCategory, status);

  return <Badge className={badge}>{status}</Badge>;
};

export default ArtifactStatusBadge;