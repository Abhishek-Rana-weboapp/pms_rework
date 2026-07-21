import ArtifactStatusBadge from "@/product/project/components/ArtifactStatusBadge";
import { Progress } from "@/shared/components/ui/progress";
import SectionWrapper from "@/shared/components/wrappers/SectionWrapper";
import { formatDateLocal } from "@/shared/lib/helpers";
import React from "react";

const DashboardRecentProjectSection = ({ recentProjects }) => {
  return (
    <SectionWrapper>
      <h3 className="mb-4 font-semibold">Recent Projects</h3>

      {/* Scroll container */}
      <div className="w-full overflow-x-auto rounded-md scrollbar-thin ">
        {/* Table gets wider than the container when necessary */}
        <table className="w-full min-w-120">
          <thead>
            <tr className="border-b border-neutral-300 bg-zinc-100">
              <th className="p-2 text-start text-sm font-medium uppercase text-gray-700">
                Project
              </th>

              <th className="p-2 px-4 text-start text-sm font-medium uppercase text-gray-700">
                Progress
              </th>

              <th className="p-2 text-start text-sm font-medium uppercase text-gray-700">
                Status
              </th>
            </tr>
          </thead>

          <tbody>
            {recentProjects?.map((project, index) => (
              <tr key={index} className="border-b border-neutral-200">
                <td className="p-2">
                  <p className="text-sm capitalize">{project.project_name}</p>

                  <p className="text-xs text-gray-600 mt-1">
                    Due: {formatDateLocal(project.due_date)}
                  </p>
                </td>

                <td className="p-2 px-4 text-xs">
                  <div className="flex min-w-45 items-center gap-2">
                    <Progress value={project.progress} />

                    <span className="shrink-0">
                      {project.progress.toFixed(0)}%
                    </span>
                  </div>
                </td>

                <td className="p-2">
                  <ArtifactStatusBadge
                    status={project.status}
                    category={project.status}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SectionWrapper>
  );
};


export default DashboardRecentProjectSection