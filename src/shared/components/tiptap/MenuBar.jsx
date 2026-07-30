import { useCallback, useMemo, useRef, useState } from "react";
import { useEditorState } from "@tiptap/react";
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Minus,
  Undo2,
  Redo2,
} from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { Separator } from "@/shared/components/ui/separator";
import { cn } from "@/shared/lib/utils";
import TextColorPicker from "./TextColorPicker";
import { ToolbarFocusContext, useToolbarItem } from "./toolbarFocus";

// Platform-aware modifier glyphs, matching what the editor actually binds
// ("Mod" = ⌘ on Mac, Ctrl elsewhere). Display only — the bindings live in the
// StarterKit extensions (and ExtraShortcuts for the rule); this just labels
// them so they're discoverable in the tooltips.
const IS_MAC =
  typeof navigator !== "undefined" &&
  /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent || "");
const MOD = IS_MAC ? "⌘" : "Ctrl";
const ALT = IS_MAC ? "⌥" : "Alt";
const SHIFT = IS_MAC ? "⇧" : "Shift";
const join = (...keys) => keys.join(IS_MAC ? "" : "+");

// Labels double as the roving-tabindex key, so the control named here is the one
// that holds the toolbar's tab stop until the user focuses another: it has to be
// the first control rendered below, and one that is never disabled.
const DEFAULT_TAB_STOP = "Bold";
const NAV_KEYS = ["ArrowRight", "ArrowLeft", "Home", "End"];
const FOCUSABLE_ITEMS = "button:not([disabled])";

// One toolbar button. `active` gets the pressed styling; `disabled` greys it
// out (e.g. undo with nothing to undo). onMouseDown preventDefault keeps the
// editor selection — a plain click would blur the editor first, so commands
// like bold would apply to nothing.
const ToolbarButton = ({
  onClick,
  active,
  disabled,
  label,
  shortcut,
  children,
}) => {
  const focusProps = useToolbarItem({ label, disabled });

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      aria-pressed={active}
      aria-label={label}
      title={shortcut ? `${label} (${shortcut})` : label}
      disabled={disabled}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={cn(active && "bg-muted text-foreground")}
      {...focusProps}
    >
      {children}
    </Button>
  );
};

const Divider = () => (
  <Separator orientation="vertical" className="mx-1 h-5" />
);

const MenuBar = ({ editor }) => {
  // Subscribe to only the flags the toolbar renders, so it re-renders on
  // selection/content changes (to keep active + can-do states accurate)
  // without recomputing on every unrelated transaction.
  const state = useEditorState({
    editor,
    selector: ({ editor }) => ({
      isBold: editor.isActive("bold"),
      isItalic: editor.isActive("italic"),
      isStrike: editor.isActive("strike"),
      isCode: editor.isActive("code"),
      isH1: editor.isActive("heading", { level: 1 }),
      isH2: editor.isActive("heading", { level: 2 }),
      isH3: editor.isActive("heading", { level: 3 }),
      isBulletList: editor.isActive("bulletList"),
      isOrderedList: editor.isActive("orderedList"),
      isBlockquote: editor.isActive("blockquote"),
      textColor: editor.getAttributes("textStyle").color ?? null,
      canUndo: editor.can().undo(),
      canRedo: editor.can().redo(),
    }),
  });

  const toolbarRef = useRef(null);
  const [activeLabel, setActiveLabel] = useState(null);

  const focus = useMemo(
    () => ({
      tabStop: activeLabel ?? DEFAULT_TAB_STOP,
      setTabStop: setActiveLabel,
      releaseTabStop: () => setActiveLabel(null),
    }),
    [activeLabel],
  );

  // The toolbar is a single tab stop, so the arrow keys are what move between
  // its controls. Order comes from the DOM rather than a list of labels, which
  // keeps it right as controls are added and skips the disabled ones for free.
  const handleKeyDown = useCallback((event) => {
    if (!NAV_KEYS.includes(event.key)) return;

    const toolbar = toolbarRef.current;
    // A popover opened from the toolbar is portaled out of this subtree, but its
    // React events still bubble through here — leave that content's keys alone.
    if (!toolbar?.contains(event.target)) return;

    const items = Array.from(toolbar.querySelectorAll(FOCUSABLE_ITEMS));
    const current = items.indexOf(event.target);
    if (current === -1) return;

    const next =
      event.key === "Home"
        ? 0
        : event.key === "End"
          ? items.length - 1
          : event.key === "ArrowRight"
            ? (current + 1) % items.length
            : (current - 1 + items.length) % items.length;

    event.preventDefault();
    items[next].focus();
  }, []);

  if (!editor) return null;

  return (
    <ToolbarFocusContext.Provider value={focus}>
      <div
        ref={toolbarRef}
        role="toolbar"
        aria-label="Formatting"
        aria-orientation="horizontal"
        onKeyDown={handleKeyDown}
        className="flex flex-wrap items-center gap-0.5 rounded-t-md border border-input bg-muted/40 px-2 py-1"
      >
        <ToolbarButton
          label="Bold"
          shortcut={join(MOD, "B")}
          active={state.isBold}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold />
        </ToolbarButton>
        <ToolbarButton
          label="Italic"
          shortcut={join(MOD, "I")}
          active={state.isItalic}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic />
        </ToolbarButton>
        <ToolbarButton
          label="Strikethrough"
          shortcut={join(MOD, SHIFT, "S")}
          active={state.isStrike}
          onClick={() => editor.chain().focus().toggleStrike().run()}
        >
          <Strikethrough />
        </ToolbarButton>
        <ToolbarButton
          label="Inline code"
          shortcut={join(MOD, "E")}
          active={state.isCode}
          onClick={() => editor.chain().focus().toggleCode().run()}
        >
          <Code />
        </ToolbarButton>

        <TextColorPicker editor={editor} color={state.textColor} />

        <Divider />

        <ToolbarButton
          label="Heading 1"
          shortcut={join(MOD, ALT, "1")}
          active={state.isH1}
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        >
          <Heading1 />
        </ToolbarButton>
        <ToolbarButton
          label="Heading 2"
          shortcut={join(MOD, ALT, "2")}
          active={state.isH2}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          <Heading2 />
        </ToolbarButton>
        <ToolbarButton
          label="Heading 3"
          shortcut={join(MOD, ALT, "3")}
          active={state.isH3}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        >
          <Heading3 />
        </ToolbarButton>

        <Divider />

        <ToolbarButton
          label="Bullet list"
          shortcut={join(MOD, SHIFT, "8")}
          active={state.isBulletList}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List />
        </ToolbarButton>
        <ToolbarButton
          label="Numbered list"
          shortcut={join(MOD, SHIFT, "7")}
          active={state.isOrderedList}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered />
        </ToolbarButton>
        <ToolbarButton
          label="Quote"
          shortcut={join(MOD, SHIFT, "B")}
          active={state.isBlockquote}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          <Quote />
        </ToolbarButton>
        <ToolbarButton
          label="Divider"
          shortcut={join(MOD, ALT, "H")}
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
        >
          <Minus />
        </ToolbarButton>

        <Divider />

        <ToolbarButton
          label="Undo"
          shortcut={join(MOD, "Z")}
          disabled={!state.canUndo}
          onClick={() => editor.chain().focus().undo().run()}
        >
          <Undo2 />
        </ToolbarButton>
        <ToolbarButton
          label="Redo"
          shortcut={join(MOD, SHIFT, "Z")}
          disabled={!state.canRedo}
          onClick={() => editor.chain().focus().redo().run()}
        >
          <Redo2 />
        </ToolbarButton>
      </div>
    </ToolbarFocusContext.Provider>
  );
};

export default MenuBar;
