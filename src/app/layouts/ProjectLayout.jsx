import PermissionGate from "@/product/auth/components/PermissionGate";
import { PERMISSIONS } from "@/product/auth/config/permissions";
import { useAuthPermissions } from "@/product/auth/hooks/useAuthPermissions";
import { useCurrentProject } from "@/product/project/api/project/projectQueries";
import ProjectTabs from "@/product/project/components/ProjectTabs";
import { ArtifactFormDialogProvider } from "@/product/project/context/ArtifactFormDialogContext";
import { SprintFormDialogProvider } from "@/product/project/context/SprintFormDialogContext";
import { useProjectFormDialog } from "@/product/project/context/projectFormDialogStore";
import { Badge } from "@/shared/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { Progress } from "@/shared/components/ui/progress";
import { Spinner } from "@/shared/components/ui/spinner";
import { ArrowLeft, MoreHorizontalIcon, Pencil } from "lucide-react";
import { Suspense } from "react";
import { Outlet, useNavigate, useParams } from "react-router-dom";

const ProjectLayout = () => {
  const { orgUuid } = useParams();
  const navigate = useNavigate();
  const { can } = useAuthPermissions();
  const {
    data: projectData,
    isLoading: projectLoading,
    error,
  } = useCurrentProject();

  const { openEdit } = useProjectFormDialog();

  if (projectLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>something went wrong</div>;
  }

  return (
    <div className="flex h-full w-full flex-col overflow-hidden">
      <div className="shrink-0 bg-white p-4">
        <div className="mb-2 flex items-start justify-between sm:items-center">
          <div className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
            <button
              className="flex cursor-pointer items-center text-gray-500"
              onClick={() => {
                navigate(`/${orgUuid}/projects`);
              }}
            >
              <ArrowLeft className="size-3 md:size-4" />
            </button>
            <h2 className="font-semibold sm:text-lg">
              {projectData.project_name}
            </h2>
            <Badge>{projectData.project_status}</Badge>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm">
              <Progress
                value={projectData.project_progress}
                className="h-2.5 w-20 sm:w-44"
              />
              {Number(projectData.project_progress).toFixed(0)}%
            </div>

            {can(PERMISSIONS.PROJECT.CHANGE) && (
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger className="cursor-pointer rounded-lg border border-neutral-300 p-2">
                  <MoreHorizontalIcon className="size-3 md:size-4" />
                </DropdownMenuTrigger>

                <DropdownMenuContent>
                  <PermissionGate permission={PERMISSIONS.PROJECT.CHANGE}>
                    <DropdownMenuItem
                      onClick={() => openEdit(projectData)}
                      className="flex cursor-pointer items-center text-gray-600"
                    >
                      <Pencil />
                      Edit Project
                    </DropdownMenuItem>
                  </PermissionGate>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
        <ProjectTabs />
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto bg-slate-50 p-3">
        <SprintFormDialogProvider>
          <ArtifactFormDialogProvider>
            <Suspense
              fallback={
                <div className="flex items-center justify-center">
                  <Spinner />
                </div>
              }
            >
              <Outlet />
            </Suspense>
          </ArtifactFormDialogProvider>
        </SprintFormDialogProvider>
      </div>
    </div>
  );
};

export default ProjectLayout;
