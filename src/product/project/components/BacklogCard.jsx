import { Check, ChevronDown } from "lucide-react";
import { useParams } from "react-router-dom";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { cn } from "@/shared/lib/utils";
import { getStatusCategoryColors } from "@/shared/lib/statusColors";
import { useProjectStatuses } from "../api/project/projectQueries";

const formatTaskType = (type) =>
  type
    ? type
        .replace(/_/g, " ")
        .toLowerCase()
        .replace(/\b\w/g, (c) => c.toUpperCase())
    : null;

const stopCardInteraction = (event) => {
  event.stopPropagation();
};

const BacklogCard = ({ card, canChangeStatus = false }) => {
  const { projectId } = useParams();
  const { title, developer, storyPoint, status, statusCategory, raw } = card;
  const taskType = formatTaskType(raw?.task_type);
  const currentStatusId = raw?.status_detail?.id ?? raw?.status_details?.id;

  const { data: projectStatuses = [] } = useProjectStatuses(
    canChangeStatus ? projectId : undefined,
  );

  const { badge: statusBadgeClass } = getStatusCategoryColors(
    statusCategory,
    status,
  );

  return (
    <div className="flex w-full items-center justify-between gap-4">
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate text-sm font-medium text-foreground">{title}</p>
          {taskType && (
            <Badge variant="outline" className="shrink-0 text-[10px]">
              {taskType}
            </Badge>
          )}
        </div>
        {storyPoint ? (
          <span className="inline-block rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
            {storyPoint} pts
          </span>
        ) : null}
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {canChangeStatus && (
          <div
            onClick={stopCardInteraction}
            onPointerDown={stopCardInteraction}
          >
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "h-7 gap-1 border-0 px-2 text-xs font-medium hover:opacity-90",
                    statusBadgeClass,
                  )}
                >
                  <span className="max-w-28 truncate">{status || "Status"}</span>
                  <ChevronDown className="size-3.5 opacity-70" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-44">
                {projectStatuses.map((item) => {
                  const isSelected = String(item.id) === String(currentStatusId);

                  return (
                    <DropdownMenuItem
                      key={item.id}
                      className="gap-2 text-xs"
                    >
                      <span className="flex-1 truncate">{item.status_name}</span>
                      {isSelected ? (
                        <Check className="size-3.5 shrink-0 opacity-80" />
                      ) : null}
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}

        {developer && (
          <Avatar className="size-7 shrink-0">
            <AvatarImage src={developer.avatar} alt={developer.name} />
            <AvatarFallback className="text-[9px]">
              {developer.initials}
            </AvatarFallback>
          </Avatar>
        )}
      </div>
    </div>
  );
};

export default BacklogCard;
