import { useState } from "react";
import { Edit } from "lucide-react";
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

  const visualGroups = isEditing
    ? groups
    : groups.filter((group) =>
        selectedGroups.includes(group.field),
      );

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between p-2">
        <span className="text-sm font-semibold">
          {title}
        </span>

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
            const isChecked = selectedGroups.includes(
              group.field,
            );

            return (
              <label
                key={group.field}
                className="flex items-center justify-between text-sm"
              >
                {group.label}

                <input
                  type="checkbox"
                  value={group.field}
                  checked={isChecked}
                  disabled={!isEditing}
                  onChange={handleCheck}
                  className="
                    relative
                    h-4
                    w-4
                    cursor-pointer
                    appearance-none
                    rounded
                    border
                    border-gray-400
                    bg-white

                    checked:border-blue-600
                    checked:bg-blue-600

                    checked:after:absolute
                    checked:after:inset-0
                    checked:after:flex
                    checked:after:items-center
                    checked:after:justify-center
                    checked:after:text-xs
                    checked:after:text-white

                    disabled:cursor-not-allowed
                    disabled:opacity-50
                    disabled:checked:border-blue-200
                    disabled:checked:bg-blue-200
                  "
                />
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default GroupSection;