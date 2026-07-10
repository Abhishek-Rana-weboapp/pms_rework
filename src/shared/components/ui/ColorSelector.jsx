import { useState, useRef } from "react";
import { CheckIcon } from "lucide-react";

import { METADATA_COLORS } from "@/shared/lib/sharedData";
import { cn } from "@/shared/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "./popover";
import { Button } from "./button";

const ColorSelector = ({
  colors = METADATA_COLORS,
  value,
  onChange,
  onBlur,
  disabled,
  "aria-invalid": ariaInvalid,
}) => {
  const [open, setOpen] = useState(false);
  // Store references to all color buttons for keyboard focusing
  const buttonRefs = useRef([]);

  const selectedBg = value?.bg_color;
  const selectedText = value?.text_color;
  const hasValue = Boolean(selectedBg);
  

  const handleSelect = (color) => {
    onChange?.({ bg_color: color.bg, text_color: color.text });
    setOpen(false);
    onBlur?.();
  };

  // Handles 2D grid navigation using arrow keys
  const handleKeyDown = (e, currentIndex) => {
    const COLS = 6;
    const TOTAL_ITEMS = colors.length;
    let nextIndex = currentIndex;

    switch (e.key) {
      case "ArrowRight":
        e.preventDefault();
        e.stopPropagation();
        nextIndex = (currentIndex + 1) % TOTAL_ITEMS;
        break;
      case "ArrowLeft":
        e.preventDefault();
        e.stopPropagation();
        nextIndex = (currentIndex - 1 + TOTAL_ITEMS) % TOTAL_ITEMS;
        break;
      case "ArrowDown":
        e.preventDefault();
        e.stopPropagation();
        if (currentIndex + COLS < TOTAL_ITEMS) {
          nextIndex = currentIndex + COLS;
        }
        break;
      case "ArrowUp":
        e.preventDefault();
        e.stopPropagation();
        if (currentIndex - COLS >= 0) {
          nextIndex = currentIndex - COLS;
        }
        break;
      case "Tab":
        // Allow Radix / Browser default behavior for Tab key
        break;
      default:
        break;
    }

    if (nextIndex !== currentIndex) {
      buttonRefs.current[nextIndex]?.focus();
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild >
        <Button
          type="button"
          variant="outline"
          aria-invalid={ariaInvalid}
          disabled={disabled ?? false}
          className="w-full justify-start gap-2 font-normal"
        >
          <span
            className="size-4 rounded"
            style={{ backgroundColor: selectedBg ?? "transparent" }}
          />
          <span style={{ color: selectedText, background:selectedBg }} className="px-2 rounded-full">
            {hasValue ? "Selected colour" : "Select colour"}
          </span>
        </Button>
      </PopoverTrigger>

      <PopoverContent 
        className="w-56"
        // Stops Radix from stealing standard key events inside the modal content
        onKeyDown={(e) => {
          if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
            e.stopPropagation();
          }
        }}
      >
        <PopoverHeader>
          <PopoverTitle>Select Color</PopoverTitle>
        </PopoverHeader>

        <div className="grid grid-cols-6 gap-2">
          {colors.map((color, index) => {
            const isSelected = color.bg === selectedBg;
            return (
              <button
                key={color.id ?? color.bg}
                ref={(el) => (buttonRefs.current[index] = el)}
                type="button"
                title={color.name}
                aria-label={color.name}
                aria-pressed={isSelected}
                onClick={() => handleSelect(color)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                style={{ background: color.bg, color: color.text }}
                className={cn(
                  "flex size-6 items-center justify-center rounded-md ring-1 ring-foreground/10 transition hover:scale-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
                  isSelected && "ring-2 ring-foreground"
                )}
              >
                {isSelected && <CheckIcon className="size-3.5" />}
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default ColorSelector;



// import { useState } from "react";
// import { CheckIcon } from "lucide-react";

// import { METADATA_COLORS } from "@/shared/lib/sharedData";
// import { cn } from "@/shared/lib/utils";
// import {
//   Popover,
//   PopoverContent,
//   PopoverHeader,
//   PopoverTitle,
//   PopoverTrigger,
// } from "./popover";
// import { Button } from "./button";

// /**
//  * Controlled colour picker for metadata (priority / status / project-type).
//  *
//  * Fully controlled so it drops straight into a react-hook-form `Controller`:
//  *
//  *   <Controller
//  *     name="color"
//  *     control={control}
//  *     render={({ field }) => (
//  *       <ColorSelector value={field.value} onChange={field.onChange} onBlur={field.onBlur} />
//  *     )}
//  *   />
//  *
//  * @param {{bg_color?: string, text_color?: string}} value  Current selection.
//  * @param {(value: {bg_color: string, text_color: string}) => void} onChange
//  * @param {() => void} [onBlur]  Forwarded so RHF can mark the field touched.
//  * @param {object[]} [colors]  Palette; defaults to METADATA_COLORS.
//  */
// const ColorSelector = ({
//   colors = METADATA_COLORS,
//   value,
//   onChange,
//   onBlur,
//   "aria-invalid": ariaInvalid,
// }) => {
//   const [open, setOpen] = useState(false);

//   const selectedBg = value?.bg_color;
//   const selectedText = value?.text_color;
//   const hasValue = Boolean(selectedBg);

//   const handleSelect = (color) => {
//     onChange?.({ bg_color: color.bg, text_color: color.text });
//     setOpen(false);
//     onBlur?.();
//   };

//   return (
//     <Popover open={open} onOpenChange={setOpen}>
//       <PopoverTrigger asChild>
//         <Button
//           type="button"
//           variant="outline"
//           aria-invalid={ariaInvalid}
//           className="w-full justify-start gap-2 font-normal"
//         >
//           <span
//             className="size-4 rounded"
//             style={{ background: selectedBg ?? "transparent" }}
//           />
//           <span style={{ color: selectedText }}>
//             {hasValue ? "Selected colour" : "Select colour"}
//           </span>
//         </Button>
//       </PopoverTrigger>

//       <PopoverContent className="w-56">
//         <PopoverHeader>
//           <PopoverTitle>Select Color</PopoverTitle>
//         </PopoverHeader>

//         <div className="grid grid-cols-6 gap-2">
//           {colors.map((color) => {
//             const isSelected = color.bg === selectedBg;
//             return (
//               <button
//                 key={color.id ?? color.bg}
//                 type="button"
//                 title={color.name}
//                 aria-label={color.name}
//                 aria-pressed={isSelected}
//                 onClick={() => handleSelect(color)}
//                 style={{ background: color.bg, color: color.text }}
//                 className={cn(
//                   "flex size-6 items-center justify-center rounded-md ring-1 ring-foreground/10 transition hover:scale-110",
//                   isSelected && "ring-2 ring-foreground"
//                 )}
//               >
//                 {isSelected && <CheckIcon className="size-3.5" />}
//               </button>
//             );
//           })}
//         </div>
//       </PopoverContent>
//     </Popover>
//   );
// };

// export default ColorSelector;
