import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { createFullName } from "@/shared/lib/helpers";
import {
  ARTIFACT_TYPE_OPTIONS,
  SELECT_ALL,
} from "./calendarConstants";

const CalendarFilters = ({
  filters,
  onChange,
  viewMode,
  onViewModeChange,
  statuses = [],
  developers = [],
}) => {
  const setField = (key, value) =>
    onChange((prev) => ({ ...prev, [key]: value }));

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Select
        value={filters.task_type || SELECT_ALL}
        onValueChange={(next) =>
          setField("task_type", next === SELECT_ALL ? "" : next)
        }
      >
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Select Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={SELECT_ALL}>All Types</SelectItem>
          {ARTIFACT_TYPE_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.developer || SELECT_ALL}
        onValueChange={(next) =>
          setField("developer", next === SELECT_ALL ? "" : next)
        }
      >
        <SelectTrigger className="w-44">
          <SelectValue placeholder="All Developers" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={SELECT_ALL}>All Developers</SelectItem>
          {developers.map((dev) => (
            <SelectItem key={dev.id} value={String(dev.id)}>
              {createFullName(dev) || dev.email || `#${dev.id}`}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.status || SELECT_ALL}
        onValueChange={(next) =>
          setField("status", next === SELECT_ALL ? "" : next)
        }
      >
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={SELECT_ALL}>All Status</SelectItem>
          {statuses.map((status) => (
            <SelectItem key={status.id} value={String(status.id)}>
              {status.status_name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={viewMode} onValueChange={onViewModeChange}>
        <SelectTrigger className="w-36">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="month">Month View</SelectItem>
          <SelectItem value="week">Week View</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default CalendarFilters;
