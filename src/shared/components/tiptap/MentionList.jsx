import {
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";
import { createInitialsFromSingleName } from "@/shared/lib/helpers";
import { cn } from "@/shared/lib/utils";

/**
 * The "@" suggestion dropdown. Rendered outside the React tree by
 * mentionExtension.js (via ReactRenderer), which is why the keyboard handling is
 * exposed through the ref: the suggestion plugin owns the keydown event and
 * forwards it here, and a `true` return tells it we consumed the key.
 */
const MentionList = ({ items = [], command, loading = false, ref }) => {
  // The highlight is stored with the list it belongs to: the results are
  // re-filtered on every keystroke, and an index kept across that change can
  // point past the end of the new list. Deriving it here resets the highlight
  // for a new list without an effect that re-renders to catch up.
  const [highlight, setHighlight] = useState({ items, index: 0 });
  const activeIndex = highlight.items === items ? highlight.index : 0;
  const listRef = useRef(null);

  const moveHighlight = useCallback(
    (nextIndex) => setHighlight({ items, index: nextIndex }),
    [items],
  );

  useEffect(() => {
    listRef.current?.children[activeIndex]?.scrollIntoView({
      block: "nearest",
    });
  }, [activeIndex]);

  // `command` inserts the mention node; id/label become the data-id/data-label
  // attributes that survive sanitization and identify the user to the API.
  const select = useCallback(
    (index) => {
      const item = items[index];
      if (item) command({ id: String(item.id), label: item.label });
    },
    [items, command],
  );

  useImperativeHandle(
    ref,
    () => ({
      onKeyDown: ({ event }) => {
        // With nothing to pick, Enter/arrows keep their normal editor meaning.
        if (!items.length) return false;

        if (event.key === "ArrowDown") {
          moveHighlight((activeIndex + 1) % items.length);
          return true;
        }
        if (event.key === "ArrowUp") {
          moveHighlight((activeIndex - 1 + items.length) % items.length);
          return true;
        }
        if (event.key === "Enter" || event.key === "Tab") {
          select(activeIndex);
          return true;
        }
        return false;
      },
    }),
    [items, activeIndex, moveHighlight, select],
  );

  if (!items.length) {
    return (
      <div className="w-64 rounded-md border bg-popover px-3 py-2 text-sm text-muted-foreground shadow-md">
        {/* The plugin resolves the list asynchronously, so the first frame of a
            fresh "@" has no items yet — saying "none" there would be a lie. */}
        {loading ? "Searching…" : "No matches"}
      </div>
    );
  }

  return (
    <ul
      ref={listRef}
      role="listbox"
      className="max-h-64 w-64 overflow-y-auto rounded-md border bg-popover p-1 text-popover-foreground shadow-md scrollbar-thin"
    >
      {items.map((item, index) => (
        <li key={item.id} role="option" aria-selected={index === activeIndex}>
          <button
            type="button"
            // A click would blur the editor before the insert runs, which loses
            // the selection the mention has to replace.
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => select(index)}
            onMouseEnter={() => moveHighlight(index)}
            className={cn(
              "flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm",
              index === activeIndex && "bg-muted",
            )}
          >
            <Avatar size="sm">
              <AvatarImage src={item.image} alt={item.label} />
              <AvatarFallback className="text-[10px]">
                {createInitialsFromSingleName(item.label || "")}
              </AvatarFallback>
            </Avatar>
            <span className="min-w-0 flex-1">
              <span className="block truncate">{item.label}</span>
              {item.description && (
                <span className="block truncate text-xs text-muted-foreground">
                  {item.description}
                </span>
              )}
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
};

export default MentionList;
