import { z } from "zod";
import {
  countryNames,
  currencyOptions,
  timezoneOptions,
  WORLD_COUNTRIES,
  type CountryOption,
} from "@/lib/data/countries";

export const businessCategories = [
  "Restaurant",
  "Salon",
  "Bakery",
  "Retail",
  "E-commerce",
  "Other",
] as const;

/** Prefer `countryNames` / `WORLD_COUNTRIES` — alias for older imports */
export const countries = countryNames;

export const currencies = currencyOptions.map((c) => c.code) as [string, ...string[]];

export const timezones = timezoneOptions as [string, ...string[]];

export const dialCodes = WORLD_COUNTRIES.filter((c) => c.name !== "Other").map((c) => ({
  country: c.name,
  code: c.dialCode,
  phoneExample: c.phoneExample,
}));

export const countryDefaults: Record<string, { currency: string; timezone: string; dialCode: string }> =
  Object.fromEntries(
    WORLD_COUNTRIES.map((c) => [
      c.name,
      { currency: c.currency, timezone: c.timezone, dialCode: c.dialCode },
    ]),
  );

export function getCountryDefaults(name: string): CountryOption | undefined {
  return WORLD_COUNTRIES.find((c) => c.name === name);
}

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

const countrySet = new Set(countryNames);
const currencySet = new Set(currencies);
const timezoneSet = new Set(timezones);

export const businessSchema = z
  .object({
    supportEmail: z.string().trim().email("Enter a valid support email"),
    category: z.enum(businessCategories, enumError("Select a business category")),
    categoryOther: z.string().optional(),
    country: z
      .string()
      .trim()
      .min(1, "Select a country")
      .refine((value) => countrySet.has(value), "Select a country"),
    currency: z
      .string()
      .trim()
      .min(1, "Currency is required")
      .refine((value) => currencySet.has(value), "Currency is required"),
    timezone: z
      .string()
      .trim()
      .min(1, "Select a timezone")
      .refine((value) => timezoneSet.has(value), "Select a timezone"),
    city: z.string().trim().min(2, "Enter your city or address"),
    logoPreview: z.string().optional(),
  })
  .superRefine((values, ctx) => {
    if (values.category !== "Other") return;
    const custom = values.categoryOther?.trim() ?? "";
    if (custom.length < 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Specify your business type",
        path: ["categoryOther"],
      });
    }
  });

/** Final category stored/submitted — custom text when "Other" is selected. */
export function resolveBusinessCategory(
  category: string,
  categoryOther?: string | null,
): string {
  if (category === "Other") return (categoryOther ?? "").trim();
  return category.trim();
}

export const submittedCategorySchema = z
  .string()
  .trim()
  .min(2, "Select a business category")
  .refine((value) => value !== "Other", "Specify your business type");

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
  "categoryOther",
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
