import {
  ArrowLeftIcon,
  ArrowRightIcon,
  MoreHorizontal,
  PencilIcon,
  Trash,
} from "lucide-react";

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
import { isDefaultStatus } from "../config/statusSchema";

/**
 * Kanban column header for the board: a category colour swatch, title, count,
 * and a menu with Edit Status (disabled for default TO DO / IN PROGRESS / DONE
 * columns).
 */
const BoardColumnHeader = ({
  column,
  onEditStatus,
  onMoveLeft,
  onMoveRight,
  canMoveLeft,
  canMoveRight,
  onDeleteStatus,
}) => {
  const isDefault = isDefaultStatus(column.title);
  // A custom column takes the colour of its category, so the board reads as
  // three colour groups no matter how many statuses a project has.
  const colors = getStatusCategoryColors(column.category, column.title);

  return (
    <>
      <span
        aria-hidden="true"
        className={cn("size-2 shrink-0 rounded-full", colors.dot)}
      />
      <h3 className="min-w-0 flex-1 truncate text-sm font-semibold text-foreground">
        {column.title}
      </h3>
      <Badge className={colors.badge}>{column.cards?.length ?? 0}</Badge>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="size-7 shrink-0"
            aria-label={`Options for ${column.title}`}
          >
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-auto min-w-36">
          <DropdownMenuItem
            className="cursor-pointer"
            disabled={!canMoveLeft}
            onSelect={onMoveLeft}
          >
            <ArrowLeftIcon className="size-4" />
            Move Left
          </DropdownMenuItem>
          <DropdownMenuItem
            className="cursor-pointer"
            disabled={!canMoveRight}
            onSelect={onMoveRight}
          >
            <ArrowRightIcon className="size-4" />
            Move Right
          </DropdownMenuItem>
          <DropdownMenuItem
            className="cursor-pointer"
            disabled={isDefault}
            onSelect={() => {
              if (!isDefault) onEditStatus?.(column);
            }}
          >
            <PencilIcon className="size-4" />
            Edit Status
          </DropdownMenuItem>
          <DropdownMenuItem 
           variant="destructive"
            className="cursor-pointer"
            onSelect={onDeleteStatus}>
            <Trash className="size-4" />
              Delete Status
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

export default BoardColumnHeader;
