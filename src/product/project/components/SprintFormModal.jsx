import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import React, { useEffect, useRef } from "react";
import { useSprintFormDialog } from "../context/SprintFormDialogStore";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";
import { DatePicker } from "@/shared/components/ui/date-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { sprintDefaultValues, sprintFormToApiPayload, sprintSchema, sprintToFormValues } from "../config/BacklogSchemas";
import { Textarea } from "@/shared/components/ui/textarea";
import { Button } from "@/shared/components/ui/button";
import { Spinner } from "@/shared/components/ui/spinner";
import {
  useCreateSprint,
  useUpdateSprint,
} from "../api/backlog/backlogMutations";

const isPopoverOpen = () =>
  !!document.querySelector(
    '[data-slot="select-content"],[data-radix-popper-content-wrapper]',
  );

const SprintFormModal = () => {
  const { sprintForm, closeSprintForm } = useSprintFormDialog();
  const { open, mode, sprint } = sprintForm;
  const isEdit = mode === "edit";

  const popoverWasOpenRef = useRef(false);

  useEffect(() => {
    const snapshot = () => {
      popoverWasOpenRef.current = isPopoverOpen();
    };

    document.addEventListener("pointerdown", snapshot, true);

    return () => document.removeEventListener("pointerdown", snapshot, true);
  }, []);

  const guardOutside = (e) => {
    if (popoverWasOpenRef.current) {
      e.preventDefault();
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && closeSprintForm()}>
      <DialogContent
        onPointerDownOutside={guardOutside}
        onInteractOutside={guardOutside}
      >
        <DialogHeader>
          <DialogTitle className="text-lg">
            {isEdit ? "Edit Sprint" : "Create Sprint"}
          </DialogTitle>
        </DialogHeader>

        {open && (
          <SprintFormBody
            key={isEdit ? `edit-${sprint?.id}` : "create"}
            mode={mode}
            sprint={sprint}
            onClose={closeSprintForm}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

const SprintFormBody = ({ mode, sprint, onClose }) => {
  const isEdit = mode === "edit";

  const createSprint = useCreateSprint({ onSuccess: onClose });
  const updateSprint = useUpdateSprint({ onSuccess: onClose });
  const isPending = createSprint.isPending || updateSprint.isPending;

  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(sprintSchema),
    defaultValues: isEdit ? sprintToFormValues(sprint) : sprintDefaultValues,
    mode: "onSubmit",
  });

  const duration = useWatch({
    control,
    name: "duration",
  });

  const startDate = useWatch({
    control,
    name: "start_date",
  });

  useEffect(() => {
    if (Number(duration) === 0) {
      return;
    }

    if (!startDate) {
      setValue("end_date", null, { shouldValidate: false });
      return;
    }

    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + Number(duration) * 7);

    setValue("end_date", endDate, {
      shouldValidate: false,
      shouldDirty: true,
    });
  }, [duration, startDate, setValue]);

  const handleSubmitForm = (data) => {
    const payload = sprintFormToApiPayload(
      data,
      isEdit ? { id: sprint?.id } : {},
    );

    if (isEdit) {
      updateSprint.mutate(payload);
      return;
    }

    createSprint.mutate(payload);
  };

  return (
    <form onSubmit={handleSubmit(handleSubmitForm)}>
      <FieldGroup>
        <FieldSet>
          <Field>
            <FieldLabel htmlFor="sprint_name">Sprint Name</FieldLabel>

            <Input id="sprint_name" autoComplete="off" {...register("sprint_name")} />

            {errors.sprint_name && (
              <FieldError>{errors.sprint_name.message}</FieldError>
            )}
          </Field>

          <div className="flex items-start gap-2">
            <Field className="flex-1">
              <FieldLabel>Start Date</FieldLabel>

              <Controller
                name="start_date"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    id="start_date"
                    value={field.value ?? undefined}
                    onChange={(date) => field.onChange(date ?? null)}
                    onBlur={field.onBlur}
                    ref={field.ref}
                  />
                )}
              />

              {errors.start_date && (
                <FieldError>{errors.start_date.message}</FieldError>
              )}
            </Field>

            <Field className="flex-1">
              <FieldLabel>End Date</FieldLabel>

              <Controller
                name="end_date"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    id="end_date"
                    value={field.value ?? undefined}
                    onChange={(date) => field.onChange(date ?? null)}
                    onBlur={field.onBlur}
                    ref={field.ref}
                    disabled={Number(duration) !== 0}
                  />
                )}
              />

              {errors.end_date && (
                <FieldError>{errors.end_date.message}</FieldError>
              )}
            </Field>
          </div>

          <Field>
            <FieldLabel>Duration</FieldLabel>

            <Controller
              name="duration"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value ?? ""}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger id="duration" className="w-full">
                    <SelectValue placeholder="Select Duration" />
                  </SelectTrigger>

                  <SelectContent position="popper">
                    {durationOptions.map((duration) => (
                      <SelectItem
                        value={String(duration.value)}
                        key={duration.value}
                      >
                        {duration.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />

            {errors.duration && (
              <FieldError>{errors.duration.message}</FieldError>
            )}
          </Field>

          <Field>
            <FieldLabel>Sprint Goal</FieldLabel>

            <Textarea
              placeholder="What does this sprint aim to deliver?"
              {...register("sprint_goal")}
            />

            {errors.sprint_goal && (
              <FieldError>{errors.sprint_goal.message}</FieldError>
            )}
          </Field>
        </FieldSet>
      </FieldGroup>

      <div className="mt-4 flex items-center justify-end gap-2">
        <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
          Cancel
        </Button>

        <Button type="submit" disabled={isPending}>
          {isPending && <Spinner />}
          {isEdit ? "Save Changes" : "Create Sprint"}
        </Button>
      </div>
    </form>
  );
};

export default SprintFormModal;

const durationOptions = [
  {
    label: "1 week",
    value: 1,
  },
  {
    label: "2 weeks",
    value: 2,
  },
  {
    label: "3 weeks",
    value: 3,
  },
  {
    label: "4 weeks",
    value: 4,
  },
  {
    label: "Custom",
    value: 0,
  },
];

// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
// } from "@/shared/components/ui/dialog";
// import React, { useEffect, useRef } from "react";
// import { useBacklogContext } from "../context/BacklogStore";
// import { Controller, useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import {
//   Field,
//   FieldError,
//   FieldGroup,
//   FieldLabel,
//   FieldSet,
// } from "@/shared/components/ui/field";
// import { Input } from "@/shared/components/ui/input";
// import { DatePicker } from "@/shared/components/ui/date-picker";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/shared/components/ui/select";
// import { sprintDefaultValues, sprintSchema } from "../config/BacklogSchemas";
// import { Textarea } from "@/shared/components/ui/textarea";
// import { Button } from "@/shared/components/ui/button";

// const isPopoverOpen = () =>
//   !!document.querySelector(
//     '[data-slot="select-content"],[data-radix-popper-content-wrapper]',
//   );

// const SprintFormModal = () => {
//   const { sprintModalOpen, closeCreateSprint } = useBacklogContext();

//   const {
//     register,
//     control,
//     handleSubmit,
//     formState: { errors },
//   } = useForm({
//     resolver: zodResolver(sprintSchema),
//     defaultValues: sprintDefaultValues,
//   });

//   const popoverWasOpenRef = useRef(false);
//   useEffect(() => {
//     const snapshot = () => {
//       popoverWasOpenRef.current = isPopoverOpen();
//     };
//     document.addEventListener("pointerdown", snapshot, true); // capture phase
//     return () => document.removeEventListener("pointerdown", snapshot, true);
//   }, []);

//   const guardOutside = (e) => {
//     // If the click also closed a popover, don't let it close the dialog too.
//     if (popoverWasOpenRef.current) e.preventDefault();
//   };

//   const handleCreate = async (data) => {
//     console.log(data);
//   };

//   return (
//     <Dialog  open={sprintModalOpen} onOpenChange={closeCreateSprint}>
//       <DialogContent
//         onPointerDownOutside={guardOutside}
//         onInteractOutside={guardOutside}
//       >
//         <DialogHeader>
//           <DialogTitle className={"text-lg"}>Create Sprint</DialogTitle>
//         </DialogHeader>
//         <form onSubmit={handleSubmit(handleCreate)}>
//           <div>
//             <FieldGroup>
//               <FieldSet>
//                 <Field>
//                   <FieldLabel>Sprint Name</FieldLabel>
//                   <Input {...register("sprint_name")} />
//                   {errors.sprint_name && (
//                     <FieldError>{errors.sprint_name.message}</FieldError>
//                   )}
//                 </Field>

//                 <div className="flex items-center gap-2">
//                   <Field>
//                     <FieldLabel>Start Date</FieldLabel>
//                     <Controller
//                       name="start_date"
//                       control={control}
//                       render={({ field }) => (
//                         <DatePicker
//                           id="start_date"
//                           value={field.value ?? undefined}
//                           onChange={(date) => field.onChange(date ?? null)}
//                           onBlur={field.onBlur}
//                           ref={field.ref}
//                         />
//                       )}
//                     />
//                     {errors.start_date && (
//                       <FieldError>{errors.start_date.message}</FieldError>
//                     )}
//                   </Field>

//                   <Field>
//                     <FieldLabel>End Date</FieldLabel>
//                     <Controller
//                       name="end_date"
//                       control={control}
//                       render={({ field }) => (
//                         <DatePicker
//                           id="end_date"
//                           value={field.value ?? undefined}
//                           onChange={(date) => field.onChange(date ?? null)}
//                           onBlur={field.onBlur}
//                           ref={field.ref}
//                         />
//                       )}
//                     />
//                     {errors.end_date && (
//                       <FieldError>{errors.end_date.message}</FieldError>
//                     )}
//                   </Field>
//                 </div>

//                 <Field>
//                   <FieldLabel>Sprint Name</FieldLabel>
//                   <Controller
//                     name="duration"
//                     control={control}
//                     render={({ field }) => (
//                       <Select
//                         value={field.value ? String(field.value) : ""}
//                         onValueChange={field.onChange}
//                       >
//                         <SelectTrigger id="duration" className="w-full">
//                           <SelectValue placeholder="Select Duration" />
//                         </SelectTrigger>
//                         <SelectContent position="popper">
//                           {durationOptions.map((duration) => {
//                             return (
//                               <SelectItem
//                                 value={String(duration.value)}
//                                 key={duration.value}
//                               >
//                                 {duration.label}
//                               </SelectItem>
//                             );
//                           })}
//                         </SelectContent>
//                       </Select>
//                     )}
//                   />
//                   {errors.duration && (
//                     <FieldError>{errors.duration.message}</FieldError>
//                   )}
//                 </Field>

//                 <Field>
//                   <FieldLabel>Sprint Goal</FieldLabel>
//                   <Textarea
//                     placeholder="What does this sprint aim to deliver?"
//                     {...register("sprint_goal")}
//                   />
//                   {errors.sprint_goal && (
//                     <FieldError>{errors.sprint_goal.message}</FieldError>
//                   )}
//                 </Field>
//               </FieldSet>
//             </FieldGroup>
//           </div>

//           <div className="flex justify-end items-center gap-2 mt-4">
//             <Button variant="outline">Cancel</Button>
//             <Button>Create Sprint</Button>
//           </div>
//         </form>
//       </DialogContent>
//     </Dialog>
//   );
// };

// export default SprintFormModal;

// const durationOptions = [
//   {
//     label: "1 week",
//     value: 1,
//   },
//   {
//     label: "2 week",
//     value: 2,
//   },
//   {
//     label: "3 week",
//     value: 3,
//   },
//   {
//     label: "4 week",
//     value: 4,
//   },
//   {
//     label: "Custom",
//     value: 0,
//   },
// ];
