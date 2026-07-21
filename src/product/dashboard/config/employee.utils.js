import { createFullName, createInitials } from "@/shared/lib/helpers";

// Normalizes a raw employee record from the API into the flat shape the card and
// table views consume. Keeps all field-name knowledge in one place.
//
// API shape (confirmed): { id, uuid, first_name, last_name, email,
//   contact_number, current_address, is_active, project_count, project_details,
//   user_image, modified_at, user_type }
export const normalizeEmployee = (emp = {}) => ({
  id: emp.id,
  raw: emp,
  name: createFullName(emp) || "—",
  initials: createInitials(emp) || "?",
  email: emp.email ?? "",
  phone: emp.contact_number ?? "",
  avatar: emp.user_image ?? "",
  isActive: Boolean(emp.is_active),
  location: emp.current_address ?? "",
  projectCount: emp.project_count ?? emp.project_details?.length ?? 0,
  updatedAt: emp.modified_at ?? null,
});
