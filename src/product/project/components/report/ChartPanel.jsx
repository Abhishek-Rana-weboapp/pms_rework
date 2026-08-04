import { Spinner } from "@/shared/components/ui/spinner";
import SectionWrapper from "@/shared/components/wrappers/SectionWrapper";
import { cn } from "@/shared/lib/utils";

/**
 * Shared chrome for every report chart: title, optional description/actions,
 * loading overlay, and empty state.
 */
const ChartPanel = ({
  title,
  description,
  actions,
  isLoading,
  isEmpty,
  emptyMessage = "No data available",
  className,
  children,
}) => (
  <SectionWrapper className={cn("flex flex-col", className)}>
    <div className="mb-4 flex items-start justify-between gap-3">
      <div className="min-w-0">
        <h3 className="font-semibold">{title}</h3>
        {description && (
          <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {actions}
    </div>

    <div className="relative min-h-0 flex-1">
      {isLoading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center gap-2 rounded-md bg-background/60 text-sm text-muted-foreground">
          <Spinner /> Loading…
        </div>
      )}
      {!isLoading && isEmpty ? (
        <div className="flex h-56 items-center justify-center text-sm text-muted-foreground">
          {emptyMessage}
        </div>
      ) : (
        children
      )}
    </div>
  </SectionWrapper>
);

export default ChartPanel;
