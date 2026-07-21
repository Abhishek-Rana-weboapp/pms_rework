import { Skeleton } from "@/shared/components/ui/skeleton";

/**
 * Generic page-loading skeleton used as the Suspense fallback while a lazily
 * code-split page chunk is downloading. It roughly mirrors the "toolbar + list"
 * shape most pages share, so the swap to real content reads as intentional
 * loading rather than a flash. Paired with sidebar hover-prefetch, this only
 * shows on genuinely cold navigations.
 */
const PageFallback = () => {
  return (
    <div className="h-full w-full space-y-4 p-4" aria-busy="true">
      {/* Title + primary action row. The default Skeleton fill (bg-muted) is
          ~oklch(0.97) — nearly invisible on a white row — so use a stronger gray. */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-7 w-48 bg-gray-200" />
        <Skeleton className="h-9 w-32 bg-gray-200" />
      </div>

      {/* Content block (table / cards) */}
      <div className="space-y-3 rounded-md border border-gray-200 bg-white p-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full bg-gray-200" />
        ))}
      </div>
    </div>
  );
};

export default PageFallback;
