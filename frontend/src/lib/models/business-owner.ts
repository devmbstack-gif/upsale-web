import { Schema, model, models, type InferSchemaType } from "mongoose";

const businessOwnerSchema = new Schema(
  {
    businessName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    isVerified: { type: Boolean, default: false },
    role: {
      type: String,
      enum: ["super_admin", "business_owner"],
      default: "business_owner",
      required: true,
    },
    supportEmail: { type: String, required: true, lowercase: true, trim: true },
    category: { type: String, required: true },
    country: { type: String, required: true },
    currency: { type: String, required: true },
    timezone: { type: String, required: true },
    city: { type: String, required: true, trim: true },
    logoUrl: { type: String, default: "" },
    whatsapp: { type: String, required: true },
    termsAccepted: { type: Boolean, required: true },
    marketingConsent: { type: Boolean, required: true },
    plan: { type: String, default: "Free Trial" },
    isSuspended: { type: Boolean, default: false },
    resetToken: { type: String, default: null },
    resetTokenExpiry: { type: Date, default: null },
  },
  { timestamps: true },
);

export type BusinessOwner = InferSchemaType<typeof businessOwnerSchema>;

export const BusinessOwnerModel =
  models.BusinessOwner || model("BusinessOwner", businessOwnerSchema, "businesses");
