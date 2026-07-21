import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar";
import { Button } from "../../ui/button";
import EmployeeStatusBadge from "@/product/dashboard/components/EmployeeStatusBadge";
import { DataTableColumnHeader } from "../DataTableColumnHeader";

// Columns for the Employee table view. Rows are the NORMALIZED employee shape
// (see normalizeEmployee), so cells read flat fields like `name` / `isActive`.
export const getEmployeeTableColumns = ({ onView } = {}) => [
  {
    id: "name",
    // Accessor value drives sorting; include email so a column sort stays sensible.
    accessorFn: (row) => `${row.name} ${row.email}`.trim(),
    meta: { label: "Employee Name" },
    size: 280,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Employee Name" />
    ),
    cell: ({ row }) => {
      const emp = row.original;
      return (
        <div className="flex items-center gap-3 py-1">
          <Avatar className="size-9">
            <AvatarImage src={emp.avatar} alt={emp.name} />
            <AvatarFallback>{emp.initials}</AvatarFallback>
          </Avatar>
          <span className="truncate font-medium text-foreground">
            {emp.name}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "email",
    meta: { label: "Email" },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Email" />
    ),
    cell: ({ getValue }) => (
      <span className="text-muted-foreground">{getValue() || "—"}</span>
    ),
  },
  {
    accessorKey: "phone",
    meta: { label: "Contact" },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Contact" />
    ),
    cell: ({ getValue }) => (
      <span className="text-muted-foreground tabular-nums">
        {getValue() || "—"}
      </span>
    ),
  },
  {
    id: "status",
    accessorFn: (row) => (row.isActive ? "Active" : "Inactive"),
    meta: { label: "Status" },
    size: 120,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => <EmployeeStatusBadge isActive={row.original.isActive} />,
  },
  {
    id: "actions",
    size: 120,
    header: () => null,
    cell: ({ row }) => (
      <div className="flex justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onView?.(row.original);
          }}
        >
          View Profile
        </Button>
      </div>
    ),
  },
];
