import { Schema, model, models, type InferSchemaType, Types } from "mongoose";

const dealSchema = new Schema(
  {
    businessId: { type: Types.ObjectId, ref: "BusinessOwner", required: true, index: true },
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    templateName: { type: String, default: "", trim: true },
    discountLabel: { type: String, default: "", trim: true },
    audience: {
      type: String,
      enum: ["all", "new", "repeat", "vip", "at_risk", "custom"],
      default: "all",
    },
    customerIds: [{ type: Types.ObjectId, ref: "Customer" }],
    scheduleType: {
      type: String,
      enum: ["now", "once", "daily", "weekly"],
      default: "now",
    },
    scheduledAt: { type: Date, default: null },
    status: {
      type: String,
      enum: ["draft", "scheduled", "sending", "sent", "partial", "failed"],
      default: "draft",
    },
    sentAt: { type: Date, default: null },
    recipientCount: { type: Number, default: 0 },
    acceptedCount: { type: Number, default: 0 },
    failedCount: { type: Number, default: 0 },
    failureReason: { type: String, default: "" },
  },
  { timestamps: true },
);

export type DealDoc = InferSchemaType<typeof dealSchema>;
export const DealModel = models.Deal || model("Deal", dealSchema, "deals");
