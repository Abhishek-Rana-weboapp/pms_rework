import z from "zod";

export const passwordLoginSchema = z.object({
  email: z.email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
})

export const otpLoginSchema = z.object({
  email: z.email("Enter a valid email address"),
});