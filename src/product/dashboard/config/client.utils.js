import { createFullName, createInitials } from "@/shared/lib/helpers";

// Normalizes a raw client record from the API into the flat shape the card and
// table views consume. Mirrors normalizeEmployee — clients share the userprofile
// shape — and keeps all field-name knowledge in one place.
export const normalizeClient = (client = {}) => ({
  id: client.id,
  raw: client,
  name: createFullName(client) || "—",
  initials: createInitials(client) || "?",
  email: client.email ?? "",
  phone: client.contact_number ?? "",
  avatar: client.user_image ?? "",
  isActive: Boolean(client.is_active),
  location: client.current_address ?? "",
  projectCount: client.project_count ?? client.project_details?.length ?? 0,
  updatedAt: client.modified_at ?? null,
});
