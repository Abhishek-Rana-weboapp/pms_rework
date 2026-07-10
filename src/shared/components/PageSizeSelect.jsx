import { cn } from "@/shared/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";

/**
 * "Rows per page" selector. Controlled and presentational — shared by the
 * data-table pagination and non-table views so the control looks identical
 * everywhere. Reports the chosen size as a number.
 *
 * @param {number}   pageSize
 * @param {(size:number)=>void} onPageSizeChange
 * @param {number[]} [options]
 * @param {string}   [label]
 */
export function PageSizeSelect({
  pageSize,
  onPageSizeChange,
  options = [10, 20, 30, 50, 100],
  label = "Rows per page",
  className,
}) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className="text-sm font-medium">{label}</span>
      <Select
        value={`${pageSize}`}
        onValueChange={(value) => onPageSizeChange(Number(value))}
      >
        <SelectTrigger size="sm" className="w-18">
          <SelectValue placeholder={pageSize} />
        </SelectTrigger>
        <SelectContent>
          {options.map((size) => (
            <SelectItem key={size} value={`${size}`}>
              {size}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
