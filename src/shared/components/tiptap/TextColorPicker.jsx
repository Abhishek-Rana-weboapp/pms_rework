import { useState } from "react";
import { Baseline, Ban } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui/popover";
import { cn } from "@/shared/lib/utils";
import { useToolbarItem } from "./toolbarFocus";

// Also the key the toolbar's roving tabindex tracks this control by.
const TRIGGER_LABEL = "Text color";

// Kept to 6-digit hex so they compare cleanly against the mark's stored value.
const SWATCHES = [
  { label: "Ink", value: "#0f172a" },
  { label: "Grey", value: "#64748b" },
  { label: "Red", value: "#dc2626" },
  { label: "Orange", value: "#ea580c" },
  { label: "Amber", value: "#d97706" },
  { label: "Green", value: "#16a34a" },
  { label: "Teal", value: "#0d9488" },
  { label: "Sky", value: "#0284c7" },
  { label: "Blue", value: "#2563eb" },
  { label: "Indigo", value: "#4f46e5" },
  { label: "Violet", value: "#7c3aed" },
  { label: "Pink", value: "#db2777" },
];

/**
 * `<input type="color">` only accepts 6-digit hex, but the stored mark value can
 * come back as `rgb(...)` — browsers normalize hex when the style attribute is
 * re-parsed after a save. Normalizing here also makes swatch matching reliable.
 */
const toHex = (color) => {
  if (!color) return null;

  const value = String(color).trim();

  if (/^#[0-9a-f]{6}$/i.test(value)) return value.toLowerCase();

  if (/^#[0-9a-f]{3}$/i.test(value)) {
    return `#${value
      .slice(1)
      .split("")
      .map((char) => char + char)
      .join("")}`.toLowerCase();
  }

  const parts = value.match(/[\d.]+/g);
  if (parts?.length >= 3) {
    return `#${parts
      .slice(0, 3)
      .map((part) =>
        Math.max(0, Math.min(255, Math.round(Number(part))))
          .toString(16)
          .padStart(2, "0"),
      )
      .join("")}`;
  }

  return null;
};

const TextColorPicker = ({ editor, color }) => {
  const [open, setOpen] = useState(false);
  // Takes part in the toolbar's roving tabindex, like the plain toolbar buttons.
  const focusProps = useToolbarItem({ label: TRIGGER_LABEL });

  const currentHex = toHex(color);

  // The native colour dialog streams `input` events while the user drags, so it
  // applies without closing the popover; swatches are a single decisive pick.
  const applyColor = (value, { close = true } = {}) => {
    editor.chain().focus().setColor(value).run();
    if (close) setOpen(false);
  };

  const removeColor = () => {
    editor.chain().focus().unsetColor().run();
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label={TRIGGER_LABEL}
          title={TRIGGER_LABEL}
          // Keep the editor selection: a plain click would blur it first, so the
          // colour would end up applying to nothing.
          onMouseDown={(e) => e.preventDefault()}
          className={cn(open && "bg-muted text-foreground")}
          {...focusProps}
        >
          <Baseline style={currentHex ? { color: currentHex } : undefined} />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        className="w-auto gap-3 p-3"
        // Focus must stay in the editor, both while the popover is open and after
        // it closes — otherwise the selection the colour applies to is lost.
        onOpenAutoFocus={(e) => e.preventDefault()}
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        <div className="grid grid-cols-6 gap-1.5">
          {SWATCHES.map((swatch) => {
            const isActive = currentHex === swatch.value;

            return (
              <button
                key={swatch.value}
                type="button"
                aria-label={swatch.label}
                aria-pressed={isActive}
                title={swatch.label}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => applyColor(swatch.value)}
                className={cn(
                  "size-6 rounded-md ring-1 ring-foreground/15 transition hover:scale-110",
                  isActive && "ring-2 ring-ring ring-offset-2",
                )}
                style={{ backgroundColor: swatch.value }}
              />
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <label className="flex flex-1 cursor-pointer items-center gap-2 rounded-md border border-input px-2 py-1.5 text-xs hover:bg-muted">
            <span
              className="size-4 shrink-0 rounded ring-1 ring-foreground/15"
              style={{ backgroundColor: currentHex ?? "transparent" }}
            />
            Custom
            <input
              type="color"
              value={currentHex ?? "#000000"}
              onChange={(e) => applyColor(e.target.value, { close: false })}
              className="sr-only"
            />
          </label>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={!currentHex}
            onMouseDown={(e) => e.preventDefault()}
            onClick={removeColor}
            className="text-xs"
          >
            <Ban />
            Reset
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default TextColorPicker;
