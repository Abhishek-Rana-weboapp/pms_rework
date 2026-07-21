import { createFullName, createInitials } from "@/shared/lib/helpers";
import { firstLineOfHtml } from "@/shared/lib/html";

// Builds an id -> { bg, text } lookup from the settings priorities list, used as
// a color fallback when the artifact's embedded priority omits bg_color/text_color
// (the list response sometimes only carries { id, priority }). Pass the result
// into normalizeArtifact.
export const buildPriorityColorMap = (priorities = []) =>
  Object.fromEntries(
    (priorities ?? []).map((p) => [
      p.id,
      { bg: p.bg_color ?? "", text: p.text_color ?? "" },
    ]),
  );

// Flattens a raw artifact record from the API into the shape the table and card
// views consume. Keeping all field-name knowledge here means the column builders
// stay declarative and every artifact type reads the same flat fields — types
// only differ by WHICH columns they render, not how a field is resolved.
// Mirrors normalizeClient.
//
// `priorityColorMap` (optional) resolves priority colors when they're missing
// from the embedded priority object — see buildPriorityColorMap.
export const normalizeArtifact = (artifact = {}, { priorityColorMap } = {}) => {
  const developer = artifact.developer;

  // Prefer colors on the embedded priority; fall back to the settings lookup.
  const priorityFallback = priorityColorMap?.[artifact.priority?.id];
  return {
    id: artifact.id,
    raw: artifact,
    title: artifact.title ?? "—",
    description: artifact.description ?? "",
    // Description is stored as rich-text HTML; the table shows just its first
    // plain-text line as a subtitle (tags stripped, entities decoded).
    descriptionText: firstLineOfHtml(artifact.description),
    projectName: artifact.project_details?.project_name ?? "—",
    developer: developer
      ? {
          name: createFullName(developer) || "—",
          initials: createInitials(developer) || "?",
          avatar: developer.user_image ?? "",
        }
      : null,
    status: artifact.status_detail?.status_name ?? "—",
    statusCategory: artifact.status_detail?.category ?? "",
    priority: artifact.priority?.priority ?? "—",
    // Priorities are color-coded in settings (bg_color / text_color); surface
    // them so both the table pill and the card can render the right colors.
    priorityColors: {
      bg: artifact.priority?.bg_color || priorityFallback?.bg || "",
      text: artifact.priority?.text_color || priorityFallback?.text || "",
    },
    startDate: artifact.start_date ?? null,
    targetDate: artifact.target_date ?? null,
    storyPoint: artifact.story_point ?? 0,
    progress: Number(artifact.progress) || 0,
  };
};
