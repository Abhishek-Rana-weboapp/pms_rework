import DOMPurify from "dompurify";

// Tag/attribute whitelist matching what the Tiptap editor (StarterKit +
// horizontal rule + text colour) can actually produce. Anything outside this —
// script tags, event handlers, iframes, etc. — is stripped. Keep this in sync if
// the editor gains extensions (e.g. Link would add `a` + href).
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
  "span",
];

// `style` is allowed only so the text-colour mark survives; the hook below
// reduces it to a single validated `color` declaration.
const ALLOWED_ATTR = ["style"];

// Colour syntaxes the picker can emit, plus the rgb()/rgba() forms browsers
// normalize hex into when the attribute is re-parsed.
const SAFE_COLOR =
  /^(#(?:[0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})|rgba?\((?:\s*[\d.]+%?\s*[,/]?){3,4}\)|hsla?\((?:\s*[\d.]+(?:deg|%)?\s*[,/]?){3,4}\))$/i;

// Allowing the `style` attribute wholesale would let stored HTML carry layout or
// background tricks (fixed-position overlays, url() fetches). Everything except
// a recognised `color` value is dropped, so the attribute can only ever tint text.
DOMPurify.addHook("afterSanitizeAttributes", (node) => {
  if (typeof node.hasAttribute !== "function" || !node.hasAttribute("style")) {
    return;
  }

  const color = node.style?.color?.trim() ?? "";
  node.removeAttribute("style");

  if (color && SAFE_COLOR.test(color)) {
    node.setAttribute("style", `color: ${color}`);
  }
});

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
