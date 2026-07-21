import { useMemo } from "react";

import { sanitizeHtml } from "@/shared/lib/sanitize";
import { RICH_TEXT_CLASS } from "@/shared/lib/richTextStyles";
import { cn } from "@/shared/lib/utils";

// Renders stored rich-text HTML (from the Tiptap editor / the API) as formatted
// text. This is the PRIMARY XSS boundary on the client: the HTML is run through
// DOMPurify before it ever hits dangerouslySetInnerHTML. Styling comes from the
// same RICH_TEXT_CLASS the editor uses, so it reads exactly as authored.
//
// An "empty" editor value (""/whitespace, or the "<p></p>" a blank editor
// produces) renders the `fallback` instead of an empty box.
const RichText = ({ html, className, fallback = null }) => {
  const clean = useMemo(() => sanitizeHtml(html), [html]);

  // Strip tags to see if there's any actual text/media before rendering.
  const isEmpty = useMemo(
    () => clean.replace(/<[^>]*>/g, "").trim().length === 0,
    [clean],
  );

  if (isEmpty) return fallback;

  return (
    <div
      className={cn("text-sm", RICH_TEXT_CLASS, className)}
      dangerouslySetInnerHTML={{ __html: clean }}
    />
  );
};

export default RichText;
