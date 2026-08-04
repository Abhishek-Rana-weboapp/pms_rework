import { useCurrentProject } from "../api/project/projectQueries";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";
import {
  createFullName,
  createInitials,
  formatDateLocal,
} from "@/shared/lib/helpers";
import ShowMore from "@/shared/components/ui/ShowMore";
import RichText from "@/shared/components/RichText";
import { Badge } from "@/shared/components/ui/badge";

const ProjectOverview = () => {
  const { data: projectData, isLoading } = useCurrentProject({
    refetchOnWindowFocus: false,
  });

  if (isLoading) {
    return <div>Loading</div>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
      {/* LEFT */}
      <div className="lg:col-span-2 bg-white shadow rounded-xl p-6 space-y-6">
        {/* Description */}
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase mb-2">
            Project Description
          </p>
          <ShowMore containerClassName={"bg-white p-0 text-sm"}>
            <RichText
              html={projectData?.description}
              fallback={
                <span className="text-muted-foreground">
                  No description available
                </span>
              }
            />
          </ShowMore>
        </div>

        <hr className="border-gray-200" />

        {/* Manager + Creator */}
        <div className="grid grid-cols-2 gap-6">
          {/* Manager */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase mb-2">
              Project Manager
            </p>
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage
                  src={projectData?.manager_details?.user_image}
                  alt={createFullName(projectData?.manager_details)}
                />
                <AvatarFallback className={"bg-green-100 text-green-500"}>
                  {createInitials(projectData?.manager_details)}
                </AvatarFallback>
              </Avatar>
              {/* <Avatar user={projectData?.manager_details} /> */}
              <div>
                <p className="text-sm font-medium text-gray-900 capitalize">
                  {createFullName(projectData?.manager_details) || "-"}
                </p>
                <p className="text-xs text-gray-500">
                  {projectData?.manager_details?.role || ""}
                </p>
              </div>
            </div>
          </div>

          {/* Created By */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase mb-2">
              Created By
            </p>
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage
                  src={projectData?.created_by?.user_image}
                  alt={createFullName(projectData?.created_by)}
                />
                <AvatarFallback className={"bg-green-100 text-green-500"}>
                  {createInitials(projectData?.created_by)}
                </AvatarFallback>
              </Avatar>
              {/* <Avatar user={projectData?.created_by} color="green" /> */}
              <div>
                <p className="text-sm font-medium text-gray-900 capitalize">
                  {createFullName(projectData?.created_by) || "-"}
                </p>
                <p className="text-xs text-gray-500">
                  {projectData?.created_by?.role_name ||
                    projectData?.created_by?.role ||
                    "-"}
                </p>
              </div>
            </div>
          </div>
        </div>

        <hr className="border-gray-200" />

        {/* Team */}
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase mb-2">
            Team Members
          </p>

          {projectData?.devlopers_details?.length ? (
            <div className="flex items-center">
              {/* {projectData.devlopers_details.slice(0, 5).map((m, i) => (
                    
                    <Avatar key={i} user={m} small overlap />
                  ))} */}

              {projectData.devlopers_details.length > 5 && (
                <div className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-200 text-xs font-medium -ml-2 border-2 border-white">
                  +{projectData.devlopers_details.length - 5}
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-500">(0 members)</p>
          )}
        </div>
      </div>

      {/* RIGHT */}
      <div className="space-y-6">
        {/* Timeline */}
        <div className="bg-white shadow rounded-xl p-5">
          <p className="text-xs font-semibold text-gray-400 uppercase mb-2">
            Timeline
          </p>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Start date</span>
              <span className="text-gray-900 font-medium">
                {formatDateLocal(projectData?.start_date)}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-500">End date</span>
              <span className="text-gray-900 font-medium">
                {formatDateLocal(projectData?.end_date)}
              </span>
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="bg-white shadow rounded-xl p-5">
          <p className="text-xs font-semibold text-gray-400 uppercase mb-2">
            Project status
          </p>

          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-500">Progress</span>
            <span className="text-gray-900 font-medium">
              {projectData?.project_progress || 0}%
            </span>
          </div>

          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden mb-3">
            <div
              className="h-full bg-blue-600 rounded-full"
              style={{ width: `${projectData?.project_progress || 0}%` }}
            />
          </div>

          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500">Status</span>
            <Badge variant="secondary">{projectData?.project_status}</Badge>
            {/* <span style={{
                  // background:colorsObject[projectData?.project_status],
                  // color:textColorsObject[projectData?.project_status]
                }} className="p-2 text-xs rounded-full" >
                   {projectData?.project_status}
                </span> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectOverview;
