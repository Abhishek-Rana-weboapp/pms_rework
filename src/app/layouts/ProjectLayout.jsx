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
import { Outlet, useLocation, useNavigate, useParams } from "react-router-dom";

const ProjectLayout = () => {
  const { orgUuid } = useParams();
  const navigate = useNavigate();
  const { pathname } = useLocation();
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
        <button
          className="cursor-pointer flex mb-2 items-center text-gray-500"
          onClick={() => {
            navigate(`/${orgUuid}/projects`);
          }}
        >
          <ArrowLeft className="md:size-4 size-3 " />
          <span className="text-xs">All Projects</span>
        </button>
        <div className="flex justify-between mb-2">
          <div className="flex items-center gap-2">
            <h2 className="sm:text-xl text-lg font-semibold">
              {projectData.project_name}
            </h2>
            <Badge>{projectData.project_status}</Badge>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-sm flex items-center gap-2">
              <Progress
                value={projectData.project_progress}
                className={"sm:w-44 w-20 h-2.5"}
              />
              {Number(projectData.project_progress).toFixed(0)}%
            </div>

            <DropdownMenu modal={false}>
              <DropdownMenuTrigger
                className={
                  "p-2 rounded-lg border border-neutral-300 cursor-pointer"
                }
              >
                <MoreHorizontalIcon className="md:size-4 size-3" />
              </DropdownMenuTrigger>

              <DropdownMenuContent>
                <DropdownMenuItem
                  onClick={() => openEdit(projectData)}
                  className={"flex items-center text-gray-600 cursor-pointer"}
                >
                  <Pencil />
                  Edit Project
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <ProjectTabs />
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto bg-slate-50 p-3">
        <SprintFormDialogProvider>
          <ArtifactFormDialogProvider>
            <Suspense
              // key={pathname}
              fallback={
                <div className="flex justify-center items-center">
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
