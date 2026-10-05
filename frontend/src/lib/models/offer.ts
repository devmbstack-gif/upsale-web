import { Schema, model, models, type InferSchemaType, Types } from "mongoose";

const offerSchema = new Schema(
  {
    businessId: { type: Types.ObjectId, ref: "BusinessOwner", required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    type: {
      type: String,
      enum: ["percent", "fixed", "reward", "bogo"],
      default: "percent",
    },
    value: { type: Number, default: 0 },
    rewardLabel: { type: String, default: null },
    rules: { type: String, default: "" },
    status: {
      type: String,
      enum: ["draft", "active", "paused", "expired"],
      default: "active",
    },
    shareSlug: { type: String, required: true, unique: true },
    scans: { type: Number, default: 0 },
    redemptions: { type: Number, default: 0 },
    expiresAt: { type: Date, default: null },
  },
  { timestamps: true },
);

export type OfferDoc = InferSchemaType<typeof offerSchema>;
export const OfferModel = models.Offer || model("Offer", offerSchema, "offers");
