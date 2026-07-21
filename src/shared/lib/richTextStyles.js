// Element styling for rich text (headings, lists, quotes, code, rules).
// Shared by BOTH the Tiptap editor surface and the RichText viewer so authored
// content renders identically to how it was written. Uses Tailwind arbitrary
// variants (no typography plugin needed) and design tokens for theming.
export const RICH_TEXT_CLASS = [
  "[&_h1]:mt-3 [&_h1]:mb-1 [&_h1]:text-2xl [&_h1]:font-semibold",
  "[&_h2]:mt-3 [&_h2]:mb-1 [&_h2]:text-xl [&_h2]:font-semibold",
  "[&_h3]:mt-2 [&_h3]:mb-1 [&_h3]:text-lg [&_h3]:font-semibold",
  "[&_p]:my-1.5 [&_p]:leading-relaxed",
  "[&_ul]:my-1.5 [&_ul]:list-disc [&_ul]:pl-5",
  "[&_ol]:my-1.5 [&_ol]:list-decimal [&_ol]:pl-5",
  "[&_li]:my-0.5 [&_li>p]:my-0",
  "[&_blockquote]:my-2 [&_blockquote]:border-l-2 [&_blockquote]:border-border [&_blockquote]:pl-3 [&_blockquote]:text-muted-foreground [&_blockquote]:italic",
  "[&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-xs",
  "[&_pre]:my-2 [&_pre]:overflow-x-auto [&_pre]:rounded [&_pre]:bg-muted [&_pre]:p-3 [&_pre]:text-xs [&_pre>code]:bg-transparent [&_pre>code]:p-0",
  "[&_hr]:my-3 [&_hr]:border-border",
].join(" ");
