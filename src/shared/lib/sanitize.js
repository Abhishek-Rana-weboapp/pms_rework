import DOMPurify from "dompurify";

// Tag/attribute whitelist matching what the Tiptap editor (StarterKit +
// horizontal rule) can actually produce. Anything outside this — script tags,
// event handlers, style attributes, iframes, etc. — is stripped. Keep this in
// sync if the editor gains extensions (e.g. Link would add `a` + href).
const ALLOWED_TAGS = [
  "p",
  "br",
  "strong",
  "em",
  "s",
  "code",
  "pre",
  "h1",
  "h2",
  "h3",
  "ul",
  "ol",
  "li",
  "blockquote",
  "hr",
];

const ALLOWED_ATTR = [];

/**
 * Sanitize rich-text HTML (from the Tiptap editor or the API) against the
 * whitelist above, removing any XSS-carrying markup.
 *
 * IMPORTANT: this is defense-in-depth, not the security boundary. The server
 * must sanitize/validate too — HTML can reach it via direct API calls that
 * never touched this editor. Use this both before sending (this task) and,
 * critically, before rendering stored HTML with dangerouslySetInnerHTML.
 */
export const sanitizeHtml = (html) => {
  if (!html) return "";
  return DOMPurify.sanitize(String(html), { ALLOWED_TAGS, ALLOWED_ATTR });
};
