import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/shared/components/ui/pagination";

// Build the tokens to render: page numbers plus "ellipsis" gaps. Always keeps
// the first and last page, the current page, and `siblingCount` neighbours on
// each side visible; collapses the rest into ellipses.
const getPageTokens = (page, pageCount, siblingCount) => {
  // first + last + current + 2 ellipses + siblings on both sides
  const maxVisible = siblingCount * 2 + 5;
  if (pageCount <= maxVisible) {
    return Array.from({ length: pageCount }, (_, i) => i + 1);
  }

  const left = Math.max(page - siblingCount, 1);
  const right = Math.min(page + siblingCount, pageCount);
  const tokens = [1];

  if (left > 2) tokens.push("left-ellipsis");
  for (let i = left; i <= right; i++) {
    if (i !== 1 && i !== pageCount) tokens.push(i);
  }
  if (right < pageCount - 1) tokens.push("right-ellipsis");

  tokens.push(pageCount);
  return tokens;
};

/**
 * Controlled, presentational pagination. Knows nothing about TanStack Table or
 * React Query — feed it the current page and page count and it calls back with
 * the requested page. Shared by tables (via DataTablePagination) and non-table
 * views (grids/lists) so pagination looks and behaves the same everywhere.
 *
 * Pages are 1-indexed to match the API.
 *
 * @param {number}   page          Current page (1-indexed).
 * @param {number}   pageCount     Total number of pages.
 * @param {(page:number)=>void} onPageChange
 * @param {number}   [siblingCount=1]  Neighbour pages shown around the current.
 */
export function PaginationControls({
  page,
  pageCount,
  onPageChange,
  siblingCount = 1,
  className,
}) {
  if (!pageCount || pageCount <= 1) return null;

  const goTo = (next) => {
    const clamped = Math.min(Math.max(next, 1), pageCount);
    if (clamped !== page) onPageChange(clamped);
  };

  const tokens = getPageTokens(page, pageCount, siblingCount);

  return (
    <Pagination className={className}>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            onClick={() => goTo(page - 1)}
            disabled={page <= 1}
          />
        </PaginationItem>

        {tokens.map((token) =>
          typeof token === "string" ? (
            <PaginationItem key={token}>
              <PaginationEllipsis />
            </PaginationItem>
          ) : (
            <PaginationItem key={token}>
              <PaginationLink
                isActive={token === page}
                onClick={() => goTo(token)}
              >
                {token}
              </PaginationLink>
            </PaginationItem>
          ),
        )}

        <PaginationItem>
          <PaginationNext
            onClick={() => goTo(page + 1)}
            disabled={page >= pageCount}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
