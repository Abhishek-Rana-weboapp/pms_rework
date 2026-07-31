// The editor stores a mention as `<span data-type="mention" data-id="42"
// data-label="Jane Doe">@Jane Doe</span>`, so the ids the API needs for
// notifications are read back out of the HTML rather than tracked separately —
// one source of truth, and deleting the pill in the editor drops the mention too.
//
// Parse, don't regex: the HTML has already been sanitized, and the DOM is what
// decides what actually counts as a mention node.
export const extractMentionIds = (html) => {
  if (!html) return [];

  const doc = new DOMParser().parseFromString(String(html), "text/html");
  const ids = Array.from(
    doc.querySelectorAll('span[data-type="mention"]'),
    (node) => node.getAttribute("data-id"),
  ).filter(Boolean);

  // The same person can be mentioned repeatedly; the API only needs them once.
  return [...new Set(ids)];
};
