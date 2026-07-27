import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { useReportBuilder } from "../../context/ReportBuilderContext";


const FilterSection = ({ filters = [] }) => {
  const { state, actions } = useReportBuilder();

  const selectedFilters = state.selections.filters;

  const handleCheckbox = (event) => {
    const { value, checked } = event.target;

    actions.toggleFilter(value, checked);
  };

  const handleOperatorChange = (field, operator) => {
    actions.setFilterOperator(field, operator);
  };

  const handleValueChange = (field, value) => {
    actions.setFilterValue(field, value);
  };

  return (
    <div className="flex flex-col gap-5">
      {filters.map((filter) => {
        const selectedFilter = selectedFilters.find(
          (selected) =>
            selected.field === filter.field,
        );

        const isSelected = Boolean(selectedFilter);

        return (
          <div
            key={filter.field}
            className="flex items-start gap-2"
          >
            {/* Checkbox */}
            <input
              type="checkbox"
              id={filter.field}
              value={filter.field}
              checked={isSelected}
              onChange={handleCheckbox}
              className="
                relative
                mt-1
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
              "
            />

            <div className="flex w-full flex-col gap-2">
              {/* Filter Label */}
              <label
                htmlFor={filter.field}
                className="cursor-pointer select-none text-sm"
              >
                {filter.label}
              </label>

              {/* Operator */}
              <Select
                value={selectedFilter?.operator ?? ""}
                onValueChange={(operator) =>
                  handleOperatorChange(
                    filter.field,
                    operator,
                  )
                }
                disabled={!isSelected}
              >
                <SelectTrigger className="w-full text-sm">
                  <SelectValue placeholder="Select operator" />
                </SelectTrigger>

                <SelectContent>
                  {filter.operators.map((operator) => (
                    <SelectItem
                      key={operator}
                      value={operator}
                    >
                      {operator
                        .split("_")
                        .join(" ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Value */}
              <input
                type="text"
                placeholder="Enter Value"
                disabled={!isSelected}
                value={selectedFilter?.value ?? ""}
                onChange={(event) =>
                  handleValueChange(
                    filter.field,
                    event.target.value,
                  )
                }
                className="rounded-md border border-neutral-300 p-1.5"
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default FilterSection;