import { useState } from "react";
import { ListFilter, RotateCcw } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { DatePicker } from "@/shared/components/ui/date-picker";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import SectionWrapper from "@/shared/components/wrappers/SectionWrapper";
import { createFullName } from "@/shared/lib/helpers";
import { cn } from "@/shared/lib/utils";
import { SELECT_ALL } from "./reportConstants";
import { fromApiDate, toApiDate } from "./reportTransformers";

const TASK_TYPES = [
  { value: "TASK", label: "Task" },
  { value: "BUG", label: "Bug" },
  { value: "STORY", label: "Story" },
  { value: "SPIKE", label: "Spike" },
  { value: "TEST", label: "Test" },
];

const STATUSES = [
  { value: "To Do", label: "To Do" },
  { value: "In Progress", label: "In Progress" },
  { value: "Done", label: "Done" },
];

const countActiveFilters = (filters) =>
  Object.values(filters ?? {}).filter((v) => v !== "" && v != null).length;

const FilterSelect = ({
  label,
  value,
  onChange,
  placeholder,
  options,
  stacked = false,
  className = "w-44",
}) => (
  <div
    className={cn(
      stacked ? "flex flex-col gap-1.5" : "flex items-center gap-2",
    )}
  >
    {label && (
      <span
        className={cn(
          "shrink-0 text-sm text-muted-foreground",
          stacked && "font-medium text-foreground",
        )}
      >
        {label}
      </span>
    )}
    <Select
      value={value || SELECT_ALL}
      onValueChange={(next) => onChange(next === SELECT_ALL ? "" : next)}
    >
      <SelectTrigger className={cn(stacked && "w-full", className)}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={SELECT_ALL}>{placeholder}</SelectItem>
        {options.map((opt) => (
          <SelectItem key={opt.value} value={String(opt.value)}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
);

const FilterFields = ({
  filters,
  patch,
  sprints,
  members,
  stacked = false,
}) => {
  const startDate = fromApiDate(filters.start_date);
  const endDate = fromApiDate(filters.end_date);

  return (
    <>
      <div
        className={cn(
          stacked
            ? "flex flex-col gap-1.5"
            : "flex min-w-64 flex-1 flex-wrap items-center gap-2",
        )}
      >
        <span
          className={cn(
            "shrink-0 text-sm text-muted-foreground",
            stacked && "font-medium text-foreground",
          )}
        >
          Date Range
        </span>
        <div className={cn("flex items-center gap-2", stacked && "w-full")}>
          <DatePicker
            value={startDate}
            onChange={(date) =>
              patch({ start_date: toApiDate(date), end_date: "" })
            }
            placeholder="From"
            calendarProps={{ disabled: { after: new Date() } }}
            className={stacked ? "flex-1" : "w-40"}
          />
          <span className="text-sm text-muted-foreground">–</span>
          <DatePicker
            value={endDate}
            onChange={(date) => patch({ end_date: toApiDate(date) })}
            placeholder="To"
            calendarProps={{
              disabled: {
                after: new Date(),
                ...(startDate ? { before: startDate } : {}),
              },
            }}
            className={stacked ? "flex-1" : "w-40"}
          />
        </div>
      </div>

      <FilterSelect
        label="Sprint"
        value={filters.sprint}
        onChange={(sprint) => patch({ sprint })}
        placeholder="All Sprints"
        options={sprints.map((s) => ({
          value: s.id,
          label: s.sprint_name,
        }))}
        stacked={stacked}
        className={stacked ? "w-full" : "w-44"}
      />

      <FilterSelect
        label="Assignee"
        value={filters.developer}
        onChange={(developer) => patch({ developer })}
        placeholder="All Members"
        options={members.map((m) => ({
          value: m.id,
          label: createFullName(m),
        }))}
        stacked={stacked}
        className={stacked ? "w-full" : "w-44"}
      />

      <FilterSelect
        label={stacked ? "Type" : undefined}
        value={filters.task_type}
        onChange={(task_type) => patch({ task_type })}
        placeholder="All Types"
        options={TASK_TYPES}
        stacked={stacked}
        className={stacked ? "w-full" : "w-36"}
      />

      <FilterSelect
        label={stacked ? "Status" : undefined}
        value={filters.status}
        onChange={(status) => patch({ status })}
        placeholder="All Statuses"
        options={STATUSES}
        stacked={stacked}
        className={stacked ? "w-full" : "w-36"}
      />
    </>
  );
};

const ReportFilters = ({
  filters,
  onChange,
  onReset,
  sprints = [],
  members = [],
}) => {
  const [open, setOpen] = useState(false);
  const activeCount = countActiveFilters(filters);
  const patch = (partial) => onChange({ ...filters, ...partial });

  const reset = () => {
    onReset();
    setOpen(false);
  };

  return (
    <>
      {/* Desktop / tablet: inline filters */}
      <SectionWrapper className="hidden flex-wrap items-end gap-3 md:flex">
        <FilterFields
          filters={filters}
          patch={patch}
          sprints={sprints}
          members={members}
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="ml-auto"
          onClick={onReset}
        >
          <RotateCcw />
          Reset Filters
        </Button>
      </SectionWrapper>

      {/* Mobile: compact trigger + dialog */}
      <SectionWrapper className="flex items-center justify-between gap-2 md:hidden">
        <div className="min-w-0">
          <p className="text-sm font-medium">Filters</p>
          <p className="text-xs text-muted-foreground">
            {activeCount > 0
              ? `${activeCount} active filter${activeCount === 1 ? "" : "s"}`
              : "No filters applied"}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {activeCount > 0 && (
            <Button type="button" variant="ghost" size="sm" onClick={onReset}>
              <RotateCcw />
              Reset
            </Button>
          )}

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button type="button" variant="outline" size="sm">
                <ListFilter />
                Filters
                {activeCount > 0 && (
                  <span className="ml-0.5 rounded-full bg-primary px-1.5 text-[10px] font-semibold text-primary-foreground">
                    {activeCount}
                  </span>
                )}
              </Button>
            </DialogTrigger>

            <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Report filters</DialogTitle>
                <DialogDescription>
                  Narrow the report by date, sprint, assignee, type, or status.
                </DialogDescription>
              </DialogHeader>

              <div className="flex flex-col gap-4 py-2">
                <FilterFields
                  filters={filters}
                  patch={patch}
                  sprints={sprints}
                  members={members}
                  stacked
                />
              </div>

              <DialogFooter className="gap-2 sm:justify-between">
                <Button type="button" variant="ghost" onClick={reset}>
                  <RotateCcw />
                  Reset
                </Button>
                <Button type="button" onClick={() => setOpen(false)}>
                  Done
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </SectionWrapper>
    </>
  );
};

export default ReportFilters;
