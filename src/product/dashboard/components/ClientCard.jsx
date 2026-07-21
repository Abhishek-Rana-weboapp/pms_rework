import { formatDistanceToNow } from "date-fns";
import { Briefcase, Mail, MapPin, Phone } from "lucide-react";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";
import { Button } from "@/shared/components/ui/button";
import EmployeeStatusBadge from "./EmployeeStatusBadge";

const DetailRow = ({ icon: Icon, children }) => (
  <div className="flex items-center gap-2 text-sm text-muted-foreground">
    <Icon className="size-4 shrink-0" />
    <span className="truncate">{children || "—"}</span>
  </div>
);

const ClientCard = ({ client, onView }) => {
  const {
    name,
    initials,
    email,
    phone,
    avatar,
    isActive,
    location,
    projectCount,
    updatedAt,
  } = client;

  return (
    <div className="flex flex-col rounded-xl border border-border bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
      {/* Header: identity + status */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <Avatar size="lg">
            <AvatarImage src={avatar} alt={name} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate font-medium text-foreground">{name}</p>
            {/* <p className="truncate text-xs text-muted-foreground">{email}</p> */}
          </div>
        </div>
        <EmployeeStatusBadge isActive={isActive} className="shrink-0" />
      </div>

      {/* Details */}
      <div className="mt-4 grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2">
        <DetailRow icon={Mail}>{email}</DetailRow>
        <DetailRow icon={MapPin}>{location}</DetailRow>
        <DetailRow icon={Phone}>{phone}</DetailRow>
        <DetailRow icon={Briefcase}>
          {projectCount} {projectCount === 1 ? "Project" : "Projects"}
        </DetailRow>
      </div>

      {/* Footer: last updated + actions */}
      <div className="mt-4 flex items-center justify-between gap-2 border-t pt-3">
        <span className="text-xs text-muted-foreground">
          {updatedAt
            ? `Last updated ${formatDistanceToNow(new Date(updatedAt), { addSuffix: true })}`
            : "—"}
        </span>
        <div className="flex items-center gap-1">
          {email && (
            <Button variant="ghost" size="icon-sm" asChild aria-label="Email">
              <a href={`mailto:${email}`} onClick={(e) => e.stopPropagation()}>
                <Mail />
              </a>
            </Button>
          )}
          {phone && (
            <Button variant="ghost" size="icon-sm" asChild aria-label="Call">
              <a href={`tel:${phone}`} onClick={(e) => e.stopPropagation()}>
                <Phone />
              </a>
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={() => onView?.(client)}>
            View Profile
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ClientCard;
