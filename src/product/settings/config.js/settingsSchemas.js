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


// ── Company settings: Organization Details tab ───────────────────────────────
// The logo is handled as a File outside RHF, so it isn't part of this schema.
export const orgDetailsSchema = z.object({
  company_name: z
    .string()
    .trim()
    .min(1, "Organization name is required")
    .max(150, "Organization name must be at most 150 characters"),
  company_size: z.string().min(1, "Company size is required"),
  description: z
    .string()
    .trim()
    .max(1000, "Description must be at most 1000 characters")
    .optional()
    .or(z.literal("")),
  contact_number: z
    .string()
    .trim()
    .min(7, "Enter a valid phone number")
    .max(20, "Enter a valid phone number"),
   website_link: z.url({
      protocol: /^https?$/,
      hostname: z.regexes.domain,
    }),
  timezone: z.string().min(1, "Timezone is required"),
  street_address: z.string().trim().min(1, "Street address is required"),
  pincode: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "Enter a valid 6-digit pincode"),
  state: z.string().trim().min(1, "State is required"),
  city: z.string().trim().min(1, "City is required"),
  country: z.string().min(1, "Country is required"),
});

export const orgDetailsDefaults = {
  company_name: "",
  company_size: "",
  description: "",
  contact_number: "",
  website_link: "",
  timezone: "",
  street_address: "",
  pincode: "",
  state: "",
  city: "",
  country: "",
};

// Map the org API record onto the Org Details form. Logo is excluded (see above).
export const mapApiToOrgDetails = (org = {}) => ({
  company_name: org?.company_name ?? "",
  company_size: org?.company_size ?? "",
  description: org?.description ?? "",
  contact_number: org?.contact_number ?? "",
  website_link: org?.website_link ?? "",
  timezone: org?.timezone ?? "",
  street_address: org?.street_address ?? "",
  pincode: org?.pincode != null ? String(org.pincode) : "",
  state: org?.state ?? "",
  city: org?.city ?? "",
  country: org?.country ?? "",
});


// ── Company settings: Schedule tab ───────────────────────────────────────────
// Times are "HH:mm" strings (native <input type="time">). NOTE: confirm the
// backend's time format — normalizeTime below trims a "HH:mm:ss" response to
// "HH:mm"; if the API expects seconds on write, append them in onSubmit.
const normalizeTime = (t) => (typeof t === "string" ? t.slice(0, 5) : "");

// working_days may arrive as an array or a JSON-encoded string (it's written
// with JSON.stringify), so accept both.
const parseWorkingDays = (v) => {
  if (Array.isArray(v)) return v;
  if (typeof v === "string" && v.trim()) {
    try {
      const parsed = JSON.parse(v);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
};

export const scheduleSchema = z
  .object({
    currency: z.string().min(1, "Currency is required"),
    start_time: z.string().min(1, "Start time is required"),
    end_time: z.string().min(1, "End time is required"),
    working_days: z.array(z.string()).min(1, "Select at least one working day"),
  })
  // Times are zero-padded "HH:mm", so a lexicographic compare is a time compare.
  .refine((d) => !d.start_time || !d.end_time || d.start_time < d.end_time, {
    message: "End time must be after start time",
    path: ["end_time"],
  });

export const scheduleDefaults = {
  currency: "",
  start_time: "",
  end_time: "",
  working_days: [],
};

export const mapApiToSchedule = (org = {}) => ({
  currency: org?.currency ?? "",
  start_time: normalizeTime(org?.start_time),
  end_time: normalizeTime(org?.end_time),
  working_days: parseWorkingDays(org?.working_days),
});


// ── Company settings: Branch add/edit form ───────────────────────────────────
// The logo is handled as a File outside RHF, so it isn't part of this schema.
// Ported from the legacy AddBranchModal: name/email/code/website are required,
// everything else is optional. Times are "HH:mm" strings (native time input).
export const branchSchema = z
  .object({
    branch_name: z.string().trim().min(1, "Branch name is required"),
    email: z
      .string()
      .trim()
      .min(1, "Email is required")
      .pipe(z.email("Enter a valid email")),
    branch_code: z.string().trim().min(1, "Branch code is required"),
    contact_number: z
      .string()
      .refine((val) => {
        const digits = (val || "").replace(/\D/g, "");
        // Empty or just a dial code (≤3 digits) counts as "not filled" → ok.
        if (digits.length <= 3) return true;
        // Once a number is typed it needs ≥7 digits total (incl. country code).
        return digits.length >= 7;
      }, "Enter a valid phone number")
      .optional()
      .or(z.literal("")),
    website_link: z.url({
      protocol: /^https?$/,
      hostname: z.regexes.domain,
    }),
    timezone: z.string().optional().or(z.literal("")),
    currency: z.string().optional().or(z.literal("")),
    working_days: z.array(z.string()).optional().default([]),
    start_time: z.string().optional().or(z.literal("")),
    end_time: z.string().optional().or(z.literal("")),
    pincode: z
      .string()
      .regex(/^\d{6}$/, "Pincode must be exactly 6 digits")
      .optional()
      .or(z.literal("")),
    country: z.string().optional().or(z.literal("")),
    state: z.string().optional().or(z.literal("")),
    city: z.string().optional().or(z.literal("")),
    street_address: z.string().optional().or(z.literal("")),
  })
  // Times are zero-padded "HH:mm", so a lexicographic compare is a time compare.
  .refine((d) => !d.start_time || !d.end_time || d.end_time > d.start_time, {
    message: "End time must be after start time",
    path: ["end_time"],
  });

export const branchDefaults = {
  branch_name: "",
  email: "",
  branch_code: "",
  contact_number: "",
  website_link: "",
  timezone: "",
  currency: "",
  working_days: [],
  start_time: "",
  end_time: "",
  pincode: "",
  country: "",
  state: "",
  city: "",
  street_address: "",
};

// Map a loaded branch record onto the branch form's shape. Logo is excluded
// (handled as a File in the component, mirroring the organization form).
export const mapApiToBranch = (branch = {}) => ({
  branch_name: branch?.branch_name ?? "",
  email: branch?.email ?? "",
  branch_code: branch?.branch_code ?? "",
  contact_number:
    branch?.contact_number != null ? String(branch.contact_number) : "",
  website_link: branch?.website_link ?? "",
  timezone: branch?.timezone ?? "",
  currency: branch?.currency ?? "",
  working_days: parseWorkingDays(branch?.working_days),
  start_time: normalizeTime(branch?.start_time),
  end_time: normalizeTime(branch?.end_time),
  pincode: branch?.pincode != null ? String(branch.pincode) : "",
  country: branch?.country ?? "",
  state: branch?.state ?? "",
  city: branch?.city ?? "",
  street_address: branch?.street_address ?? "",
});


