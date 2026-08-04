import { useMemo } from "react";
import { Gantt, Willow, Tooltip } from "@svar-ui/react-gantt";
import "@svar-ui/react-gantt/all.css";

import ArtifactNameCell from "./ArtifactNameCell";
import { TASK_TYPES, TYPE_COLORS } from "./timelineConstants";
import { buildScales, formatDateLabel } from "./timelineTransformers";
import "./timeline.css";

const TaskTooltip = ({ data }) => {
  const task = data?.task;
  if (!task) return null;

  return (
    <div className="max-w-xs p-2 text-xs">
      <div className="mb-1 font-semibold">{task.text}</div>
      <div className="mb-0.5 text-muted-foreground">
        {formatDateLabel(task.start)} → {formatDateLabel(task.end)}
      </div>
      {task.status ? <div>Status: {task.status}</div> : null}
      {task.storyPoints != null ? (
        <div>Points: {task.storyPoints}</div>
      ) : null}
    </div>
  );
};

const TaskBarContent = ({ data }) => {
  if (!data || data.type === "milestone") return null;
  const points = data.storyPoints;
  const color = TYPE_COLORS[data.artifactType || data.type];

  return (
    <>
      {points != null && points !== "" ? (
        <span
          className="wx-text-out"
          style={{
            left: 4,
            top: 2,
            padding: "0 4px",
            borderRadius: 4,
            fontSize: 10,
            fontWeight: 700,
            background: "rgba(0,0,0,0.2)",
            color: "#fff",
          }}
        >
          {points} pts
        </span>
      ) : null}
      <div
        className="wx-text-out"
        style={{
          left: points != null ? 52 : 8,
          color: color ? "#fff" : undefined,
        }}
      >
        {data.text}
      </div>
    </>
  );
};

const TimelineGantt = ({ tasks, view, range }) => {
  const scales = useMemo(() => buildScales(view), [view]);

  const columns = useMemo(
    () => [
      {
        id: "text",
        header: "Artifacts",
        width: 320,
        resize: true,
        sort: false,
        cell: ArtifactNameCell,
      },
    ],
    [],
  );

  return (
    <div className="timeline-gantt h-full min-h-0 w-full overflow-hidden rounded-md border border-border">
      <Willow fonts={false}>
        <Tooltip content={TaskTooltip}>
          <Gantt
            tasks={tasks}
            links={[]}
            scales={scales}
            columns={columns}
            taskTypes={TASK_TYPES}
            taskTemplate={TaskBarContent}
            readonly
            autoScale
            cellHeight={44}
            cellWidth={view === "monthly" ? 36 : view === "weekly" ? 48 : 72}
            {...(range?.start ? { start: range.start } : {})}
            {...(range?.end ? { end: range.end } : {})}
          />
        </Tooltip>
      </Willow>
    </div>
  );
};

export default TimelineGantt;
