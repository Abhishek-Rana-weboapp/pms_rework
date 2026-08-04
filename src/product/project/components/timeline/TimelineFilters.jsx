import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import {
  ARTIFACT_TYPE_OPTIONS,
  SELECT_ALL,
  STATUS_OPTIONS,
  VIEW_OPTIONS,
} from "./timelineConstants";

const TimelineFilters = ({
  search,
  onSearchChange,
  typeFilter,
  onTypeChange,
  statusFilter,
  onStatusChange,
  view,
  onViewChange,
}) => (
  <div className="flex flex-col sm:flex-row sm:justify-between gap-4">
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
      <Input
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Search artifacts..."
        className="w-full sm:w-72"
      />

      <Select
        value={typeFilter || SELECT_ALL}
        onValueChange={(next) =>
          onTypeChange(next === SELECT_ALL ? "" : next)
        }
      >
        <SelectTrigger className="w-full sm:w-44">
          <SelectValue placeholder="All Artifacts" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={SELECT_ALL}>All Artifacts</SelectItem>
          {ARTIFACT_TYPE_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={statusFilter || SELECT_ALL}
        onValueChange={(next) =>
          onStatusChange(next === SELECT_ALL ? "" : next)
        }
      >
        <SelectTrigger className="w-full sm:w-40">
          <SelectValue placeholder="All Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={SELECT_ALL}>All Status</SelectItem>
          {STATUS_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>

    <div className="flex w-fit gap-1 rounded-lg bg-muted p-1">
      {VIEW_OPTIONS.map((option) => (
        <Button
          key={option}
          type="button"
          size="sm"
          variant={view === option ? "default" : "ghost"}
          className="capitalize"
          onClick={() => onViewChange(option)}
        >
          {option}
        </Button>
      ))}
    </div>
  </div>
);

export default TimelineFilters;
