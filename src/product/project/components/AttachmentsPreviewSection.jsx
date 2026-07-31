import { Calendar, CircleCheck, Flag, User } from "lucide-react";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";
import { getFileIconInfo } from "@/shared/lib/fileIcons";
import {
  createFullName,
  formatDateLocal,
  formatUpdateString,
  getFileNameFromUrl,
} from "@/shared/lib/helpers";
import { humanize } from "../config/artifacts/artifactConfig";

const detailItems = [
  { key: "assignee", label: "Assignee", Icon: User },
  { key: "priority", label: "Priority", Icon: Flag },
  { key: "status", label: "Status", Icon: CircleCheck },
  { key: "dueDate", label: "Due Date", Icon: Calendar },
];

const AttachmentsPreviewSection = ({
  type,
  id,
  title,
  assignee,
  priority,
  status,
  dueDate,
  attachments = [],
  action,
}) => {
  const details = {
    assignee: assignee || "N/A",
    priority: priority || "N/A",
    status: status ? humanize(status) : "N/A",
    dueDate: dueDate ? formatDateLocal(dueDate) : "N/A",
  };

  return (
    <div>
      <div className="space-y-4">
        <div className="space-y-2">
          <span className="text-xs uppercase text-muted-foreground">
            {humanize(type)}
            {id ? `-${id}` : ""}
          </span>
          <h3 className="font-medium sm:text-lg">{title}</h3>
        </div>

        <div className="flex flex-wrap items-center gap-4 border-b border-border pb-4 lg:gap--x-12 xl:gap-x-24 gap-y-3 ">
          {detailItems.map(({ key, label, Icon }) => (
            <div key={key} className="flex items-center gap-2 p-2">
              <div className="rounded-lg bg-muted p-2">
                <Icon className="size-6" />
              </div>
              <div className="space-y-0.5">
                <span className="text-xs font-medium text-muted-foreground">
                  {label}
                </span>
                <p className="text-sm">{details[key]}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 pt-4">
        <h4 className="text-sm font-medium">
          Attachments
          {attachments.length > 0 ? ` (${attachments.length})` : ""}
        </h4>
        {action}
      </div>

      {attachments.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 py-4 sm:grid-cols-2 lg:grid-cols-3">
          {attachments.map((attachment, index) => (
            <AttachmentItem
              key={
                attachment.id ??
                attachment.file ??
                attachment.url ??
                `${attachment.title}-${index}`
              }
              attachment={attachment}
            />
          ))}
        </div>
      ) : (
        <p className="py-6 text-sm text-muted-foreground">
          No attachments yet.
        </p>
      )}
    </div>
  );
};

const AttachmentItem = ({ attachment }) => {
  const href =
    attachment.url || attachment.file || attachment.attachment_link || "";
  const fileName =
    attachment.title ||
    getFileNameFromUrl(attachment.file || attachment.url);
  const { Icon, color, bg } = getFileIconInfo(
    attachment.file || attachment.url || fileName,
  );
  const uploader =
    attachment.user || attachment.uploaded_by || attachment.created_by;
  const uploaderName =
    uploader?.name ||
    uploader?.full_name ||
    createFullName(uploader) ||
    "Unknown";
  const uploaderAvatar =
    uploader?.avatar || uploader?.user_image || uploader?.image;
  const timeAgo =
    formatUpdateString(attachment.uploaded_at || attachment.created_at) ||
    attachment.time ||
    "";
  const Card = href ? "a" : "div";

  return (
    <Card
      {...(href
        ? { href, target: "_blank", rel: "noopener noreferrer" }
        : {})}
      className="group flex min-w-0 flex-col gap-4 rounded-2xl border border-border bg-background p-5 transition hover:border-border/80 hover:shadow-md"
    >
      <div
        className={`flex size-12 items-center justify-center rounded-xl ${bg}`}
      >
        <Icon className={`size-6 ${color}`} />
      </div>

      <h3
        className="truncate text-sm font-semibold text-foreground"
        title={fileName}
      >
        {fileName}
      </h3>

      <div className="flex items-center justify-between gap-2 pt-1">
        <div className="flex min-w-0 items-center gap-2">
          <Avatar className="size-6 shrink-0">
            <AvatarImage src={uploaderAvatar} alt={uploaderName} />
            <AvatarFallback className="text-[10px]">
              {uploaderName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <p className="truncate text-xs text-muted-foreground">
            {uploaderName}
          </p>
        </div>
        {timeAgo && (
          <p className="shrink-0 text-xs text-muted-foreground">{timeAgo}</p>
        )}
      </div>
    </Card>
  );
};

export default AttachmentsPreviewSection;
