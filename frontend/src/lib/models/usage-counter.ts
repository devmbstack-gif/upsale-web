import { Schema, model, models, type InferSchemaType, type Model, Types } from "mongoose";

const usageCounterSchema = new Schema(
  {
    businessId: { type: Types.ObjectId, required: true, index: true },
    period: { type: String, required: true },
    campaigns: { type: Number, default: 0, min: 0 },
    aiGenerations: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true },
);
usageCounterSchema.index({ businessId: 1, period: 1 }, { unique: true });

export type UsageCounter = InferSchemaType<typeof usageCounterSchema>;
export const UsageCounterModel =
  (models.UsageCounter as Model<UsageCounter> | undefined) ||
  model<UsageCounter>("UsageCounter", usageCounterSchema, "usage_counters");
