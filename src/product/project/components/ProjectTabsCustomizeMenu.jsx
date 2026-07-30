import { useRef, useState } from "react";
import { DragDropProvider } from "@dnd-kit/react";
import { useSortable } from "@dnd-kit/react/sortable";
import { move } from "@dnd-kit/helpers";
import { GripVertical, RotateCcw, Settings2 } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/shared/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import { cn } from "@/shared/lib/utils";

/**
 * Tab reordering, kept off the tab strip itself. A tab is a navigation control,
 * so a drag that starts on one would race the click that changes route; dragging
 * a copy of the list in a popover keeps both gestures unambiguous.
 *
 * @param {Array<{id: string, title: string}>} tabs  Tabs in their current order.
 * @param {(nextTabs) => void} onOrderChange  Fired once per completed drag.
 * @param {() => void} onReset       Clears the saved order.
 * @param {boolean} isCustomized     Whether a custom order is currently saved.
 */
const ProjectTabsCustomizeMenu = ({
  tabs,
  onOrderChange,
  onReset,
  isCustomized,
}) => (
  <Popover>
    <Tooltip>
      <TooltipTrigger asChild>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" aria-label="Reorder tabs">
            <Settings2 />
          </Button>
        </PopoverTrigger>
      </TooltipTrigger>
      <TooltipContent>Reorder tabs</TooltipContent>
    </Tooltip>

    <PopoverContent align="end" className="gap-3">
      <PopoverHeader>
        <PopoverTitle>Reorder tabs</PopoverTitle>
        <PopoverDescription>
          Drag to change where a tab appears. Saved for this project on this
          device.
        </PopoverDescription>
      </PopoverHeader>

      {/* Radix unmounts popover content on close, so the list remounts with a
          fresh copy of `tabs` on every open and can never show a stale order. */}
      <TabOrderList tabs={tabs} onOrderChange={onOrderChange} />

      {isCustomized && (
        <Button
          variant="ghost"
          size="sm"
          className="self-start"
          onClick={onReset}
        >
          <RotateCcw />
          Reset to default
        </Button>
      )}
    </PopoverContent>
  </Popover>
);

const TabOrderList = ({ tabs, onOrderChange }) => {
  const [items, setItems] = useState(tabs);
  // dnd-kit reorders on drag over so the list previews the drop position. Drag
  // end reads the result from a ref because the last drag-over state update
  // hasn't been applied yet by the time it runs.
  const latest = useRef(tabs);

  return (
    <DragDropProvider
      onDragOver={(event) =>
        setItems((current) => {
          const next = move(current, event);
          latest.current = next;
          return next;
        })
      }
      onDragEnd={(event) => {
        if (event.canceled) {
          setItems(tabs);
          latest.current = tabs;
          return;
        }
        onOrderChange?.(latest.current);
      }}
    >
      <ul className="flex flex-col gap-0.5">
        {items.map((tab, index) => (
          <SortableTab key={tab.id} tab={tab} index={index} />
        ))}
      </ul>
    </DragDropProvider>
  );
};

const SortableTab = ({ tab, index }) => {
  const { ref, handleRef, isDragging } = useSortable({ id: tab.id, index });

  return (
    <li
      ref={ref}
      className={cn(
        "flex items-center gap-2 rounded-md px-1.5 py-1.5",
        isDragging
          ? "bg-primary/5 ring-1 ring-primary/40"
          : "hover:bg-accent/60",
      )}
    >
      <button
        ref={handleRef}
        type="button"
        aria-label={`Reorder ${tab.title}`}
        className="cursor-grab touch-none text-muted-foreground/60 hover:text-foreground active:cursor-grabbing"
      >
        <GripVertical className="size-4" />
      </button>
      <span className="truncate text-sm">{tab.title}</span>
    </li>
  );
};

export default ProjectTabsCustomizeMenu;
