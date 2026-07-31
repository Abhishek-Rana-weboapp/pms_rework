import Mention from "@tiptap/extension-mention";
import { ReactRenderer } from "@tiptap/react";

import MentionList from "./MentionList";

// How many matches the dropdown offers at once — enough to scan, few enough that
// an unfiltered team list doesn't turn into a scroll marathon.
const RESULT_LIMIT = 8;

const matches = (item, query) =>
  [item.label, item.description]
    .filter(Boolean)
    .some((field) => field.toLowerCase().includes(query));

const filterItems = (items, query) => {
  const normalized = query.trim().toLowerCase();
  const found = normalized
    ? items.filter((item) => matches(item, normalized))
    : items;
  return found.slice(0, RESULT_LIMIT);
};

// The suggestion list lives in the extension's storage (`editor.storage.mention`)
// rather than being captured when the extension is configured: the editor — and
// with it this ProseMirror plugin — is created once, while the candidates can
// arrive later, e.g. the project team coming back from the API. See
// setMentionItems below for the writing half.
export const MENTION_STORAGE_KEY = "mention";

export const setMentionItems = (editor, items) => {
  const storage = editor?.storage?.[MENTION_STORAGE_KEY];
  if (storage) storage.items = items ?? [];
};

/**
 * Mention support for the shared Tiptap editor. Candidates are supplied through
 * setMentionItems and shaped as `{ id, label, image?, description? }`.
 *
 * A picked mention is stored as
 * `<span data-type="mention" data-id="42" data-label="Jane Doe">@Jane Doe</span>`,
 * so it's the id — not the display name — that gets sent to the API, and a
 * renamed user still resolves.
 */
export const createMentionExtension = () =>
  Mention.extend({
    addStorage() {
      return { items: [] };
    },
  }).configure({
    suggestion: {
      items: ({ editor, query }) =>
        filterItems(editor.storage[MENTION_STORAGE_KEY]?.items ?? [], query),
      render: () => {
        let renderer = null;
        let unmount = null;

        return {
          onStart: (props) => {
            renderer = new ReactRenderer(MentionList, {
              editor: props.editor,
              props,
            });
            // The popup is portaled to the document body, so it needs to sit on
            // the same layer as the other floating UI (popovers, dialogs).
            renderer.element.style.zIndex = "50";

            // The plugin's own mount: it attaches the element, keeps it pinned
            // to the caret (flipping when there's no room below) and dismisses on
            // an outside click — which comes back to us as onExit.
            unmount = props.mount(renderer.element);
          },

          onUpdate: (props) => {
            if (!renderer) return;
            // Results are resolved asynchronously, and the plugin announces that
            // with an empty list before the real one lands a tick later. Passing
            // that on would blank the popup between every keystroke, so the
            // previous matches stay up until the new ones arrive.
            if (props.loading && !props.items.length) return;
            renderer.updateProps(props);
          },

          // Escape is handled by the plugin itself (it dismisses, which lands in
          // onExit); everything else is the list's to claim.
          onKeyDown: (props) => renderer?.ref?.onKeyDown(props) ?? false,

          onExit: () => {
            unmount?.();
            renderer?.destroy();
            unmount = null;
            renderer = null;
          },
        };
      },
    },
  });
