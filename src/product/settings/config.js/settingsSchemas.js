import z from "zod";

// Schema for the profile (role/permission-set) add/edit form.
export const profileFormSchema = z.object({
  profile_name: z
    .string()
    .trim()
    .min(1, "Profile name is required")
    .max(80, "Profile name must be at most 80 characters"),
  description: z
    .string()
    .trim()
    .max(300, "Description must be at most 300 characters")
    .optional()
    .or(z.literal("")),
  permission_ids: z
    .array(z.number())
    .min(1, "Select at least one permission"),
});

export const profileFormDefaults = {
  profile_name: "",
  description: "",
  permission_ids: [],
};

export const profileSchema = z.object({
  first_name: z
    .string()
    .trim()
    .min(1, "First name is required")
    .max(50, "First name must be at most 50 characters")
    .regex(/^[A-Za-z ]+$/, "First name can only contain letters"),

  last_name: z
    .string()
    .trim()
    .max(50, "Last name must be at most 50 characters")
    .regex(/^[A-Za-z ]+$/, "Last name can only contain letters")
    .optional()
    .or(z.literal("")),

  contact_number: z
    .string()
    .trim()
    .or(z.literal(""))
    .pipe(
      z
        .string()
        .trim()
        .min(7, "Contact number must be at least 7 characters")
        .max(15, "Contact number must be at most 15 characters")
        .optional(),
    ),

  // DatePicker works in Date objects (or null when cleared), so validate a Date.
  date_of_birth: z
    .preprocess(
      (v) => (v === "" || v === null ? undefined : v),
      z.date({ error: "Invalid date" }).optional()
    )
    .superRefine((dob, ctx) => {
      // Empty DOB is allowed
      if (!dob) return;

      // No future dates
      if (dob > new Date()) {
        ctx.addIssue({
          code: "custom",
          message: "Date of birth cannot be in the future",
        });
        return;
      }

      // Age validation
      const today = new Date();
      let age = today.getFullYear() - dob.getFullYear();
      const monthDiff = today.getMonth() - dob.getMonth();

      if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < dob.getDate())
      ) {
        age--;
      }

      if (age < 18) {
        ctx.addIssue({
          code: "custom",
          message: "You must be at least 18 years old",
        });
      }
    }),
});



// Invite / edit user form. Validations ported from the legacy AddUsers form.
export const inviteUserSchema = z.object({
  first_name: z
    .string()
    .min(1, "First name is required")
    .max(60, "First name must be less than 60 characters")
    .regex(/^[^\d]+$/, "First name cannot contain numbers"),
  last_name: z
    .string()
    .min(1, "Last name is required")
    .max(60, "Last name must be less than 60 characters")
    .regex(/^[^\d]+$/, "Last name cannot contain numbers"),
  gender: z.string().optional(),
  // Selects hold their value as a string id; refine rejects the empty option.
  role: z
    .union([z.string(), z.number()])
    .refine((val) => val !== "", { message: "Role is required" }),
  profile: z
    .union([z.string(), z.number()])
    .refine((val) => val !== "", { message: "Profile is required" }),
  user_type: z.string().min(1, "User type is required"),
  email: z.email("Enter valid email"),
  contact_number: z.string().optional(),
  current_address: z
    .string()
    .max(300, "Address must be less than 300 characters")
    .optional(),
  branch: z.union([z.string(), z.number()]).optional(),
  is_add_to_branch: z.boolean().optional(),
});

export const inviteUserDefaults = {
  first_name: "",
  last_name: "",
  gender: "",
  role: "",
  profile: "",
  user_type: "",
  contact_number: "",
  email: "",
  current_address: "",
  branch: "",
  is_add_to_branch: false,
};

export const passwordSchema = z
  .object({
    old_password: z.string().min(1, "Current password is required"),
    new_password: z
      .string()
      .min(1, "New password is required")
      .min(8, "At least 8 characters")
      .regex(/[A-Z]/, "At least one uppercase letter (A-Z)")
      .regex(/[a-z]/, "At least one lowercase letter (a-z)")
      .regex(/[0-9]/, "At least one number (0-9)")
      .regex(/[!@#$%^&*]/, "At least one special character (!@#$%^&*)"),
    confirm_password: z.string().min(1, "Please confirm your new password"),
  })
  .refine((d) => !d.old_password || d.old_password !== d.new_password, {
    message: "New password cannot be the same as your current password",
    path: ["new_password"],
  })
  .refine((d) => !d.new_password || d.new_password === d.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  });


  export const roleSchema =z.object({
  role_name: z.string().trim().min(1, "Role name is required"),
  parent_role: z.number({
    required_error: "Parent role is required",
  }),
  shared_data_with_peers: z.enum(["yes", "no"], {
    errorMap: () => ({
      message: "Please select an option",
    }),
  }),
  description: z
    .string()
    .max(1000, "Description cannot be longer than 1000 characters")
    .optional(),
});



export const prioritySchema = z.object({
   priority: z.string().min(3, "Priority Name is required"),
   text_color : z.string().default("#374151"),
   bg_color:z.string().default("#E5E7EB")
});

export const projectTypeSchema = z.object({
   project_type: z.string().min(3, "Project Type Name is required"),
   text_color : z.string().default("#374151"),
   bg_color:z.string().default("#E5E7EB")
});


export const statusSchema = z.object({
  status_name: z.string().min(1, { error: "Status Name is required" }),
  category: z.string().min(1),
});


