// Transforms the backend permission payload into the shape the profile form
// renders. The backend groups permissions by module:
//   { "user": [{ id, name, codename, content_type_id }, ...], ... }
//
// We store the permission `id` as the selectable value (that's what gets sent
// back when assigning permissions to a profile).

// "Can view artifact" -> "View artifact"; "Can add user" -> "Add user".
const humanizePermissionName = (name = "") => {
  const s = name.replace(/^can\s+/i, "").trim();
  return s.charAt(0).toUpperCase() + s.slice(1);
};

// "role_model" -> "Role Model"; "artifact_comment" -> "Artifact Comment".
const humanizeModuleLabel = (key = "") =>
  key
    .split("_")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

export const buildPermissionModules = (grouped) =>
  Object.entries(grouped ?? {}).map(([key, perms]) => ({
    key,
    label: humanizeModuleLabel(key),
    permissions: [...(perms ?? [])]
      .sort((a, b) => a.id - b.id)
      .map((p) => ({
        key: p.id,
        codename: p.codename,
        label: humanizePermissionName(p.name),
      })),
  }));

export const countPermissions = (modules) =>
  modules.reduce((total, m) => total + m.permissions.length, 0);
