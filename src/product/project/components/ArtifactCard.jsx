import { Calendar, Flag, User } from "lucide-react";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";
import { cn } from "@/shared/lib/utils";
import ArtifactStatusBadge from "./ArtifactStatusBadge";

// Flag tint by priority. Falls back to muted for unknown/empty priorities.
const PRIORITY_STYLES = {
  High: "text-red-500",
  Medium: "text-amber-500",
  Low: "text-green-600",
};

const formatDay = (value) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const formatRange = (start, target) => {
  const from = formatDay(start);
  const to = formatDay(target);
  if (from && to) return `${from} - ${to}`;
  return from || to || "—";
};

const Meta = ({ icon: Icon, className, children }) => (
  <span className={cn("flex items-center gap-1.5 text-sm text-muted-foreground", className)}>
    <Icon className="size-4 shrink-0" />
    {children}
  </span>
);

const ArtifactCard = ({ artifact, onClick }) => {
  const {
    id,
    title,
    projectName,
    developer,
    status,
    statusCategory,
    priority,
    startDate,
    targetDate,
  } = artifact;

  return (
    <div
      onClick={onClick ? () => onClick(artifact) : undefined}
      className={cn(
        "rounded-xl border border-border bg-white p-4 shadow-sm transition-shadow hover:shadow-md",
        onClick && "cursor-pointer",
      )}
    >
      {/* Header: title + project, id badge */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-medium text-foreground">{title}</p>
          <p className="truncate text-xs text-muted-foreground">{projectName}</p>
        </div>
        <span className="shrink-0 text-xs font-medium text-muted-foreground">
          #{id}
        </span>
      </div>

      {/* Meta row */}
      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2">
        <Meta icon={User}>
          {developer ? (
            <span className="flex items-center gap-1.5">
              <Avatar className="size-5">
                <AvatarImage src={developer.avatar} alt={developer.name} />
                <AvatarFallback className="text-[10px]">
                  {developer.initials}
                </AvatarFallback>
              </Avatar>
              {developer.name}
            </span>
          ) : (
            "Unassigned"
          )}
        </Meta>

        <Meta icon={Calendar}>{formatRange(startDate, targetDate)}</Meta>

        <Meta
          icon={Flag}
          className={PRIORITY_STYLES[priority] ?? "text-muted-foreground"}
        >
          {priority && priority !== "—" ? `${priority} Priority` : "No Priority"}
        </Meta>

        <ArtifactStatusBadge status={status} category={statusCategory} />
      </div>
    </div>
  );
};

export default ArtifactCard;
