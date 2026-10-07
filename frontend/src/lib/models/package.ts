import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const countryPricingSchema = new Schema(
  {
    countryCode: { type: String, required: true, trim: true, uppercase: true },
    currency: { type: String, required: true, trim: true, uppercase: true },
    amount: { type: Number, required: true, min: 0 },
    interval: {
      type: String,
      enum: ["month", "year"],
      default: "month",
      required: true,
    },
  },
  { _id: false },
);

const packageLimitsSchema = new Schema(
  {
    offers: { type: Number, required: true, min: 0, default: 1 },
    customers: { type: Number, required: true, min: 0 },
    campaignsPerMonth: { type: Number, required: true, min: 0 },
    aiGenerations: { type: Number, required: true, min: 0 },
  },
  { _id: false },
);

const packageSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    shortDescription: { type: String, required: true, trim: true },
    featureBullets: { type: [String], default: [] },
    limits: { type: packageLimitsSchema, required: true },
    sortOrder: { type: Number, default: 0 },
    isMostPopular: { type: Boolean, default: false },
    isEnterprise: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    countryPricing: { type: [countryPricingSchema], default: [] },
  },
  { timestamps: true },
);

export type PackageDoc = InferSchemaType<typeof packageSchema>;

export const PackageModel =
  (models.Package as Model<PackageDoc> | undefined) ||
  model<PackageDoc>("Package", packageSchema, "packages");
