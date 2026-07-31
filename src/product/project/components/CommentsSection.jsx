import { useId, useMemo, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import {
  FileText,
  MessageSquare,
  Paperclip,
  Pencil,
  Reply,
  Send,
  Trash2,
  X,
} from "lucide-react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";

import { useAuth } from "@/app/providers/AuthContext";
import { useEmployees } from "@/product/dashboard/api/queries";
import RichText from "@/shared/components/RichText";
import Tiptap from "@/shared/components/tiptap/Tiptap";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/shared/components/ui/alert-dialog";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";
import { Button } from "@/shared/components/ui/button";
import { Spinner } from "@/shared/components/ui/spinner";
import SectionWrapper from "@/shared/components/wrappers/SectionWrapper";
import { createFullName, createInitials } from "@/shared/lib/helpers";
import { extractMentionIds } from "@/shared/lib/mentions";
import { sanitizeHtml } from "@/shared/lib/sanitize";
import { cn } from "@/shared/lib/utils";
import {
  useCreateComment,
  useDeleteComment,
  useUpdateComment,
} from "../api/comment/commentMutations";
import { useComments } from "../api/comment/commentQueries";

const EDIT_WINDOW_MS = 30 * 60 * 1000;

const getAuthor = (item) => item?.author ?? item?.created_by ?? item?.user;
const getAuthorName = (author) =>
  author?.name || createFullName(author) || "Unknown";
const getAuthorInitials = (author) => {
  if (author?.name) {
    return author.name
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase();
  }
  return createInitials(author) || "?";
};
const getCommentText = (comment) =>
  comment?.comment_text ??
  comment?.body ??
  comment?.content ??
  comment?.comment ??
  "";
const getErrorMessage = (error, fallback) =>
  error?.response?.data?.message ??
  error?.response?.data?.errors?.[0] ??
  fallback;
const getCommentsList = (data) => {
  const value = data?.results ?? data?.comments ?? data;
  return Array.isArray(value) ? value : [];
};
const getAttachments = (item) => {
  if (Array.isArray(item?.attachment)) return item.attachment;
  return item?.attachment ? [item.attachment] : [];
};
const getAttachmentUrl = (attachment) =>
  typeof attachment === "string" ? attachment : attachment?.file;
const getAttachmentName = (attachment, index) =>
  typeof attachment === "object" && attachment?.name
    ? attachment.name
    : `Attachment ${index + 1}`;

const isEditableBy = (comment, user) => {
  const authorId = getAuthor(comment)?.id;
  const createdAt = new Date(comment?.created_at ?? comment?.createdAt).getTime();
  return (
    String(authorId) === String(user?.id) &&
    Number.isFinite(createdAt) &&
    Date.now() - createdAt < EDIT_WINDOW_MS
  );
};

const relativeTime = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? ""
    : formatDistanceToNow(date, { addSuffix: true });
};

const UserAvatar = ({ user, size = "sm", className }) => {
  const name = getAuthorName(user);
  return (
    <Avatar size={size} className={className}>
      <AvatarImage
        src={user?.user_image ?? user?.image ?? user?.profile_image}
        alt={name}
      />
      <AvatarFallback>{getAuthorInitials(user)}</AvatarFallback>
    </Avatar>
  );
};

const Attachments = ({ attachments }) => {
  if (!attachments.length) return null;
  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {attachments.map((attachment, index) => {
        const url = getAttachmentUrl(attachment);
        if (!url) return null;
        return (
          <a
            key={attachment?.id ?? url}
            href={url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 rounded-md border bg-background px-2 py-1 text-xs text-primary hover:bg-muted"
          >
            <FileText className="size-3" />
            {getAttachmentName(attachment, index)}
          </a>
        );
      })}
    </div>
  );
};

const FilePicker = ({ file, onChange, disabled }) => {
  const inputId = useId();
  return (
    <div className="flex min-w-0 items-center gap-2">
      <input
        id={inputId}
        type="file"
        hidden
        disabled={disabled}
        onChange={(event) => onChange(event.target.files?.[0] ?? null)}
      />
      <Button asChild type="button" variant="ghost" size="icon-sm">
        <label
          htmlFor={inputId}
          aria-label="Attach a file"
          className={cn(disabled && "pointer-events-none opacity-50")}
        >
          <Paperclip />
        </label>
      </Button>
      {file && (
        <span className="flex min-w-0 items-center gap-1 text-xs text-muted-foreground">
          <span className="max-w-48 truncate">{file.name}</span>
          <button
            type="button"
            className="rounded-sm p-0.5 hover:bg-muted hover:text-foreground"
            onClick={() => onChange(null)}
            aria-label={`Remove ${file.name}`}
          >
            <X className="size-3" />
          </button>
        </span>
      )}
    </div>
  );
};

const CommentComposer = ({
  value,
  onChange,
  file,
  onFileChange,
  onSubmit,
  onCancel,
  isPending,
  submitLabel,
  mentions,
  compact = false,
}) => {
  const canSubmit = Boolean(value || file) && !isPending;
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        if (canSubmit) onSubmit();
      }}
      className="min-w-0 flex-1 space-y-2"
    >
      <Tiptap
        value={value}
        onChange={onChange}
        disabled={isPending}
        mentions={mentions}
        className="bg-slate-50/80"
        editorClassName={compact ? "min-h-20" : "min-h-28"}
      />
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <FilePicker file={file} onChange={onFileChange} disabled={isPending} />
          {!file && (
            <span className="hidden text-xs text-muted-foreground sm:inline">
              Type @ to mention
            </span>
          )}
        </div>
        <div className="flex gap-2">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onCancel}
              disabled={isPending}
            >
              Cancel
            </Button>
          )}
          <Button type="submit" size="sm" disabled={!canSubmit}>
            {isPending ? <Spinner /> : <Send />}
            {isPending ? "Saving…" : submitLabel}
          </Button>
        </div>
      </div>
    </form>
  );
};

const DeleteButton = ({ title, description, onConfirm, disabled }) => (
  <AlertDialog>
    <AlertDialogTrigger asChild>
      <Button
        type="button"
        variant="ghost"
        size="xs"
        className="text-destructive hover:text-destructive"
        disabled={disabled}
      >
        <Trash2 />
        Delete
      </Button>
    </AlertDialogTrigger>
    <AlertDialogContent size="sm">
      <AlertDialogHeader>
        <AlertDialogTitle>{title}</AlertDialogTitle>
        <AlertDialogDescription>{description}</AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>Cancel</AlertDialogCancel>
        <AlertDialogAction variant="destructive" onClick={onConfirm}>
          Delete
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);

const ReplyItem = ({
  reply,
  user,
  isEditing,
  onEdit,
  onDelete,
  deletePending,
  editComposer,
}) => {
  const author = getAuthor(reply);
  const createdAt = reply?.created_at ?? reply?.createdAt;

  // Editing swaps the reply for the composer in place, rather than pulling the
  // text up into the section's main box where its thread is no longer visible.
  if (isEditing) {
    return (
      <div className="mt-3 flex gap-2 pl-5 sm:pl-9">
        <UserAvatar user={user} className="mt-1" />
        {editComposer}
      </div>
    );
  }

  return (
    <div className="mt-3 flex gap-2 pl-5 sm:pl-9">
      <UserAvatar user={author} className="mt-0.5" />
      <div className="min-w-0 flex-1">
        <div className="rounded-lg bg-muted/55 px-3 py-2.5">
          <div className="flex flex-wrap items-baseline gap-x-2">
            <span className="text-xs font-medium">{getAuthorName(author)}</span>
            {createdAt && (
              <span className="text-[11px] text-muted-foreground">
                {relativeTime(createdAt)}
              </span>
            )}
          </div>
          <RichText
            html={getCommentText(reply)}
            className="mt-1 text-foreground/80"
          />
          <Attachments attachments={getAttachments(reply)} />
        </div>

        {isEditableBy(reply, user) && (
          <div className="mt-1 flex items-center gap-1">
            <Button type="button" variant="ghost" size="xs" onClick={onEdit}>
              <Pencil />
              Edit
            </Button>
            <DeleteButton
              title="Delete reply?"
              description="This reply will be permanently removed."
              onConfirm={onDelete}
              disabled={deletePending}
            />
          </div>
        )}
      </div>
    </div>
  );
};

const CommentItem = ({
  comment,
  user,
  isReplying,
  onReply,
  onEdit,
  onDelete,
  deletePending,
  replyComposer,
  editingReplyId,
  onReplyEdit,
  replyEditComposer,
}) => {
  const author = getAuthor(comment);
  const createdAt = comment?.created_at ?? comment?.createdAt;
  const editable = isEditableBy(comment, user);

  return (
    <article className="py-4 first:pt-0 last:pb-0">
      <div className="flex gap-3">
        <UserAvatar user={author} className="mt-0.5" />
        <div className="min-w-0 flex-1">
          <div className="rounded-lg bg-muted/55 px-3.5 py-3">
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
              <span className="text-sm font-medium">
                {getAuthorName(author)}
              </span>
              {createdAt && (
                <span className="text-xs text-muted-foreground">
                  {relativeTime(createdAt)}
                </span>
              )}
            </div>
            <RichText
              html={getCommentText(comment)}
              className="mt-1 text-foreground/80"
            />
            <Attachments attachments={getAttachments(comment)} />
          </div>

          <div className="mt-1 flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="xs"
              onClick={onReply}
            >
              <Reply />
              Reply
            </Button>
            {editable && (
              <>
                <Button
                  type="button"
                  variant="ghost"
                  size="xs"
                  onClick={onEdit}
                >
                  <Pencil />
                  Edit
                </Button>
                <DeleteButton
                  title="Delete comment?"
                  description="This comment and its replies will be permanently removed."
                  onConfirm={() => onDelete(comment.id)}
                  disabled={deletePending}
                />
              </>
            )}
          </div>

          {isReplying && (
            <div className="mt-3 flex gap-2 pl-2 sm:pl-6">
              <UserAvatar user={user} className="mt-1" />
              {replyComposer}
            </div>
          )}

          {comment?.replies?.map((reply) => (
            <ReplyItem
              key={reply.id ?? reply.uuid}
              reply={reply}
              user={user}
              isEditing={editingReplyId != null && editingReplyId === reply.id}
              onEdit={() => onReplyEdit(reply, comment.id)}
              onDelete={() => onDelete(reply.id)}
              deletePending={deletePending}
              editComposer={replyEditComposer}
            />
          ))}
        </div>
      </div>
    </article>
  );
};

const CommentsEmpty = () => (
  <div className="flex flex-col items-center justify-center gap-2 rounded-md border border-dashed bg-slate-50/60 px-4 py-8 text-center">
    <div className="flex size-9 items-center justify-center rounded-full bg-background text-muted-foreground shadow-sm">
      <MessageSquare className="size-4" />
    </div>
    <p className="text-sm font-medium">No comments yet</p>
    <p className="text-xs text-muted-foreground">
      Start the discussion by leaving the first comment.
    </p>
  </div>
);

const CommentsSection = ({ artifact, containerClassName }) => {
  const { projectId, artifactId: routeArtifactId } = useParams();
  const { user } = useAuth();
  const artifactId = artifact?.id ?? routeArtifactId;
  const [draft, setDraft] = useState("");
  const [file, setFile] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyDraft, setReplyDraft] = useState("");
  const [replyFile, setReplyFile] = useState(null);
  // { id, parentId } — the parent has to be remembered, not just the reply, so
  // the update can resend it (see buildFormData).
  const [editingReply, setEditingReply] = useState(null);
  const [editReplyDraft, setEditReplyDraft] = useState("");
  const [editReplyFile, setEditReplyFile] = useState(null);
  // Which composer is mid-request. The three share two mutations, so tracking
  // the target is what keeps a reply's spinner out of the other two boxes.
  const [pendingTarget, setPendingTarget] = useState(null);

  const { data, isLoading, isError, refetch } = useComments({
    projectId,
    artifactId,
  });
  const comments = getCommentsList(data);

  // Load active employees in one request for client-side mention filtering.
  // Always pass an array so Tiptap enables its mention extension on first render,
  // before this request settles.
  const { data: employeesData } = useEmployees({
    pageSize: 1000,
    status: "true",
  });
  const mentions = useMemo(
    () =>
      (employeesData?.results ?? []).map((employee) => ({
        id: employee.id,
        label:
          createFullName(employee) || employee.email || `#${employee.id}`,
        description: employee.role || employee.email,
        image: employee.user_image ?? undefined,
      })),
    [employeesData],
  );

  const createMutation = useCreateComment(projectId, artifactId);
  const updateMutation = useUpdateComment(projectId, artifactId);
  const deleteMutation = useDeleteComment(projectId, artifactId);

  const resetMain = () => {
    setDraft("");
    setFile(null);
    setEditingId(null);
  };
  const resetReply = () => {
    setReplyingTo(null);
    setReplyDraft("");
    setReplyFile(null);
  };
  const resetReplyEdit = () => {
    setEditingReply(null);
    setEditReplyDraft("");
    setEditReplyFile(null);
  };
  const buildFormData = (text, attachment, parentId) => {
    const formData = new FormData();
    formData.append("artifact", artifactId);
    if (parentId != null) formData.append("parent", parentId);
    if (attachment) formData.append("attachment", attachment);

    if (text) {
      // Ids are read back out of the sanitized HTML, so what the server is told
      // to notify can never disagree with the pills the comment actually shows.
      const html = sanitizeHtml(text);
      const mentionIds = extractMentionIds(html);
      formData.append("comment_text", html);
      if (mentionIds.length) {
        formData.append("mention_ids", JSON.stringify(mentionIds));
      }
    }

    return formData;
  };

  const submitMain = async () => {
    try {
      setPendingTarget("main");
      const formData = buildFormData(draft, file);
      if (editingId != null) {
        await updateMutation.mutateAsync({ id: editingId, formData });
        toast.success("Comment updated.");
      } else {
        await createMutation.mutateAsync(formData);
        toast.success("Comment added.");
      }
      resetMain();
    } catch (error) {
      toast.error(getErrorMessage(error, "Couldn't save the comment."));
    } finally {
      setPendingTarget(null);
    }
  };
  const submitReply = async () => {
    try {
      setPendingTarget("reply");
      await createMutation.mutateAsync(
        buildFormData(replyDraft, replyFile, replyingTo),
      );
      resetReply();
      toast.success("Reply added.");
    } catch (error) {
      toast.error(getErrorMessage(error, "Couldn't add the reply."));
    } finally {
      setPendingTarget(null);
    }
  };
  const submitReplyEdit = async () => {
    if (!editingReply) return;
    try {
      setPendingTarget("replyEdit");
      await updateMutation.mutateAsync({
        id: editingReply.id,
        // PUT replaces the row, so `parent` has to go back on the wire or the
        // reply is orphaned out of its thread and resurfaces as a top-level one.
        formData: buildFormData(
          editReplyDraft,
          editReplyFile,
          editingReply.parentId,
        ),
      });
      resetReplyEdit();
      toast.success("Reply updated.");
    } catch (error) {
      toast.error(getErrorMessage(error, "Couldn't save the reply."));
    } finally {
      setPendingTarget(null);
    }
  };
  const handleDelete = async (commentId) => {
    try {
      await deleteMutation.mutateAsync(commentId);
      if (editingId === commentId) resetMain();
      if (editingReply?.id === commentId) resetReplyEdit();
      toast.success("Comment deleted.");
    } catch (error) {
      toast.error(getErrorMessage(error, "Couldn't delete the comment."));
    }
  };
  const handleEdit = (comment) => {
    setDraft(getCommentText(comment));
    setFile(null);
    setEditingId(comment.id);
  };
  // Only one reply editor at a time, and never alongside the new-reply box on
  // the same thread — two open editors in one place is just confusing.
  const handleReplyEdit = (reply, parentId) => {
    resetReply();
    setEditingReply({ id: reply.id, parentId });
    setEditReplyDraft(getCommentText(reply));
    setEditReplyFile(null);
  };
  const toggleReply = (commentId) => {
    resetReplyEdit();
    if (replyingTo === commentId) {
      resetReply();
      return;
    }
    setReplyingTo(commentId);
    setReplyDraft("");
    setReplyFile(null);
  };

  return (
    <SectionWrapper className={cn(containerClassName)}>
      <div className="mb-4 flex items-center justify-between gap-2">
        <h5 className="font-medium">Comments</h5>
        <span className="text-xs text-muted-foreground">
          {comments.length} {comments.length === 1 ? "comment" : "comments"}
        </span>
      </div>

      <div className="mb-5 flex gap-3">
        <UserAvatar user={user} className="mt-1" />
        <CommentComposer
          value={draft}
          onChange={setDraft}
          file={file}
          onFileChange={setFile}
          onSubmit={submitMain}
          onCancel={editingId != null ? resetMain : undefined}
          isPending={pendingTarget === "main"}
          submitLabel={editingId != null ? "Update" : "Comment"}
          mentions={mentions}
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Spinner className="text-muted-foreground" />
        </div>
      ) : isError ? (
        <div className="rounded-md border border-dashed p-6 text-center">
          <p className="text-sm text-muted-foreground">
            Couldn't load comments.
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-3"
            onClick={() => refetch()}
          >
            Try again
          </Button>
        </div>
      ) : comments.length === 0 ? (
        <CommentsEmpty />
      ) : (
        <div className="divide-y divide-border">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id ?? comment.uuid}
              comment={comment}
              user={user}
              isReplying={replyingTo === comment.id}
              onReply={() => toggleReply(comment.id)}
              onEdit={() => handleEdit(comment)}
              onDelete={handleDelete}
              deletePending={deleteMutation.isPending}
              replyComposer={
                <CommentComposer
                  value={replyDraft}
                  onChange={setReplyDraft}
                  file={replyFile}
                  onFileChange={setReplyFile}
                  onSubmit={submitReply}
                  onCancel={resetReply}
                  isPending={pendingTarget === "reply"}
                  submitLabel="Reply"
                  mentions={mentions}
                  compact
                />
              }
              editingReplyId={editingReply?.id ?? null}
              onReplyEdit={handleReplyEdit}
              replyEditComposer={
                <CommentComposer
                  value={editReplyDraft}
                  onChange={setEditReplyDraft}
                  file={editReplyFile}
                  onFileChange={setEditReplyFile}
                  onSubmit={submitReplyEdit}
                  onCancel={resetReplyEdit}
                  isPending={pendingTarget === "replyEdit"}
                  submitLabel="Update"
                  mentions={mentions}
                  compact
                />
              }
            />
          ))}
        </div>
      )}
    </SectionWrapper>
  );
};

export default CommentsSection;
