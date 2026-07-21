import * as React from "react";
import { UploadCloudIcon, FileIcon, XIcon } from "lucide-react";

import { cn } from "@/shared/lib/utils";

const formatBytes = (bytes) => {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
};

// Match a File against an `accept` string like "image/*,application/pdf,.docx"
const matchesAccept = (file, accept) => {
  if (!accept) return true;
  const rules = accept.split(",").map((r) => r.trim().toLowerCase());
  const name = file.name.toLowerCase();
  const type = file.type.toLowerCase();
  return rules.some((rule) => {
    if (rule.startsWith(".")) return name.endsWith(rule);
    if (rule.endsWith("/*")) return type.startsWith(rule.slice(0, -1));
    return type === rule;
  });
};

/**
 * Controlled dropzone. `value` is a File[]; `onChange` receives the next File[].
 *
 * Props:
 *  - value, onChange, onBlur (RHF-friendly)
 *  - accept: string  (e.g. "image/*,.pdf")
 *  - multiple: boolean (default true)
 *  - maxSize: number  (bytes, per file)
 *  - maxFiles: number (total)
 *  - disabled, id, className, aria-invalid
 */
const Dropzone = React.forwardRef(function Dropzone(
  {
    value = [],
    onChange,
    onBlur,
    accept,
    multiple = true,
    maxSize,
    maxFiles,
    disabled,
    id,
    className,
    "aria-invalid": ariaInvalid,
    ...props
  },
  ref
) {
  const inputRef = React.useRef(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const [rejection, setRejection] = React.useState("");

  // Allow parent to focus/reset via a forwarded ref to the hidden input.
  React.useImperativeHandle(ref, () => inputRef.current, []);

  const openPicker = () => {
    if (!disabled) inputRef.current?.click();
  };

  const addFiles = (incoming) => {
    setRejection("");
    const accepted = [];
    const errors = [];

    for (const file of incoming) {
      if (accept && !matchesAccept(file, accept)) {
        errors.push(`${file.name}: unsupported file type`);
        continue;
      }
      if (maxSize && file.size > maxSize) {
        errors.push(`${file.name}: exceeds ${formatBytes(maxSize)}`);
        continue;
      }
      accepted.push(file);
    }

    let next = multiple ? [...value, ...accepted] : accepted.slice(-1);

    if (maxFiles && next.length > maxFiles) {
      errors.push(`You can upload at most ${maxFiles} file${maxFiles > 1 ? "s" : ""}`);
      next = next.slice(0, maxFiles);
    }

    if (errors.length) setRejection(errors.join(" · "));
    onChange?.(next);
  };

  const removeAt = (index) => {
    const next = value.filter((_, i) => i !== index);
    onChange?.(next);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    const dropped = Array.from(e.dataTransfer.files ?? []);
    if (dropped.length) addFiles(dropped);
  };

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled}
        aria-invalid={ariaInvalid || (rejection ? true : undefined)}
        data-dragging={isDragging || undefined}
        onClick={openPicker}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            openPicker();
          }
        }}
        onBlur={onBlur}
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setIsDragging(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setIsDragging(false);
        }}
        onDrop={handleDrop}
        className={cn(
          "flex flex-col items-center justify-center gap-2 rounded-md border border-dashed border-input bg-transparent px-4 py-8 text-center transition-[color,box-shadow,background-color] outline-none",
          "cursor-pointer hover:bg-accent/40",
          "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
          "data-[dragging]:border-ring data-[dragging]:bg-accent/60 data-[dragging]:ring-3 data-[dragging]:ring-ring/50",
          "aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20",
          "aria-disabled:pointer-events-none aria-disabled:opacity-50 dark:bg-input/30"
        )}
      >
        <div className="flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <UploadCloudIcon className="size-5" />
        </div>
        <div className="text-sm">
          <span className="font-medium text-foreground">Click to upload</span>
          <span className="text-muted-foreground"> or drag and drop</span>
        </div>
        <p className="text-xs text-muted-foreground">
          {accept ? `${accept} · ` : ""}
          {maxSize ? `up to ${formatBytes(maxSize)}` : ""}
          {maxFiles ? ` · max ${maxFiles} files` : ""}
        </p>

        <input
          ref={inputRef}
          id={id}
          type="file"
          // Not a tab stop: the wrapper div is the keyboard interface
          // (Enter/Space opens the picker). Left focusable, this clipped 1px
          // input becomes a duplicate tab stop — and focusing it makes any
          // scrollable ancestor (e.g. a dialog body) jump to a bogus offset.
          tabIndex={-1}
          className="sr-only"
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          onChange={(e) => {
            const picked = Array.from(e.target.files ?? []);
            if (picked.length) addFiles(picked);
            // reset so selecting the same file again re-fires change
            e.target.value = "";
          }}
          {...props}
        />
      </div>

      {rejection && <p className="text-sm text-destructive">{rejection}</p>}

      {value.length > 0 && (
        <ul className="flex flex-col gap-2">
          {value.map((file, index) => (
            <li
              key={`${file.name}-${index}`}
              className="flex items-center gap-3 rounded-md border border-input bg-transparent px-3 py-2 dark:bg-input/30"
            >
              <FileIcon className="size-4 shrink-0 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-foreground">{file.name}</p>
                <p className="text-xs text-muted-foreground">{formatBytes(file.size)}</p>
              </div>
              <button
                type="button"
                onClick={() => removeAt(index)}
                disabled={disabled}
                aria-label={`Remove ${file.name}`}
                className="flex size-6 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none disabled:opacity-50"
              >
                <XIcon className="size-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
});

export { Dropzone };
