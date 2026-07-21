import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";

// Compact card for the Kanban board. Receives a normalized artifact (see
// normalizeArtifact) and renders just the inner content — the Kanban wraps it in
// the draggable card shell (border / background / grip), so this stays chrome-free.
//
// Note: the board payload has no `priority`, so we don't render a priority pill.
const BoardCard = ({ card }) => {
  const { title, developer, storyPoint } = card;

  return (
    <div className="space-y-2">
      <p className="line-clamp-2 text-sm font-medium text-foreground">{title}</p>

      <div className="flex items-center justify-between gap-2">
        {storyPoint ? (
          <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
            {storyPoint} pts
          </span>
        ) : (
          <span />
        )}

        {developer && (
          <Avatar className="size-7 shrink-0">
            <AvatarImage src={developer.avatar} alt={developer.name} />
            <AvatarFallback className="text-[9px]">
              {developer.initials}
            </AvatarFallback>
          </Avatar>
        )}
      </div>
    </div>
  );
};

export default BoardCard;
