import { useGlobalStatus } from "@/product/settings/api/settingsQueries";
import { Button } from "@/shared/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui/popover";
import { cn } from "@/shared/lib/utils";
import { Check, Plus, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Controller, useFieldArray, useFormContext } from "react-hook-form";

const COLOR_PALETTE = [
  "#94a3b8", // slate
  "#3b82f6", // blue
  "#22c55e", // green
  "#eab308", // yellow
  "#f97316", // orange
  "#ef4444", // red
  "#a855f7", // purple
  "#ec4899", // pink
];

const ProjectFormStepTwo = () => {
  const { control, setValue } = useFormContext();
  const { data: globalStatuses } = useGlobalStatus({});

  // Custom statuses -> repeatable, saved into the payload as custom_statuses[]
  const { fields, append, remove } = useFieldArray({
    control,
    name: "custom_statuses",
  });

  // Preselect all default statuses once, when they arrive.
  const [seeded, setSeeded] = useState(false);
  useEffect(() => {
    if (!seeded && globalStatuses?.length) {
      setValue(
        "selected_status_ids",
        globalStatuses.map((s) => s.id),
        { shouldDirty: false }
      );
      setSeeded(true);
    }
  }, [globalStatuses, seeded, setValue]);

  return (
    <div className="flex flex-col gap-6">
      {/* ---------- Default statuses ---------- */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">
            Default Statuses
          </h3>
          <Controller
            name="selected_status_ids"
            control={control}
            render={({ field }) => (
              <span className="text-xs text-muted-foreground">
                {field.value?.length ?? 0} selected
              </span>
            )}
          />
        </div>

        <Controller
          name="selected_status_ids"
          control={control}
          defaultValue={[]}
          render={({ field }) => {
            const selected = field.value ?? [];
            const toggle = (id) =>
              field.onChange(
                selected.includes(id)
                  ? selected.filter((x) => x !== id)
                  : [...selected, id]
              );

            return (
              <div className="flex flex-col gap-3">
                {globalStatuses?.map((status) => {
                  const isSelected = selected.includes(status.id);
                  const dotColor = status.color ?? "#94a3b8";
                  return (
                    <button
                      type="button"
                      key={status.id}
                      onClick={() => toggle(status.id)}
                      className={cn(
                        "flex items-center justify-between rounded-lg border bg-card px-4 py-3 text-left transition-colors",
                        isSelected
                          ? "border-primary/40 bg-muted/40"
                          : "border-border hover:bg-muted/30"
                      )}
                    >
                      <span className="flex items-center gap-3">
                        <span
                          className="grid h-9 w-9 place-items-center rounded-md"
                          style={{ backgroundColor: `${status.color}22` }}
                        >
                          <span
                            className="h-3.5 w-3.5 rounded-full"
                            style={{ backgroundColor: status.color }}
                          />
                        </span>
                        <span className="text-sm font-medium">
                          {status.status_name}
                        </span>
                      </span>

                      <span
                        className={cn(
                          "grid h-5 w-5 place-items-center rounded-full border transition-colors",
                          isSelected
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-muted-foreground/30"
                        )}
                      >
                        {isSelected && <Check className="h-3 w-3" />}
                      </span>
                    </button>
                  );
                })}
              </div>
            );
          }}
        />
      </div>

      {/* ---------- Custom statuses ---------- */}
      <div className="flex flex-col gap-3">
        <h3 className="text-sm font-semibold text-foreground">
          Custom Statuses
        </h3>

        {fields.map((f, index) => (
          <div
            key={f.id}
            className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3"
          >
            <span className="flex items-center gap-3">
              <span
                className="h-3.5 w-3.5 rounded-full"
                style={{ backgroundColor: f.color }}
              />
              <span className="text-sm font-medium">{f.name}</span>
            </span>
            <button
              type="button"
              onClick={() => remove(index)}
              className="text-muted-foreground hover:text-destructive"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}

        <CreateCustomStatus onAdd={(status) => append(status)} />
      </div>
    </div>
  );
};

/* Mini-form inside a Popover, triggered by the dashed "Create Custom Status" button */
const CreateCustomStatus = ({ onAdd }) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [color, setColor] = useState(COLOR_PALETTE[1]);
  const [error, setError] = useState("");

  const handleAdd = () => {
    if (!name.trim()) {
      setError("Status name is required");
      return;
    }
    onAdd({ name: name.trim(), color });
    setName("");
    setColor(COLOR_PALETTE[1]);
    setError("");
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border py-3 text-sm font-medium text-muted-foreground hover:bg-muted/30"
        >
          <Plus className="h-4 w-4" />
          Create Custom Status
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-72" align="start">
        <div className="flex flex-col gap-3">
          <Field className="gap-2" data-invalid={!!error}>
            <FieldLabel htmlFor="custom-status-name">Status name</FieldLabel>
            <Input
              id="custom-status-name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError("");
              }}
              placeholder="e.g. In Review"
              autoFocus
            />
            {error && <FieldError>{error}</FieldError>}
          </Field>

          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium">Color</span>
            <div className="flex flex-wrap gap-2">
              {COLOR_PALETTE.map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setColor(c)}
                  className={cn(
                    "h-6 w-6 rounded-full ring-offset-2 transition",
                    color === c && "ring-2 ring-primary"
                  )}
                  style={{ backgroundColor: c }}
                  aria-label={`Select color ${c}`}
                />
              ))}
            </div>
          </div>

          <Button type="button" size="sm" onClick={handleAdd}>
            Add status
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default ProjectFormStepTwo;
