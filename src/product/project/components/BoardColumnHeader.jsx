import { MoreHorizontal, PencilIcon } from "lucide-react";

import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { isDefaultStatus } from "../config/statusSchema";

/**
 * Kanban column header for the board: title, count, and a menu with Edit Status
 * (disabled for default TO DO / IN PROGRESS / DONE columns).
 */
const BoardColumnHeader = ({ column, onEditStatus }) => {
  const isDefault = isDefaultStatus(column.title);

  return (
    <>
      <h3 className="min-w-0 flex-1 truncate text-sm font-semibold text-foreground">
        {column.title}
      </h3>
      <Badge variant="secondary">{column.cards?.length ?? 0}</Badge>
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
            disabled={isDefault}
            onSelect={() => {
              if (!isDefault) onEditStatus?.(column);
            }}
          >
            <PencilIcon className="size-4" />
            Edit Status
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

export default BoardColumnHeader;
