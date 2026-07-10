import z from "zod";

export const signupSchema = z.object({
  full_name: z
    .string()
    .min(1, "Full name is required")
    .max(35, "Must be 35 characters or fewer"),
  company_name: z
    .string()
    .min(1, "Company name is required")
    .max(35, "Must be 35 characters or fewer"),
  company_size: z.string().min(1, "Company size is required"),
  email: z.email("Enter a valid email").min(1, "Email is required"),
  contact_number: z.string().min(7, "Enter a valid phone number"),
  password: z
    .string()
    .min(1, "Password is required")
    .regex(
      /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/,
      "Must be 8+ chars with uppercase, lowercase, number & special character (!@#$%^&*)",
    ),
  agreeToTerms: z.literal(true, "You must agree to the Terms of Service")
});


export const defaultSignUpValues = {
     defaultValues: {
      full_name: "",
      company_name: "",
      company_size: "",
      email: "",
      contact_number: "",
      password: "",
      agreeToTerms: false,
    }
}