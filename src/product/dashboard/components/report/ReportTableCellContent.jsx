import RichText from "@/shared/components/RichText";
import { cn } from "@/shared/lib/utils";
import { shouldRenderRichTextCell } from "./reportUtils";

const RICH_TEXT_CELL_CLASS =
  "line-clamp-1 max-w-full overflow-hidden break-words text-sm [&_p]:my-0 [&_h1]:my-0 [&_h2]:my-0 [&_h3]:my-0 [&_ul]:my-0 [&_ol]:my-0 [&_li]:my-0 [&_blockquote]:my-0";

/** Shared cell class for TipTap / rich-text report columns. */
export const RICH_TEXT_COLUMN_CELL_CLASS = "w-64 max-w-64 min-w-64 p-2 px-4 align-top";

/**
 * Renders a report cell value — RichText (clamped) for TipTap fields, plain text otherwise.
 */
export function ReportTableCellContent({ column, value, className }) {
  const display = value == null || value === "" ? null : value;

  if (shouldRenderRichTextCell(column, display)) {
    return (
      <RichText
        html={typeof display === "string" ? display : String(display ?? "")}
        className={cn(RICH_TEXT_CELL_CLASS, className)}
        fallback="-"
      />
    );
  }

  return (
    <span className={cn("truncate", className)} title={display != null ? String(display) : undefined}>
      {display ?? "-"}
    </span>
  );
}

export function getReportCellClassName(column, value, baseClassName = "") {
  if (shouldRenderRichTextCell(column, value)) {
    return cn(RICH_TEXT_COLUMN_CELL_CLASS, baseClassName);
  }
  return cn("max-w-96 truncate whitespace-nowrap p-2 px-4 text-sm", baseClassName);
}
