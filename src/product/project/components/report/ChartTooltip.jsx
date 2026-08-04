/** Shared Recharts tooltip for project report charts. */
const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-md border border-border bg-popover px-2.5 py-1.5 text-xs shadow-md">
      {label != null && label !== "" && (
        <p className="mb-0.5 font-medium text-foreground">{label}</p>
      )}
      {payload.map((entry, index) => (
        <p
          key={`${entry.name}-${index}`}
          className="text-muted-foreground"
          style={{ color: entry.color ?? entry.stroke }}
        >
          {entry.name}:{" "}
          {typeof entry.value === "number"
            ? entry.value.toFixed(1)
            : entry.value}
        </p>
      ))}
    </div>
  );
};

export default ChartTooltip;
