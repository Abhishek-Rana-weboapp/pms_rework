// Static option data for the Audit Logs filters.
// Kept out of the component so the option lists are edited in one place.

// Modules the backend tags audit-log entries with. `value` is sent as the
// `module` filter param; `label` is the human-friendly rendering shown in the UI.
export const MODULES = [
  { value: "BRANCH", label: "Branch" },
  { value: "COMPANY SETTINGS", label: "Company Settings" },
  { value: "USERS", label: "Users" },
  { value: "ORGANIZATION", label: "Organization" },
  { value: "PROFILES", label: "Profiles" },
  { value: "ROLES", label: "Roles" },
  { value: "AUTH", label: "Auth" },
  { value: "USER_ORGANIZATION", label: "User Organization" },
  { value: "METADATA", label: "Metadata" },
  { value: "PROJECTS", label: "Projects" },
];
