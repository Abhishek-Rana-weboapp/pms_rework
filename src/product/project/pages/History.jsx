import { format } from "date-fns";
import { useEffect, useRef } from "react";

import { Badge } from "@/shared/components/ui/badge";
import { Spinner } from "@/shared/components/ui/spinner";
import SectionWrapper from "@/shared/components/wrappers/SectionWrapper";
import { cn } from "@/shared/lib/utils";
import { useArtifactHistory } from "../api/project/projectQueries";
import { humanize } from "../config/artifacts/artifactConfig";

// Soft type chips — same idea as status category badges, keyed by the
// uppercase `artifact_type` the history API returns.
const TYPE_BADGE_COLORS = {
  EPIC: "bg-violet-100 text-violet-800",
  USER_STORY: "bg-sky-100 text-sky-800",
  TASK: "bg-emerald-100 text-emerald-800",
  ISSUE: "bg-rose-100 text-rose-800",
  SPIKE: "bg-amber-100 text-amber-800",
  TEST: "bg-indigo-100 text-indigo-800",
};

const formatHistoryDate = (date) => {
  if (!date) return "";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "";
  return format(parsed, "dd MMM yyyy, hh:mm a");
};

const History = () => {
  const sentinelRef = useRef(null);

  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useArtifactHistory();

  const history =
    data?.pages.flatMap((page) => page?.results ?? []) ?? [];

  // Infinite scroll: load the next page when the sentinel enters the viewport.
  // IntersectionObserver is an external system, so this lives in an effect.
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { rootMargin: "120px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <div className="flex h-full min-h-0 flex-col gap-2 overflow-hidden max-sm:gap-2 sm:gap-4">
      <SectionWrapper className="max-sm:p-2 shrink-0">
        <h3 className="font-semibold">History</h3>
      </SectionWrapper>

      <SectionWrapper className="min-h-0 flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
            <Spinner /> Loading history…
          </div>
        ) : isError ? (
          <p className="py-16 text-center text-sm text-muted-foreground">
            Couldn't load history. Please try again.
          </p>
        ) : history.length === 0 ? (
          <p className="py-16 text-center text-sm text-muted-foreground">
            No history available.
          </p>
        ) : (
          <>
            <div className="space-y-0">
              {history.map((item, index) => (
                <HistoryItem
                  key={item.id ?? `${item.created_at}-${index}`}
                  item={item}
                  isLast={index === history.length - 1}
                />
              ))}
            </div>

            <div ref={sentinelRef} className="h-1" aria-hidden />

            {isFetchingNextPage && (
              <div className="flex items-center justify-center gap-2 py-4 text-sm text-muted-foreground">
                <Spinner /> Loading more…
              </div>
            )}

            {!hasNextPage && (
              <p className="py-4 text-center text-xs text-muted-foreground">
                You've reached the end.
              </p>
            )}
          </>
        )}
      </SectionWrapper>
    </div>
  );
};

export default History;

const HistoryItem = ({ item, isLast }) => {
  const type = (item.artifact_type ?? "").toUpperCase();
  const typeColor = TYPE_BADGE_COLORS[type];

  return (
    <div className="relative flex gap-4">
      {!isLast && (
        <div className="absolute top-6.5 left-2.5 h-[calc(100%-2rem)] w-0.5 bg-border" />
      )}

      <div className="mt-1.5 size-5 shrink-0 rounded-full bg-primary ring-4 ring-background" />

      <div className="min-w-0 flex-1 pb-6">
        <p className="mb-1.5 text-xs text-muted-foreground tabular-nums">
          {formatHistoryDate(item.created_at)}
        </p>

        <div className="rounded-xl border border-border bg-muted/30 p-4">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            {type && (
              <Badge
                variant="secondary"
                className={cn("border-transparent", typeColor)}
              >
                {humanize(type.toLowerCase())}
              </Badge>
            )}
            {item.action && (
              <span className="text-xs text-muted-foreground">{humanize(item.action.toLowerCase())}</span>
            )}
          </div>

          {item.message && (
            <p className="mb-2 text-sm text-foreground wrap-break-word">
              {item.message}
            </p>
          )}

          {item.actor_name && (
            <p className="text-xs text-muted-foreground">
              By{" "}
              <span className="font-medium text-foreground">
                {item.actor_name}
              </span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
