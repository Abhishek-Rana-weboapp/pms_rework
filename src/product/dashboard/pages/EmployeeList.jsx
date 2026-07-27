import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";

import Wrapper from "@/shared/components/wrappers/Wrapper";
import SectionWrapper from "@/shared/components/wrappers/SectionWrapper";
import { Input } from "@/shared/components/ui/input";
import { Spinner } from "@/shared/components/ui/spinner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import ViewToggle from "@/shared/components/ViewToggle";
import { cn } from "@/shared/lib/utils";
import DataTable from "@/shared/components/data-table/DataTable";
import { getEmployeeTableColumns } from "@/shared/components/data-table/columns/EmployeeColumns";
import { PaginationControls } from "@/shared/components/PaginationControls";
import { PageSizeSelect } from "@/shared/components/PageSizeSelect";
import { useEmployees } from "../api/queries";
import { normalizeEmployee } from "../config/employee.utils";
import { EMPLOYEE_STATUS_OPTIONS } from "../config/employeeData";
import EmployeeCard from "../components/EmployeeCard";


const EmployeeList = () => {
  const navigate = useNavigate();

  const [view, setView] = useState("grid"); // "grid" | "table"
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Debounce the search box, resetting to page 1 on a new term.
  useEffect(() => {
    if (searchInput === search) return;
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  const { data, isLoading, isError, isFetching } = useEmployees({
    page,
    pageSize,
    searchData: search,
    status: status === "all" ? undefined : status,
  });

  const employees = useMemo(
    () => (data?.results ?? []).map(normalizeEmployee),
    [data],
  );
  const pagination = data?.pagination;
  const pageCount = pagination?.total_pages ?? 1;
  const totalRecords = pagination?.total_records ?? 0;

  const onView = (emp) => navigate(String(emp.id));

  const columns = useMemo(
    () => getEmployeeTableColumns({ onView: (emp) => navigate(String(emp.id)) }),
    [navigate],
  );

  const handleStatusChange = (value) => {
    setStatus(value);
    setPage(1);
  };
  const handlePageSizeChange = (size) => {
    setPageSize(size);
    setPage(1);
  };

  const isEmpty = !isLoading && !isError && employees.length === 0;

  return (
    <div className="space-y-5 md:p-4 p-2">
      {/* Header */}
      <SectionWrapper>
        <h1 className="text-lg font-semibold">Employees</h1>
        <p className="text-sm text-muted-foreground">
          View and manage your organization's employees.
        </p>
        <div className="flex flex-wrap items-center gap-3 mt-4">
          <div className="relative w-full max-w-xs flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search employees..."
            className="pl-8"
          />
        </div>

        <Select value={status} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent position="popper">
            {EMPLOYEE_STATUS_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* View toggle */}
        <ViewToggle value={view} onValueChange={setView} className="ml-auto" />
        </div>
      </SectionWrapper>

      {/* Content */}
      {(isLoading && view === "grid")? (
        <SectionWrapper className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
          <Spinner /> Loading employees...
        </SectionWrapper>
      ) : isError ? (
        <SectionWrapper className="py-16 text-center text-sm text-muted-foreground">
          Couldn't load employees. Please try again.
        </SectionWrapper>
      ) : isEmpty ? (
        <SectionWrapper className="py-16 text-center text-sm text-muted-foreground">
          No employees found.
        </SectionWrapper>
      ) : (
        <div
          className={cn(
            "transition-opacity",
            isFetching && "pointer-events-none opacity-60",
          )}
        >
          {view === "grid" ? (
            <div className="grid grid-cols-1 gap-4 ">
              {employees.map((employee) => (
                <EmployeeCard
                  key={employee.id}
                  employee={employee}
                  onView={onView}
                />
              ))}
            </div>
          ) : (
            <SectionWrapper>
              <DataTable
                isLoading={isLoading}
                columns={columns}
                data={employees}
                onRowClick={onView}
                enableSearch={false}
                enablePagination={false}
                enableViewOptions={false}
              />
            </SectionWrapper>
          )}
        </div>
      )}

      {/* Shared pagination footer (both views) */}
      {!isLoading && !isError && totalRecords > 0 && (
        <div className="flex flex-col-reverse items-center gap-4 sm:flex-row sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {(page - 1) * pageSize + 1} to{" "}
            {(page - 1) * pageSize + employees.length} of {totalRecords} results
          </p>
          <div className="flex flex-col-reverse items-center gap-4 sm:flex-row sm:gap-6">
            <PageSizeSelect
              pageSize={pageSize}
              onPageSizeChange={handlePageSizeChange}
            />
            <PaginationControls
              page={page}
              pageCount={pageCount}
              onPageChange={setPage}
              className="mx-0 w-auto"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeList;
