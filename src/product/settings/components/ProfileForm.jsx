import { useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Check, ChevronDown, SearchIcon } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Badge } from "@/shared/components/ui/badge";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/shared/components/ui/field";
import {
  buildPermissionModules,
  countPermissions,
} from "../config.js/permissions";
import {
  profileFormDefaults,
  profileFormSchema,
} from "../config.js/settingsSchemas";
import { useProfile, usePermissions } from "../api/settingsQueries";
import { useCreateProfile, useUpdateProfile } from "../api/profileMutations";
import Wrapper from "@/shared/components/wrappers/Wrapper";
import { Spinner } from "@/shared/components/ui/spinner";

// A single square checkbox + label, controlled by `checked`.
const PermissionCheckbox = ({ label, checked, onChange }) => (
  <label className="flex cursor-pointer items-center gap-2 text-sm">
    {/* A real, visible checkbox styled directly with appearance-none. Because
        it stays in view (not clipped/off-screen), focusing it on click never
        scroll-jumps the container. The check icon overlays it via peer-checked. */}
    <span className="relative flex size-4 shrink-0 items-center justify-center">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="peer size-4 cursor-pointer appearance-none rounded border border-input bg-background transition-colors checked:border-primary checked:bg-primary"
      />
      <Check className="pointer-events-none absolute size-3 text-primary-foreground opacity-0 peer-checked:opacity-100" />
    </span>
    <span className={cn(checked ? "text-foreground" : "text-muted-foreground")}>
      {label}
    </span>
  </label>
);

const ModuleCard = ({
  module,
  selected,
  onToggle,
  onToggleAll,
  open,
  onToggleOpen,
  query,
}) => {
  const q = query.trim().toLowerCase();
  const perms = q
    ? module.permissions.filter((p) => p.label.toLowerCase().includes(q))
    : module.permissions;

  // Hide modules with no matching permission while searching.
  if (q && perms.length === 0) return null;

  const total = module.permissions.length;
  const selectedCount = module.permissions.filter((p) =>
    selected.includes(p.key),
  ).length;
  const allSelected = selectedCount === total;
  const pct = total ? Math.round((selectedCount / total) * 100) : 0;
  // Force-open while searching so matches are visible.
  const isOpen = q ? true : open;

  return (
    <div className="rounded-xl border bg-white">
      <div className="flex items-center justify-between gap-4 sm:p-4 p-2">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted text-sm font-medium text-muted-foreground">
            {module.label[0]}
          </div>
          <div className="min-w-0">
            <div className="truncate font-semibold text-foreground">
              {module.label}
            </div>
            <div className="text-xs text-muted-foreground">
              {selectedCount === 0
                ? "No permissions selected"
                : `${selectedCount} permission${selectedCount > 1 ? "s" : ""} selected`}
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <div className="hidden items-center gap-2 sm:flex">
            <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="text-xs text-muted-foreground">
              {selectedCount}/{total}
            </span>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onToggleAll(module, !allSelected)}
          >
            {allSelected ? "Deselect all" : "Select all"}
          </Button>
          <button
            type="button"
            onClick={() => onToggleOpen(module.key)}
            aria-label={isOpen ? "Collapse" : "Expand"}
            className="flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted"
          >
            <ChevronDown
              className={cn(
                "size-4 transition-transform",
                !isOpen && "-rotate-90",
              )}
            />
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="grid grid-cols-1 gap-x-6 gap-y-3 border-t sm:p-4 p-2 sm:grid-cols-2 lg:grid-cols-3">
          {perms.map((p) => (
            <PermissionCheckbox
              key={p.key}
              label={p.label}
              checked={selected.includes(p.key)}
              onChange={() => {
                console.log("clicked")
                onToggle(p.key);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const ProfileForm = () => {
  // React Hook Form drives uncontrolled inputs via refs / render-time side
  // effects, which the React Compiler's memoization breaks (prefilled values
  // wouldn't reach the inputs). Opt out — same reason the DataTable components do.
  "use no memo";

  const navigate = useNavigate();
  const { orgUuid, profileId } = useParams();
  const isEdit = !!profileId;
  const listPath = `/${orgUuid}/profile-settings/profile`;

  const { data: profile } = useProfile(profileId);
  const { data: permissionData, isLoading: permissionsLoading } =
    usePermissions();

  const modules = useMemo(
    () => buildPermissionModules(permissionData ?? {}),
    [permissionData],
  );
  const totalPermissionCount = useMemo(
    () => countPermissions(modules),
    [modules],
  );

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(profileFormSchema),
    defaultValues: profileFormDefaults,
    // Reactively prefill in edit mode as the profile loads. `keepDirtyValues`
    // stops a background refetch from clobbering edits already in progress.
    values: profile && {
      profile_name: profile.profile_name ?? "",
      description: profile.description ?? "",
      permission_ids: profile.assigned_permissions ?? [],
    },
    resetOptions: { keepDirtyValues: true },
  });

  // Reactive value for rendering (checked states, counts). useWatch is the
  // React-Compiler-friendly subscription.
  const permissions = useWatch({ control, name: "permission_ids" }) ?? [];
  const setPermissions = (next) =>
    setValue("permission_ids", next, { shouldDirty: true });

  // Handlers read the latest value from getValues() rather than closing over
  // the rendered `permissions`, so they never act on a stale snapshot.
  const togglePermission = (key) => {
    
    
    const current = getValues("permission_ids") ?? [];
    console.log(key);
    console.log(current.includes(key));
    setPermissions(
      current.includes(key)
        ? current.filter((k) => k !== key)
        : [...current, key],
    );
  };

  const toggleModule = (module, selectAll) => {
    const keys = module.permissions.map((p) => p.key);
    const current = getValues("permission_ids") ?? [];
    setPermissions(
      selectAll
        ? [...new Set([...current, ...keys])]
        : current.filter((k) => !keys.includes(k)),
    );
  };
  const [query, setQuery] = useState("");
  const [collapsed, setCollapsed] = useState(() => new Set());

  const toggleOpen = (key) =>
    setCollapsed((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });

  const allCollapsed = collapsed.size === modules.length;
  const toggleCollapseAll = () =>
    setCollapsed(allCollapsed ? new Set() : new Set(modules.map((m) => m.key)));

  const createMutation = useCreateProfile({
    onSuccess: () => {
      toast.success("Profile created");
      navigate(listPath);
    },
  });
  const updateMutation = useUpdateProfile({
    onSuccess: () => {
      toast.success("Profile updated");
      navigate(listPath);
    },
  });
  const isPending = createMutation.isPending || updateMutation.isPending;

  const onSubmit = (data) => {
    if (isEdit) updateMutation.mutate({ id: profileId, data });
    else createMutation.mutate(data);
  };

  const selectedCount = useMemo(() => permissions.length, [permissions]);

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex h-full flex-col overflow-hidden"
    >
      {/* Scrollable area */}
      <div className="flex-1 overflow-y-auto">
        <Wrapper className={"space-y-6"}>
          {/* Header */}
          <div className="sticky top-0 z-10 rounded-xl border bg-background sm:p-4 p-2 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => navigate(listPath)}
                  aria-label="Back to profiles"
                  className="flex size-9 items-center justify-center rounded-md border text-muted-foreground hover:bg-muted"
                >
                  <ArrowLeft className="size-4" />
                </Button>

                <div>
                  <h1 className="text-lg font-semibold">
                    {isEdit ? "Edit profile" : "Add profile"}
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Assign or update permissions for employee access.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <span className="text-sm text-muted-foreground">
                  <b className="font-semibold text-foreground">
                    {selectedCount}
                  </b>{" "}
                  of {totalPermissionCount} permissions
                </span>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(listPath)}
                >
                  Cancel
                </Button>

                <Button type="submit" disabled={isPending}>
                  {isPending
                    ? "Saving..."
                    : isEdit
                      ? "Save changes"
                      : "Create profile"}
                </Button>
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="rounded-xl border bg-background p-5">
            <FieldGroup className="grid gap-4 sm:grid-cols-2">
              <Field data-invalid={!!errors.profile_name}>
                <FieldLabel htmlFor="profile_name">Profile name <span className="text-red-500 text-sm">*</span></FieldLabel>

                <Input
                  id="profile_name"
                  placeholder="e.g. Regional Manager"
                  className={"max-sm:placeholder:text-sm text-sm sm:text-base"}
                  {...register("profile_name")}
                />

                {errors.profile_name && (
                  <FieldError>{errors.profile_name.message}</FieldError>
                )}
              </Field>

              <Field data-invalid={!!errors.description}>
                <FieldLabel htmlFor="description">Description</FieldLabel>

                <Input
                  id="description"
                  placeholder="Briefly describe what this profile can do"
                  className={"max-sm:placeholder:text-sm text-sm sm:text-base"}
                  {...register("description")}
                />

                {errors.description && (
                  <FieldError>{errors.description.message}</FieldError>
                )}
              </Field>
            </FieldGroup>
          </div>

          {/* Permissions */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="flex sm:items-center items-start flex-col sm:flex-row sm:gap-2 gap-1" >
                  <h2 className="font-semibold">Permissions</h2>
                  <Badge variant="secondary" className={"max-sm:p-0"}>{modules.length} modules</Badge>
                </div>
                {errors.permission_ids && (
                  <span className="text-sm text-destructive">
                    {errors.permission_ids.message}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="relative bg-white">
                  <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search permissions"
                    className="sm:w-56 w-32 pl-8 max-sm:placeholder:text-sm text-sm sm:text-base"
                  />
                </div>

                <Button
                  type="button"
                  variant="outline"
                  onClick={toggleCollapseAll}
                >
                  {allCollapsed ? "Expand all" : "Collapse all"}
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              {permissionsLoading && modules.length === 0 ? (
                <div className="rounded-xl border bg-background p-6 text-center text-sm text-muted-foreground">
                  <Spinner />
                </div>
              ) : (
                modules.map((module) => (
                  <ModuleCard
                    key={module.key}
                    module={module}
                    selected={permissions}
                    onToggle={togglePermission}
                    onToggleAll={toggleModule}
                    open={!collapsed.has(module.key)}
                    onToggleOpen={toggleOpen}
                    query={query}
                  />
                ))
              )}
            </div>
          </div>
        </Wrapper>
      </div>
    </form>
  );
};

export default ProfileForm;
