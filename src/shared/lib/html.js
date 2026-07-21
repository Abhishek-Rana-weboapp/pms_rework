// Convert rich-text HTML to plain text, with block elements separated by line
// breaks so "first line" is meaningful. DOMParser decodes entities and does NOT
// execute scripts, so this is safe on untrusted HTML. Plain (tag-free) input
// passes straight through.
export const htmlToPlainText = (html) => {
  if (!html) return "";
  const withBreaks = String(html)
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|h[1-6]|li|blockquote|pre|tr)>/gi, "\n");
  const doc = new DOMParser().parseFromString(withBreaks, "text/html");
  return (doc.body.textContent || "").replace(/\n{2,}/g, "\n").trim();
};

// First non-empty text line of rich-text HTML, or "". Handy for table/summary
// previews of a description stored as HTML.
export const firstLineOfHtml = (html) => {
  const text = htmlToPlainText(html);
  return text ? (text.split("\n").find((l) => l.trim()) ?? "").trim() : "";
};
