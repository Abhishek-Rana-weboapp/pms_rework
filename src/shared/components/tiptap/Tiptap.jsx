import { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import { Extension } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import { Color, TextStyle } from "@tiptap/extension-text-style";

import { cn } from "@/shared/lib/utils";
import { RICH_TEXT_CLASS } from "@/shared/lib/richTextStyles";
import MenuBar from "./MenuBar";

// StarterKit binds shortcuts for every mark/node it ships EXCEPT the horizontal
// rule, so we add that one keymap here. Everything else (bold, headings, lists,
// undo, …) already has a default binding — the toolbar just labels them.
const ExtraShortcuts = Extension.create({
  name: "extraShortcuts",
  addKeyboardShortcuts() {
    return {
      "Mod-Alt-h": () => this.editor.commands.setHorizontalRule(),
    };
  },
});

// Hoisted so the array isn't re-allocated per render (the editor is created once
// anyway, but this keeps the config referentially stable). Color stores its value
// on the TextStyle mark, so TextStyle has to be registered alongside it.
const EXTENSIONS = [StarterKit, TextStyle, Color, ExtraShortcuts];

/**
 * Controlled rich-text editor for react-hook-form. Wire it through a Controller:
 *   <Tiptap value={field.value} onChange={field.onChange} onBlur={field.onBlur} />
 *
 * Emits HTML, normalized so an empty editor yields "" (not "<p></p>") — that's
 * what lets a plain `z.string().min(1)` treat a blank editor as empty/required.
 * Output should be sanitized before it's persisted/rendered (see sanitizeHtml).
 */
const Tiptap = ({
  value,
  onChange,
  onBlur,
  disabled = false,
  className,
  editorClassName,
}) => {
  const editor = useEditor({
    extensions: EXTENSIONS,
    content: value ?? "", // initial content only; external changes handled below
    editable: !disabled,
    // Perf (per Tiptap React docs): by default useEditor re-renders this
    // component on EVERY transaction (keystroke/selection). We don't need that —
    // the toolbar subscribes to just the flags it shows via useEditorState, and
    // EditorContent renders itself. Turning this off stops per-keystroke React
    // re-renders of the whole editor subtree. onUpdate still fires regardless,
    // so RHF keeps receiving changes.
    shouldRerenderOnTransaction: false,
    // Explicit for our CSR (Vite) app; avoids the SSR hydration warning path.
    immediatelyRender: true,
    onUpdate: ({ editor }) => {
      // Normalize empty ("<p></p>") to "" so required validation works.
      onChange?.(editor.isEmpty ? "" : editor.getHTML());
    },
    onBlur: () => onBlur?.(),
    editorProps: {
      attributes: {
        // The ProseMirror surface is headless AND Tailwind's Preflight resets
        // block elements (h1 -> inherit font, ul/ol -> no bullets, margins 0),
        // so heading/list/quote commands look like they "do nothing" without
        // this. RICH_TEXT_CLASS (shared with the RichText viewer) restores the
        // element styling; the leading classes are editor-surface only.
        class: cn(
          "px-3 py-2 text-sm outline-none scrollbar-thin",
          editorClassName ?? "min-h-48",
          RICH_TEXT_CLASS,
        ),
      },
    },
  });

  // Hydrate when the form value changes from OUTSIDE (edit-mode load / reset).
  // After the user's own keystroke the editor already equals `value`, so the
  // guard makes this a no-op then — no cursor jump, no update loop.
  useEffect(() => {
    if (!editor) return;
    const incoming = value ?? "";
    const current = editor.isEmpty ? "" : editor.getHTML();
    if (incoming !== current) {
      editor.commands.setContent(incoming, { emitUpdate: false });
    }
  }, [editor, value]);

  // Keep the editor's editable state in sync with the disabled prop.
  useEffect(() => {
    editor?.setEditable(!disabled);
  }, [editor, disabled]);

  return (
    <div
      className={cn(
        "rounded-md border border-input bg-transparent focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50",
        disabled && "opacity-50",
        className,
      )}
    >
      <MenuBar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
};

export default Tiptap;
