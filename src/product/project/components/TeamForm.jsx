import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { useEmployees } from "@/product/dashboard/api/queries";
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  useComboboxAnchor,
} from "@/shared/components/ui/combobox";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/shared/components/ui/field";
import { Spinner } from "@/shared/components/ui/spinner";
import { createFullName, createInitials } from "@/shared/lib/helpers";
import { useGetTeams } from "../api/team/teamQueries";
import { useAssignDevelopers } from "../api/team/teamMutations";

// `GET project/:id/team/` returns flat employee rows — `{ id, first_name,
// last_name, email, role, profile, ... }`. Every row is round-tripped, the
// project's manager included: the API expects their id in `assign_developers`
// alongside the developers, so filtering any profile out would drop that person
// from the team on save.

const TeamForm = ({ onSuccess, onCancel }) => {
  const { data: employeesData, isLoading: employeesLoading } = useEmployees({
    pageSize: 1000,
  });
  const { data: team, isLoading: teamLoading } = useGetTeams();

  const [selected, setSelected] = useState([]);
  const [validationError, setValidationError] = useState("");

  // The popup has to be portaled inside the dialog, otherwise Radix's modal
  // `pointer-events: none` on <body> makes the options unclickable.
  const popupContainerRef = useRef(null);
  const chipsAnchorRef = useComboboxAnchor();

  // `{ label, value }` is the shape Base UI understands natively — it uses the
  // label for filtering and the value for submission with no extra config.
  //
  // The lookup is built alongside the options so a team row can be resolved to
  // the very same option object the dropdown renders. That identity is the whole
  // point: it carries the employee id `assign_developers` expects, and it lets
  // Base UI recognise a pre-selected developer as already selected.
  const developerOptions = [];
  const optionByKey = new Map();
  for (const employee of employeesData?.results ?? []) {
    const option = {
      label: createFullName(employee) || employee.email || `#${employee.id}`,
      value: employee.id,
    };
    developerOptions.push(option);

    if (employee.id != null) optionByKey.set(`id:${employee.id}`, option);
    if (employee.uuid) optionByKey.set(`uuid:${employee.uuid}`, option);
    if (employee.email) {
      optionByKey.set(`email:${String(employee.email).toLowerCase()}`, option);
    }
  }

  // The team endpoint and the employee list use different serializers AND
  // different id spaces, so a team row is resolved by uuid/email as well as id.
  // Matching on id alone left the chip holding a value no dropdown option shared,
  // which is why re-picking a pre-selected developer added a duplicate instead of
  // toggling them off. The team-derived fallback only applies when no employee
  // record matches at all, so a chip is never silently dropped.
  const resolveMemberOption = (member) =>
    optionByKey.get(`id:${member.id}`) ??
    optionByKey.get(`uuid:${member.uuid}`) ??
    (member.email
      ? optionByKey.get(`email:${String(member.email).toLowerCase()}`)
      : undefined) ??
    (member.id != null
      ? {
          label: createFullName(member) || member.email || `#${member.id}`,
          value: member.id,
        }
      : null);

  const assignedOptions = [];
  {
    const seen = new Set();
    for (const member of team ?? []) {
      const option = resolveMemberOption(member);
      if (!option || seen.has(String(option.value))) continue;

      seen.add(String(option.value));
      assignedOptions.push(option);
    }
  }

  // A fallback option (a team member with no matching employee record) would
  // otherwise live only in `selected`, never in the list the dropdown renders —
  // so there'd be no row to tick, and picking that person from the list would add
  // a second entry for them. Folding the extras into `items` keeps one option
  // object behind the chip, the tick, and the toggle.
  const knownValues = new Set(
    developerOptions.map((option) => String(option.value)),
  );
  const extras = assignedOptions.filter(
    (option) => !knownValues.has(String(option.value)),
  );
  const comboboxItems = extras.length
    ? [...extras, ...developerOptions]
    : developerOptions;

  const isLoadingData = employeesLoading || teamLoading;

  // Seed the current team once, so the PUT below resends the existing members
  // instead of letting the API drop them. Guarded by a ref rather than keyed off
  // `selected` so a user who clears everything isn't re-seeded on the next render.
  const hasSeededRef = useRef(false);
  useEffect(() => {
    if (hasSeededRef.current || isLoadingData) return;
    hasSeededRef.current = true;
    setSelected(assignedOptions);
  }, [isLoadingData, assignedOptions]);

  const assignDevelopers = useAssignDevelopers({
    onSuccess: () => {
      toast.success("Developer(s) assigned successfully");
      onSuccess?.();
    },
  });

  const selectedIds = new Set(selected.map((option) => String(option.value)));

  const handleSelectionChange = (value) => {
    setSelected(value);
    if (value.length > 0) setValidationError("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (selected.length === 0) {
      setValidationError("Please select at least one developer.");
      return;
    }

    // Every id goes on the wire, pre-selected members included — the endpoint
    // replaces the team, so anyone left out here is removed from the project.
    // De-duplicated so a repeated id can never reach the API.
    assignDevelopers.mutate([
      ...new Set(selected.map((option) => option.value)),
    ]);
  };

  if (isLoadingData) {
    return (
      <div className="flex items-center justify-center py-10">
        <Spinner />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} ref={popupContainerRef}>
      {team?.length > 0 && (
        <div className="mb-6">
          <p className="mb-2 text-xs font-medium uppercase text-muted-foreground">
            Current team
          </p>

          {/* Shows exactly three rows, then scrolls: max-h-35 (140px) is
              3 * h-10 rows + 2 * gap-2.5 gaps. Rows are a fixed height so that
              arithmetic holds regardless of whether a member has a role line.
              The scroll container stays on the list rather than the form or the
              dialog, because wrapping the form would clip the combobox popup
              that gets portaled into it. */}
          <ul className="flex max-h-35 flex-col gap-2.5 overflow-y-auto pr-1 scrollbar-thin">
            {team.map((member) => {
              const isManager = member.profile === "manager";
              // Compared through the resolved option, not `member.id` — selection
              // is keyed by employee id, which isn't the same id space the team
              // endpoint returns. Applies to the manager as well, since they're
              // part of the assignment and can be deselected like anyone else.
              const memberOption = resolveMemberOption(member);
              const isDropped =
                !!memberOption &&
                !selectedIds.has(String(memberOption.value));

              return (
                <li
                  key={member.id}
                  className="flex h-10 shrink-0 items-center gap-2.5"
                >
                  <Avatar className="size-8">
                    <AvatarImage
                      src={member.user_image ?? undefined}
                      alt={createFullName(member)}
                    />
                    <AvatarFallback className="text-xs">
                      {createInitials(member)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">
                      {createFullName(member)}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {member.role || member.email}
                    </p>
                  </div>

                  {isManager && <Badge variant="secondary">Manager</Badge>}
                  {isDropped && (
                    <Badge variant="destructive">Will be removed</Badge>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <Field>
        <FieldLabel>Select Developers</FieldLabel>

        <Combobox
          multiple
          items={comboboxItems}
          value={selected}
          onValueChange={handleSelectionChange}
          // Options are rebuilt on every employees refetch, so identity can't be
          // relied on to tell an already-selected developer from a fresh one.
          isItemEqualToValue={(a, b) => a?.value === b?.value}
        >
          <ComboboxChips ref={chipsAnchorRef}>
            {selected.map((option) => (
              <ComboboxChip key={option.value} aria-label={option.label}>
                {option.label}
              </ComboboxChip>
            ))}

            <ComboboxChipsInput
              placeholder={
                selected.length ? "" : "Search and select developers..."
              }
              aria-invalid={!!validationError || undefined}
            />
          </ComboboxChips>

          <ComboboxContent
            anchor={chipsAnchorRef}
            container={popupContainerRef}
          >
            <ComboboxEmpty>No developers found</ComboboxEmpty>
            <ComboboxList>
              {(option) => (
                <ComboboxItem key={option.value} value={option}>
                  {option.label}
                </ComboboxItem>
              )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>

        {validationError ? (
          <FieldError>{validationError}</FieldError>
        ) : (
          <FieldDescription>
            Developers already on the team are pre-selected. Removing one here
            removes them from the project.
          </FieldDescription>
        )}
      </Field>

      <div className="mt-6 flex items-center justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => onCancel?.()}
          disabled={assignDevelopers.isPending}
        >
          Cancel
        </Button>

        <Button type="submit" disabled={assignDevelopers.isPending}>
          {assignDevelopers.isPending && <Spinner />}
          Save Team
        </Button>
      </div>
    </form>
  );
};

export default TeamForm;
