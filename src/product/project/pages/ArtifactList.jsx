import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Plus, Search } from "lucide-react";

import SectionWrapper from "@/shared/components/wrappers/SectionWrapper";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import ViewToggle from "@/shared/components/ViewToggle";
import { cn } from "@/shared/lib/utils";
import DataTable from "@/shared/components/data-table/DataTable";
import { ColumnVisibilityMenu } from "@/shared/components/data-table/ColumnVisibilityMenu";
import { PaginationControls } from "@/shared/components/PaginationControls";
import { PageSizeSelect } from "@/shared/components/PageSizeSelect";

import { usePriorities } from "@/product/settings/api/settingsQueries";
import { useArtifacts } from "../api/project/projectQueries";
import { getArtifactConfig } from "../config/artifacts/artifactConfig";
import {
  buildPriorityColorMap,
  normalizeArtifact,
} from "../config/artifacts/artifact.utils";
import ArtifactCard from "../components/ArtifactCard";
import { useLocalStorage } from "@/shared/hooks/useLocalStorage";
import { useArtifactFormDialog } from "../context/ArtifactFormDialogStore";
import PermissionGate from "@/product/auth/components/PermissionGate";

const ArtifactList = () => {
  const navigate = useNavigate();
  const { artifactType } = useParams();
  const { openAdd } = useArtifactFormDialog();

  // Everything type-specific (columns, labels, empty copy, permission) comes
  // from the config registry; the page itself is type-agnostic.
  const config = useMemo(() => getArtifactConfig(artifactType), [artifactType]);
  const columns = useMemo(() => config.columns(), [config]);

  const [view, setView] = useLocalStorage(`${artifactType}-view`, "table"); // "table" | "grid"
  // Persisted per artifact type; the hook re-reads when the key (type) changes.
  const [columnVisibility, setColumnVisibility] = useLocalStorage(
    `${artifactType}-columns`,
    {},
  );
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [prevType, setPrevType] = useState(artifactType);
  if (prevType !== artifactType) {
    setPrevType(artifactType);
    setSearchInput("");
    setSearch("");
    setPage(1);
  }

  // Debounce the search box, resetting to page 1 on a new term.
  useEffect(() => {
    if (searchInput === search) return;
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const { data, isLoading, isError, isFetching } = useArtifacts({
    type: artifactType?.toUpperCase(),
    page,
    page_size: pageSize,
    searchData: search,
  });

  const { data: priorities } = usePriorities();
  const priorityColorMap = buildPriorityColorMap(priorities);

  const rows = useMemo(
    () =>
      (data?.results ?? []).map((artifact) =>
        normalizeArtifact(artifact, { priorityColorMap }),
      ),
    [data, priorityColorMap],
  );
  const pagination = data?.pagination;
  const pageCount = pagination?.total_pages ?? 1;
  const totalRecords = pagination?.total_records ?? 0;

  const handlePageSizeChange = (size) => {
    setPageSize(size);
    setPage(1);
  };

  const handleDetailsNavigation = (artifact) => {
    navigate(`${artifact.id}`);
  };

  console.log(config);


  return (
    <SectionWrapper className="space-y-3 ">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-semibold">{config.label}</h1>
        </div>
        <div
          className={`flex flex-wrap items-center gap-3 `}
        >
          <div className="relative w-full max-w-xs flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by title..."
              className="pl-8"
            />
          </div>

          {/* Column visibility (table view only) + view toggle */}
          <div className="ml-auto flex items-center gap-2">
            {view === "table" && (
              <ColumnVisibilityMenu
                columns={columns}
                columnVisibility={columnVisibility}
                onColumnVisibilityChange={setColumnVisibility}
              />
            )}
            <ViewToggle value={view} onValueChange={setView} />
          </div>
          <PermissionGate permission={config.addPermission}>
            <Button onClick={() => openAdd(artifactType)}>
              <Plus />
              {config.addLabel}
            </Button>
          </PermissionGate>
        </div>
      </div>

      {/* Toolbar */}

      {/* Content */}
      {isError ? (
        <div className="py-16 text-center text-sm text-muted-foreground">
          Couldn't load {config.label.toLowerCase()} items. Please try again.
        </div>
      ) : !isLoading && rows.length === 0 ? (
        <div className="py-16 text-center text-sm text-muted-foreground">
          {config.emptyMessage}
        </div>
      ) : (
        <div
          className={cn(
            "transition-opacity",
            isFetching && !isLoading && "pointer-events-none opacity-60",
          )}
        >
          {view === "grid" ? (
            <div className="grid grid-cols-1 gap-3">
              {(isLoading || isFetching)
                ? Array.from({ length: pageSize }).map((_, i) => (
                    <div
                      key={i}
                      className="h-24 animate-pulse rounded-xl border border-border bg-white"
                    />
                  ))
                : rows.map((artifact) => (
                    <ArtifactCard key={artifact.id} artifact={artifact} onClick={handleDetailsNavigation} />
                  ))}
            </div>
          ) : (
            <DataTable
              columns={columns}
              onRowClick={(row) => handleDetailsNavigation(row)}
              data={rows}
              isLoading={isLoading}
              pageSize={pageSize}
              enableSearch={false}
              enablePagination={false}
              enableViewOptions={false}
              columnVisibility={columnVisibility}
              onColumnVisibilityChange={setColumnVisibility}
              emptyMessage={config.emptyMessage}
            />
          )}
        </div>
      )}

      {/* Pagination footer */}
      {!isLoading && !isError && totalRecords > 0 && (
        <div className="flex flex-col-reverse items-center gap-4 sm:flex-row sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {(page - 1) * pageSize + 1} to{" "}
            {(page - 1) * pageSize + rows.length} of {totalRecords} results
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
    </SectionWrapper>
  );
};

export default ArtifactList;
