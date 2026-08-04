import { Check } from "lucide-react";
import { Input } from "@/shared/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { useReportBuilder } from "../../context/ReportBuilderContext";

function formatOperator(operator) {
  return operator
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

const FilterSection = ({ filters = [] }) => {
  const { state, actions } = useReportBuilder();
  const selectedFilters = state.selections.filters;

  const handleCheckbox = (event) => {
    const { value, checked } = event.target;
    actions.toggleFilter(value, checked);
  };

  if (!filters.length) {
    return (
      <p className="text-sm text-muted-foreground">
        No filters available for the selected modules.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {filters.map((filter) => {
        const selectedFilter = selectedFilters.find(
          (selected) => selected.field === filter.field,
        );
        const isSelected = Boolean(selectedFilter);

        return (
          <div key={filter.field} className="flex flex-col gap-2">
            <label
              htmlFor={`filter-${filter.field}`}
              className="flex cursor-pointer select-none items-center gap-2 text-sm font-medium"
            >
              <span className="relative inline-flex size-4 shrink-0 items-center justify-center">
                <input
                  type="checkbox"
                  id={`filter-${filter.field}`}
                  value={filter.field}
                  checked={isSelected}
                  onChange={handleCheckbox}
                  className="absolute inset-0 z-10 cursor-pointer opacity-0"
                />
                <span
                  className={`pointer-events-none flex size-4 items-center justify-center rounded border ${
                    isSelected
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-gray-400 bg-white"
                  }`}
                >
                  {isSelected ? (
                    <Check className="size-3" strokeWidth={3} />
                  ) : null}
                </span>
              </span>
              {filter.label}
            </label>

            <Select
              value={selectedFilter?.operator || undefined}
              onValueChange={(operator) =>
                actions.setFilterOperator(filter.field, operator)
              }
              disabled={!isSelected}
            >
              <SelectTrigger className="w-full bg-muted/40 text-sm">
                <SelectValue placeholder="Select..." />
              </SelectTrigger>
              <SelectContent>
                {(filter.operators ?? []).map((operator) => (
                  <SelectItem key={operator} value={operator}>
                    {formatOperator(operator)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              type="text"
              placeholder="Enter Value"
              disabled={!isSelected}
              value={selectedFilter?.value ?? ""}
              onChange={(event) =>
                actions.setFilterValue(filter.field, event.target.value)
              }
              className="text-sm"
            />
          </div>
        );
      })}
    </div>
  );
};

export default FilterSection;
