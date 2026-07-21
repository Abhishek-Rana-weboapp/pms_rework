import React from "react";
import { useParams } from "react-router-dom";
import { humanize } from "../config/artifacts/artifactConfig";
import SectionWrapper from "@/shared/components/wrappers/SectionWrapper";
import {
  createFullName,
  createInitials,
  formatDateLocal,
} from "@/shared/lib/helpers";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";
import { Badge } from "@/shared/components/ui/badge";
import { buildPriorityColorMap } from "../config/artifacts/artifact.utils";
import { usePriorities } from "@/product/settings/api/settingsQueries";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { useProjectStatuses } from "../api/project/projectQueries";

const ArtifactStatusDetails = ({ artifact }) => {
  const { artifactType, projectId } = useParams();
  const { data: priorities } = usePriorities();
  const { data: statusData = [] } = useProjectStatuses(projectId);

    const statuses = statusData.map((status)=>{
      return {
          label:status.status_name,
          value:status.id
      }
    })
  const priorityColors = buildPriorityColorMap(priorities);

  const handleStatusChange = async()=>{
    
  }

  return (
    <SectionWrapper>
      <h5 className="capitalize mb-4">{humanize(artifactType)} Details</h5>

      <div className="grid gap-2 gap-y-3">
        <div className="divide-x divide-neutral-300 grid grid-cols-2 items-center overflow-hidden">
          <div className="text-sm text-gray-700">Created By:</div>
          <div className="flex gap-1.5 items-center flex-nowrap">
            <Avatar>
              <AvatarImage src={artifact?.created_by?.user_image} />
              <AvatarFallback>
                {createInitials(artifact?.created_by) || "NA"}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="truncate">{createFullName(artifact?.created_by)}</p>
              <p className="text-xs text-gray-600">
                {artifact?.created_by?.role}
              </p>
            </div>
          </div>
        </div>
        <div className="space-y-1 grid grid-cols-2 items-center overflow-hidden">
          <div className="text-sm text-gray-700">Assigned To:</div>
          <div className="flex gap-1.5 items-center flex-nowrap">
            <Avatar>
              <AvatarImage src={artifact?.developer?.user_image} />
              <AvatarFallback>
                {createInitials(artifact?.developer) || "NA"}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="truncate">{createFullName(artifact?.developer)}</p>
              <p className="text-xs text-gray-600">
                {artifact?.developer?.role}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-1 grid grid-cols-2 items-center overflow-hidden">
          <div className="text-sm text-gray-700">Priority:</div>
          <div className="flex gap-1.5 items-center flex-nowrap">
            <Badge
              style={{
                background: priorityColors[artifact?.priority?.id].bg,
                color: priorityColors[artifact?.priority?.id].text,
              }}
            >
              {artifact?.priority?.priority}
            </Badge>
          </div>
        </div>

        <div className="space-y-1 grid grid-cols-2 items-center overflow-hidden">
          <div className="text-sm text-gray-700">Story Points:</div>
          <div className="flex gap-1.5 items-center flex-nowrap text-sm">
            {artifact?.story_point}
          </div>
        </div>

        <div className="space-y-1 grid grid-cols-2 items-center overflow-hidden">
          <div className="text-sm text-gray-700">Start Date:</div>
          <div className="flex gap-1.5 items-center flex-nowrap text-sm">
            {formatDateLocal(artifact?.start_date)}
          </div>
        </div>

        <div className="space-y-1 grid grid-cols-2 items-center overflow-hidden">
          <div className="text-sm text-gray-700">Target Date:</div>
          <div className="flex gap-1.5 items-center flex-nowrap text-sm">
            {formatDateLocal(artifact?.target_date)}
          </div>
        </div>

        <div className="space-y-1 grid grid-cols-2 items-center overflow-hidden">
          <div className="text-sm text-gray-700">Status:</div>
          <div className="flex gap-1.5 items-center flex-nowrap text-sm">
            <Select value={artifact.status_detail.id} >
              <SelectTrigger className="w-full max-w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent position="popper">
                <SelectGroup>
                  <SelectLabel>Status</SelectLabel>
                  {statuses.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
};

export default ArtifactStatusDetails;
