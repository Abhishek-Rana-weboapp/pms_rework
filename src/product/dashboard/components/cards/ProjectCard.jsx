import { Avatar, AvatarFallback, AvatarGroup, AvatarImage } from "@/shared/components/ui/avatar";
import { Badge } from "@/shared/components/ui/badge";
import { Progress } from "@/shared/components/ui/progress";
import { createInitials } from "@/shared/lib/helpers";
import { statusBadgeColors } from "@/shared/lib/sharedData";
import { cn } from "@/shared/lib/utils";
import React from "react";

const ProjectCard = ({ project, onClick }) => {

  return (
    <div onClick={()=>onClick(project)} className="w-full rounded-md shadow bg-white p-4 space-y-3 cursor-pointer hover:scale-[1.01] transition">
      <div className="flex justify-between items-center">
        <div className="flex flex-col items-start">
          <h3 className="font-medium">{project.project_name}</h3>
          <p className="text-xs text-gray-500">{project.project_type}</p>
        </div>

        <Badge
          className={cn(
            "text-xs bg-secondary text-secondary-foreground",
            statusBadgeColors[project.project_status],
          )}
        >
          {project.project_status}
        </Badge>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center text-xs">
          <span>Progress</span>
          <span>{project.project_progress || 0}%</span>
        </div>
        <Progress className={"h-2"} value={project.project_progress} />
      </div>

      <div className="flex justify-between items-center w-full">
          <AvatarGroup>
              {project?.devlopers_details?.length ? (
                project.devlopers_details.map((dev) => (
                  <Avatar key={dev.id} size="sm">
                    <AvatarImage src={dev?.user_image} />
                    <AvatarFallback>{createInitials(dev)}</AvatarFallback>
                  </Avatar>
                ))
              ) : (
                <span className="text-xs text-gray-500">No developers</span>
              )}
          </AvatarGroup>

              <span className="text-xs text-gray-500">
                 {project.end_date}
              </span>
      </div>
    </div>
  );
};

export default ProjectCard;
