import { useRef, useState } from "react";
import { DragDropProvider } from "@dnd-kit/react";
import { useSortable } from "@dnd-kit/react/sortable";
import { move } from "@dnd-kit/helpers";
import { Eye, EyeOff, GripVertical, RotateCcw, Settings2 } from "lucide-react";

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
 * Tab reordering + visibility, kept off the tab strip itself. A tab is a
 * navigation control, so a drag that starts on one would race the click that
 * changes route; editing a copy of the list in a popover keeps both gestures
 * unambiguous.
 *
 * @param {Array<{id: string, title: string, visible: boolean}>} tabs
 * @param {(nextTabs) => void} onOrderChange  Fired once per completed drag.
 * @param {(id: string, visible: boolean) => void} onVisibilityChange
 * @param {() => void} onReset
 * @param {boolean} isCustomized
 */
const ProjectTabsCustomizeMenu = ({
  tabs,
  onOrderChange,
  onVisibilityChange,
  onReset,
  isCustomized,
}) => {
  const visibleCount = tabs.filter((tab) => tab.visible).length;

  return (
    <Popover>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              aria-label="Customize tabs"
            >
              <Settings2 />
            </Button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent>Customize tabs</TooltipContent>
      </Tooltip>

      <PopoverContent align="end" className="max-h-[min(28rem,70vh)] gap-3 overflow-y-auto">
        <PopoverHeader>
          <PopoverTitle>Customize tabs</PopoverTitle>
          <PopoverDescription>
            Drag to reorder. Use the eye to show or hide. Saved for this
            project on this device.
          </PopoverDescription>
        </PopoverHeader>

        {/* Radix unmounts popover content on close, so the list remounts with a
            fresh copy of `tabs` on every open and can never show a stale order. */}
        <TabOrderList
          tabs={tabs}
          visibleCount={visibleCount}
          onOrderChange={onOrderChange}
          onVisibilityChange={onVisibilityChange}
        />

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
};

const TabOrderList = ({
  tabs,
  visibleCount,
  onOrderChange,
  onVisibilityChange,
}) => {
  const [items, setItems] = useState(tabs);
  // dnd-kit reorders on drag over so the list previews the drop position. Drag
  // end reads the result from a ref because the last drag-over state update
  // hasn't been applied yet by the time it runs.
  const latest = useRef(tabs);

  // Order lives in local state for drag preview; visibility comes from props so
  // toggling an eye updates immediately without waiting for a remount.
  const rows = items.map((item) => {
    const fresh = tabs.find((tab) => tab.id === item.id);
    return fresh ? { ...item, visible: fresh.visible } : item;
  });

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
        {rows.map((tab, index) => (
          <SortableTab
            key={tab.id}
            tab={tab}
            index={index}
            canHide={visibleCount > 1}
            onVisibilityChange={onVisibilityChange}
          />
        ))}
      </ul>
    </DragDropProvider>
  );
};

const SortableTab = ({ tab, index, canHide, onVisibilityChange }) => {
  const { ref, handleRef, isDragging } = useSortable({ id: tab.id, index });

  return (
    <li
      ref={ref}
      className={cn(
        "flex items-center gap-2 rounded-md px-1.5 py-1.5",
        isDragging
          ? "bg-primary/5 ring-1 ring-primary/40"
          : "hover:bg-accent/60",
        !tab.visible && "opacity-50",
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

      <span className="min-w-0 flex-1 truncate text-sm">{tab.title}</span>

      <button
        type="button"
        disabled={tab.visible && !canHide}
        aria-label={tab.visible ? `Hide ${tab.title}` : `Show ${tab.title}`}
        aria-pressed={tab.visible}
        title={
          tab.visible && !canHide
            ? "At least one tab must stay visible"
            : undefined
        }
        onClick={() => onVisibilityChange?.(tab.id, !tab.visible)}
        className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
      >
        {tab.visible ? (
          <Eye className="size-4" />
        ) : (
          <EyeOff className="size-4" />
        )}
      </button>
    </li>
  );
};

export default ProjectTabsCustomizeMenu;
