import { cn } from "@/shared/lib/utils";

export const ChartLegendItem = ({ color, label, square = false }) => (
  <div className="flex items-center gap-1.5">
    <span
      className={cn(square ? "size-2.5 rounded-sm" : "size-2 rounded-full")}
      style={{ background: color }}
    />
    <span className="text-xs text-muted-foreground">{label}</span>
  </div>
);

export const ChartLegend = ({ items = [], square = false, className }) => (
  <div
    className={cn(
      "mt-3 flex flex-wrap items-center justify-center gap-4",
      className,
    )}
  >
    {items.map((item) => (
      <ChartLegendItem
        key={item.label}
        color={item.color}
        label={item.label}
        square={square}
      />
    ))}
  </div>
);
