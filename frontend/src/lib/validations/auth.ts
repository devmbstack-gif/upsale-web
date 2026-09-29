import { z } from "zod";

export const businessCategories = [
  "Restaurant",
  "Salon",
  "Bakery",
  "Retail",
  "E-commerce",
  "Other",
] as const;

export const countries = [
  "Pakistan",
  "India",
  "UAE",
  "Saudi Arabia",
  "UK",
  "USA",
  "Other",
] as const;

export const currencies = ["PKR", "INR", "AED", "SAR", "GBP", "USD", "EUR"] as const;

export const timezones = [
  "Asia/Karachi",
  "Asia/Kolkata",
  "Asia/Dubai",
  "Asia/Riyadh",
  "Europe/London",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "UTC",
] as const;

export const dialCodes = [
  { country: "Pakistan", code: "+92" },
  { country: "India", code: "+91" },
  { country: "UAE", code: "+971" },
  { country: "Saudi Arabia", code: "+966" },
  { country: "UK", code: "+44" },
  { country: "USA", code: "+1" },
] as const;

export const countryDefaults: Record<
  (typeof countries)[number],
  { currency: (typeof currencies)[number]; timezone: (typeof timezones)[number] }
> = {
  Pakistan: { currency: "PKR", timezone: "Asia/Karachi" },
  India: { currency: "INR", timezone: "Asia/Kolkata" },
  UAE: { currency: "AED", timezone: "Asia/Dubai" },
  "Saudi Arabia": { currency: "SAR", timezone: "Asia/Riyadh" },
  UK: { currency: "GBP", timezone: "Europe/London" },
  USA: { currency: "USD", timezone: "America/New_York" },
  Other: { currency: "USD", timezone: "UTC" },
};

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must include an uppercase letter")
  .regex(/[0-9]/, "Password must include a number");

export const accountSchema = z
  .object({
    businessName: z.string().trim().min(1, "Business name is required"),
    email: z.string().trim().email("Enter a valid business email"),
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Confirm your password"),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const enumError = (message: string) => ({
  errorMap: () => ({ message }),
});

export const businessSchema = z.object({
  supportEmail: z.string().trim().email("Enter a valid support email"),
  category: z.enum(businessCategories, enumError("Select a business category")),
  country: z.enum(countries, enumError("Select a country")),
  currency: z.enum(currencies, enumError("Currency is required")),
  timezone: z.enum(timezones, enumError("Select a timezone")),
  city: z.string().trim().min(2, "Enter your city or address"),
  logoPreview: z.string().optional(),
});

export const confirmSchema = z.object({
  dialCode: z.string().min(1, "Select a country code"),
  whatsappNumber: z
    .string()
    .trim()
    .regex(/^[0-9]{6,14}$/, "Enter a valid WhatsApp number without spaces"),
  acceptTerms: z.literal(true, enumError("Accept the terms and privacy policy to continue")),
  acceptConsent: z.literal(
    true,
    enumError("Confirm you will only message customers who opted in"),
  ),
});

export const signUpSchema = accountSchema.and(businessSchema).and(confirmSchema);

export type AccountValues = z.infer<typeof accountSchema>;
export type BusinessValues = z.infer<typeof businessSchema>;
export type ConfirmValues = z.infer<typeof confirmSchema>;
export type SignUpValues = z.infer<typeof signUpSchema>;

export const accountFields = [
  "businessName",
  "email",
  "password",
  "confirmPassword",
] as const;

export const businessFields = [
  "supportEmail",
  "category",
  "country",
  "currency",
  "timezone",
  "city",
] as const;

export const confirmFields = [
  "dialCode",
  "whatsappNumber",
  "acceptTerms",
  "acceptConsent",
] as const;

export const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid business email"),
  password: z.string().min(1, "Password is required"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email("Enter a valid business email"),
});

export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Confirm your password"),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type LoginValues = z.infer<typeof loginSchema>;
export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;
