import { cn } from "@/shared/lib/utils";

// Small pill for an employee's active/inactive state, derived from `is_active`.
const EmployeeStatusBadge = ({ isActive, className }) => (
  <span
    className={cn(
      "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
      isActive
        ? "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300"
        : "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300",
      className,
    )}
  >
    <span
      className={cn(
        "size-1.5 rounded-full",
        isActive ? "bg-green-500" : "bg-red-500",
      )}
    />
    {isActive ? "Active" : "Inactive"}
  </span>
);

export default EmployeeStatusBadge;
