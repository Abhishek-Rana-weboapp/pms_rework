import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { MessageSquare, Send } from "lucide-react";

import { useAuth } from "@/app/providers/AuthContext";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";
import { Button } from "@/shared/components/ui/button";
import RichText from "@/shared/components/RichText";
import Tiptap from "@/shared/components/tiptap/Tiptap";
import SectionWrapper from "@/shared/components/wrappers/SectionWrapper";
import { createFullName, createInitials } from "@/shared/lib/helpers";
import { sanitizeHtml } from "@/shared/lib/sanitize";
import { cn } from "@/shared/lib/utils";

const CommentItem = ({ comment }) => {
  const author = comment?.author ?? comment?.created_by ?? comment?.user;
  const name = createFullName(author) || "Unknown";
  const createdAt = comment?.created_at ?? comment?.createdAt;
  const html = comment?.body ?? comment?.content ?? comment?.comment;

  return (
    <div className="flex gap-3">
      <Avatar size="sm" className="mt-0.5">
        <AvatarImage src={author?.user_image} alt={name} />
        <AvatarFallback>{createInitials(author) || "?"}</AvatarFallback>
      </Avatar>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <span className="text-sm font-medium text-foreground">{name}</span>
          {createdAt && (
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
            </span>
          )}
        </div>
        <RichText
          html={html}
          className="mt-1 text-gray-700"
          fallback={
            <p className="mt-1 text-sm text-muted-foreground">No content</p>
          }
        />
      </div>
    </div>
  );
};

const CommentsEmpty = () => (
  <div className="flex flex-col items-center justify-center gap-2 rounded-md border border-dashed border-neutral-200 bg-slate-50/60 px-4 py-8 text-center">
    <div className="flex size-9 items-center justify-center rounded-full bg-white text-muted-foreground shadow-sm">
      <MessageSquare className="size-4" />
    </div>
    <p className="text-sm font-medium text-foreground">No comments yet</p>
    <p className="text-xs text-muted-foreground">
      Start the discussion by leaving the first comment.
    </p>
  </div>
);

/**
 * Comments UI for artifact details. Wire API via `comments` + `onSubmit` later.
 * Expected comment shape (flexible): { id, body|content|comment, created_at, author|created_by|user }
 * `body` is rich-text HTML from TipTap.
 */
const CommentsSection = ({
  artifact,
  comments = [],
  onSubmit,
  isSubmitting = false,
  isLoading = false,
  containerClassName,
}) => {
  const { user } = useAuth();
  const [draft, setDraft] = useState("");
  const canSubmit = Boolean(draft) && !isSubmitting;

  const clearDraft = () => setDraft("");

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!canSubmit) return;

    const payload = {
      artifactId: artifact?.id,
      body: sanitizeHtml(draft),
    };

    const result = onSubmit?.(payload);
    // Clear when no handler yet, or when handler doesn't return a thenable failure.
    if (result?.then) {
      result.then(clearDraft).catch(() => {});
    } else {
      clearDraft();
    }
  };

  return (
    <SectionWrapper className={cn(containerClassName)}>
      <div className="mb-4 flex items-center justify-between gap-2">
        <h5 className="font-medium">Comments</h5>
        <span className="text-xs text-muted-foreground">
          {comments.length} {comments.length === 1 ? "comment" : "comments"}
        </span>
      </div>

      <form onSubmit={handleSubmit} className="mb-5">
        <div className="flex gap-3">
          <Avatar size="sm" className="mt-1">
            <AvatarImage
              src={user?.user_image}
              alt={createFullName(user) || "You"}
            />
            <AvatarFallback>{createInitials(user) || "?"}</AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1 space-y-2">
            <Tiptap
              value={draft}
              onChange={setDraft}
              disabled={isSubmitting}
              className="bg-slate-50/80"
              editorClassName="min-h-28"
            />
            <div className="flex justify-end">
              <Button type="submit" size="sm" disabled={!canSubmit}>
                <Send />
                {isSubmitting ? "Posting…" : "Comment"}
              </Button>
            </div>
          </div>
        </div>
      </form>

      {isLoading ? (
        <p className="py-6 text-center text-sm text-muted-foreground">
          Loading comments…
        </p>
      ) : comments.length === 0 ? (
        <CommentsEmpty />
      ) : (
        <div className="divide-y divide-neutral-100">
          {comments.map((comment) => (
            <div
              key={comment.id ?? comment.uuid}
              className="py-3 first:pt-0 last:pb-0"
            >
              <CommentItem comment={comment} />
            </div>
          ))}
        </div>
      )}
    </SectionWrapper>
  );
};

export default CommentsSection;
