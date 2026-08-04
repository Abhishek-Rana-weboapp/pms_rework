import { TYPE_COLORS, TYPE_LABEL } from "./timelineConstants";

const STATUS_STYLES = {
  Todo: "bg-gray-200 text-gray-700",
  "To Do": "bg-gray-200 text-gray-700",
  "IN PROGRESS": "bg-pink-100 text-pink-700",
  "In Progress": "bg-pink-100 text-pink-700",
  Done: "bg-emerald-100 text-emerald-700",
  DONE: "bg-emerald-100 text-emerald-700",
  Active: "bg-sky-100 text-sky-700",
  Planned: "bg-gray-200 text-gray-600",
};

const ArtifactNameCell = ({ row }) => {
  const artifactType = row.artifactType || row.type;
  const isSprintsRoot = String(row.id) === "sprints-root";
  const color = isSprintsRoot
    ? TYPE_COLORS.SPRINT
    : TYPE_COLORS[artifactType] || "#34d399";
  const label = isSprintsRoot
    ? "SPR"
    : TYPE_LABEL[artifactType] || artifactType || "—";
  const status = row.status;
  const statusClass = STATUS_STYLES[status] || "bg-muted text-muted-foreground";

  return (
    <div className="flex min-w-0 items-center gap-2 overflow-hidden px-1">
      <span
        className="shrink-0 rounded px-1.5 py-0.5 text-[9px] font-bold text-white"
        style={{ background: color }}
      >
        {label}
      </span>

      <span
        className="truncate text-sm font-medium text-foreground"
        title={row.text}
      >
        {row.text}
      </span>

      {status ? (
        <span
          className={`ml-auto shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-medium ${statusClass}`}
        >
          {status}
        </span>
      ) : null}
    </div>
  );
};

export default ArtifactNameCell;
