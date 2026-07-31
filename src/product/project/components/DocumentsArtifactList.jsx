import { Paperclip, Search } from "lucide-react";
import { useState } from "react";

import { PaginationControls } from "@/shared/components/PaginationControls";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";
import { Input } from "@/shared/components/ui/input";
import { useDebouncedValue } from "@/shared/hooks/useDebouncedValue";
import {
  createFullName,
  createInitials,
  formatUpdateString,
} from "@/shared/lib/helpers";
import { cn } from "@/shared/lib/utils";
import { useArtifacts } from "../api/project/projectQueries";
import { getArtifactConfig } from "../config/artifacts/artifactConfig";

const PAGE_SIZE = 10;

// Search and page live here rather than in the parent so typing only re-renders
// this pane — the attachment preview next to it is driven by the selected id.
const DocumentsArtifactList = ({ type, selectedArtifactId, onSelect }) => {
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);
  const search = useDebouncedValue(searchInput, 400);

  // A new term means a different result set, so the page number it was paired
  // with is meaningless — reset while rendering instead of in an effect, which
  // would fetch page N of the new search first and then page 1.
  const [prevSearch, setPrevSearch] = useState(search);
  if (prevSearch !== search) {
    setPrevSearch(search);
    setPage(1);
  }

  const { data, isLoading, isError, isFetching } = useArtifacts({
    type: type?.toUpperCase(),
    page,
    page_size: PAGE_SIZE,
    searchData: search,
  });

  const config = getArtifactConfig(type);
  const artifacts = data?.results ?? [];
  const pageCount = data?.pagination?.total_pages ?? 1;
  const totalRecords = data?.pagination?.total_records ?? 0;

  return (
    <div className="flex h-full min-h-0 flex-col gap-3">
      <div className="shrink-0 space-y-3">
        <div className="flex items-baseline justify-between gap-2">
          <h4 className="font-semibold">{config.label}</h4>
          {totalRecords > 0 && (
            <span className="text-xs text-muted-foreground">
              {totalRecords} total
            </span>
          )}
        </div>

        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Search documents..."
            className="pl-8"
          />
        </div>
      </div>

      <div
        className={cn(
          "min-h-0 flex-1 space-y-3 overflow-y-auto transition-opacity",
          isFetching && !isLoading && "pointer-events-none opacity-60",
        )}
      >
        {isLoading ? (
          Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-24 animate-pulse rounded-xl border border-border bg-muted/40"
            />
          ))
        ) : isError ? (
          <p className="rounded-md bg-muted/40 p-3 text-sm text-muted-foreground">
            Couldn't load {config.label.toLowerCase()} items. Please try again.
          </p>
        ) : artifacts.length === 0 ? (
          <p className="rounded-md bg-muted/40 p-3 text-sm text-muted-foreground">
            {search ? `No results for "${search}".` : config.emptyMessage}
          </p>
        ) : (
          artifacts.map((artifact) => (
            <ArtifactListItem
              key={artifact.id}
              artifact={artifact}
              isSelected={String(artifact.id) === String(selectedArtifactId)}
              onSelect={onSelect}
            />
          ))
        )}
      </div>

      <PaginationControls
        page={page}
        pageCount={pageCount}
        onPageChange={setPage}
        siblingCount={0}
        showWhenSinglePage
        className="mx-0 w-auto shrink-0 justify-start"
      />
    </div>
  );
};

export default DocumentsArtifactList;

const ArtifactListItem = ({ artifact, isSelected, onSelect }) => {
  const developer = artifact.developer;
  const attachmentCount = artifact.attachments_details?.length ?? 0;
  const updatedText = formatUpdateString(
    artifact.modified_at || artifact.created_at,
  );

  return (
    <button
      type="button"
      onClick={() => onSelect(artifact.id)}
      aria-current={isSelected}
      className={cn(
        "w-full cursor-pointer rounded-xl bg-white p-4 text-left shadow-sm transition-shadow hover:shadow-md",
        isSelected
          ? "border-l-4 border-primary"
          : "border border-border",
      )}
    >
      <p className="line-clamp-2 font-medium text-foreground">
        {artifact.title || "—"}
      </p>
      {updatedText && (
        <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
          {updatedText}
        </p>
      )}

      <div className="mt-2.5 flex items-center justify-between gap-2">
        <span className="flex min-w-0 items-center gap-2">
          <Avatar className="size-5 shrink-0">
            <AvatarImage
              src={developer?.user_image}
              alt={createFullName(developer)}
            />
            <AvatarFallback className="text-[10px]">
              {createInitials(developer) || "?"}
            </AvatarFallback>
          </Avatar>
          <span className="truncate text-xs text-muted-foreground">
            {createFullName(developer) || "Unassigned"}
          </span>
        </span>

        <span className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
          <Paperclip className="size-3" />
          {attachmentCount}
        </span>
      </div>
    </button>
  );
};
