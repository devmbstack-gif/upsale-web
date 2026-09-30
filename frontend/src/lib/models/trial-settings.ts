import { Schema, model, models, type InferSchemaType } from "mongoose";

const fairUsageCapsSchema = new Schema(
  {
    customers: { type: Number, default: 100, min: 0 },
    campaignsPerMonth: { type: Number, default: 5, min: 0 },
    aiGenerations: { type: Number, default: 20, min: 0 },
  },
  { _id: false },
);

const trialSettingsSchema = new Schema(
  {
    /** Singleton document key */
    key: { type: String, default: "default", unique: true },
    enabled: { type: Boolean, default: true },
    trialDays: { type: Number, default: 14, min: 1 },
    unlockedPackageId: { type: Schema.Types.ObjectId, ref: "Package", default: null },
    fairUsageCaps: { type: fairUsageCapsSchema, default: () => ({}) },
    paywallMessage: {
      type: String,
      default: "Your free trial has ended. Choose a plan to keep growing with UPSale.",
      trim: true,
    },
  },
  { timestamps: true },
);

export type TrialSettings = InferSchemaType<typeof trialSettingsSchema>;

export const TrialSettingsModel =
  models.TrialSettings || model("TrialSettings", trialSettingsSchema, "trial_settings");
