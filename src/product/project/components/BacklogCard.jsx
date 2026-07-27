import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";
import { Badge } from "@/shared/components/ui/badge";

const formatTaskType = (type) =>
  type
    ? type
        .replace(/_/g, " ")
        .toLowerCase()
        .replace(/\b\w/g, (c) => c.toUpperCase())
    : null;

const BacklogCard = ({ card }) => {
  const { title, developer, storyPoint, raw } = card;
  const taskType = formatTaskType(raw?.task_type);

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

      {developer && (
        <Avatar className="size-7 shrink-0">
          <AvatarImage src={developer.avatar} alt={developer.name} />
          <AvatarFallback className="text-[9px]">
            {developer.initials}
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
};

export default BacklogCard;
