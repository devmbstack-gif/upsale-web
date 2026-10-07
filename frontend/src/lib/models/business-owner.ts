import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const businessOwnerSchema = new Schema(
  {
    businessName: { type: String, required: true, trim: true },
    businessNameKey: { type: String, trim: true, lowercase: true, unique: true, sparse: true, index: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    isVerified: { type: Boolean, default: false },
    role: {
      type: String,
      enum: ["super_admin", "business_owner"],
      default: "business_owner",
      required: true,
    },
    supportEmail: { type: String, default: "", lowercase: true, trim: true },
    category: { type: String, required: true },
    country: { type: String, required: true },
    currency: { type: String, required: true },
    timezone: { type: String, required: true },
    city: { type: String, required: true, trim: true },
    logoUrl: { type: String, default: "" },
    logoPublicId: { type: String, default: "" },
    whatsapp: { type: String, default: "" },
    termsAccepted: { type: Boolean, required: true },
    marketingConsent: { type: Boolean, required: true },
    plan: { type: String, default: "Free Trial" },
    planSlug: { type: String, default: "free-trial" },
    subscriptionStatus: { type: String, default: "trial" },
    trialStartedAt: { type: Date, default: null },
    trialEndsAt: { type: Date, default: null },
    trialGrantedOnce: { type: Boolean, default: false },
    trialPackageId: { type: Schema.Types.ObjectId, ref: "Package", default: null },
    stripeCustomerId: { type: String, default: "" },
    stripeSubscriptionId: { type: String, default: "" },
    googleLinked: { type: Boolean, default: false },
    googleLinkedAt: { type: Date, default: null },
    isSuspended: { type: Boolean, default: false },
    resetToken: { type: String, default: null },
    resetTokenExpiry: { type: Date, default: null },
  },
  { timestamps: true },
);

export type BusinessOwner = InferSchemaType<typeof businessOwnerSchema>;

export const BusinessOwnerModel =
  (models.BusinessOwner as Model<BusinessOwner> | undefined) ||
  model<BusinessOwner>("BusinessOwner", businessOwnerSchema, "businesses");
