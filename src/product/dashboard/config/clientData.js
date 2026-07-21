// Static option data for the Client list filters.
// Kept out of the components so the option lists are edited in one place.

// Status filter options. Sent server-side as the `status` query param (the
// active flag); "all" is treated as no filter.
export const CLIENT_STATUS_OPTIONS = [
  { value: "all", label: "All Status" },
  { value: "true", label: "Active" },
  { value: "false", label: "Inactive" },
];
