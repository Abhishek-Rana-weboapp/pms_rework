import { useState } from "react";
import { Check, Edit } from "lucide-react";
import { useReportBuilder } from "../../context/ReportBuilderContext";

const GroupSection = ({ groups = [], title, type }) => {
  const { state, actions } = useReportBuilder();

  const [isEditing, setIsEditing] = useState(false);

  const selectedGroups =
    type === "columns"
      ? state.selections.columns
      : type === "rowGroups"
        ? state.selections.rowGroups
        : state.selections.columnGroups;

  const selectedSet = new Set(selectedGroups.map(String));

  const handleCheck = (event) => {
    const { value, checked } = event.target;

    if (type === "columns") {
      actions.toggleColumn(value, checked);
    }

    if (type === "rowGroups") {
      actions.toggleRowGroup(value, checked);
    }

    if (type === "columnGroups") {
      actions.toggleColumnGroup(value, checked);
    }
  };

  const labelByField = new Map(
    groups.map((group) => [String(group.field), group.label ?? group.field]),
  );

  // When not editing, show selected items. Prefer catalog labels; fall back to
  // the field name so selections still appear if the catalog hasn't loaded.
  const visualGroups = isEditing
    ? groups
    : selectedGroups.map((field) => ({
        field,
        label: labelByField.get(String(field)) ?? String(field).split("_").join(" "),
      }));

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between p-2">
        <span className="text-sm font-semibold">{title}</span>

        <button
          type="button"
          onClick={() => setIsEditing((current) => !current)}
          className="cursor-pointer text-blue-500"
        >
          <Edit className="size-4" />
        </button>
      </div>

      {visualGroups.length > 0 && (
        <div className="flex flex-col gap-2 rounded-md bg-gray-100 p-2 shadow">
          {visualGroups.map((group) => {
            const isChecked = selectedSet.has(String(group.field));

            return (
              <label
                key={group.field}
                className="flex items-center justify-between gap-2 text-sm"
              >
                {group.label}

                <span className="relative inline-flex size-4 shrink-0 items-center justify-center">
                  <input
                    type="checkbox"
                    value={group.field}
                    checked={isChecked}
                    disabled={!isEditing}
                    onChange={handleCheck}
                    className="peer absolute inset-0 z-10 cursor-pointer opacity-0 disabled:cursor-not-allowed"
                  />
                  <span
                    className={`
                      pointer-events-none flex size-4 items-center justify-center rounded border
                      ${
                        isChecked
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-gray-400 bg-white"
                      }
                      peer-disabled:opacity-50
                      ${isChecked && !isEditing ? "border-primary/40 bg-primary/40" : ""}
                    `}
                  >
                    {isChecked ? <Check className="size-3" strokeWidth={3} /> : null}
                  </span>
                </span>
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default GroupSection;
