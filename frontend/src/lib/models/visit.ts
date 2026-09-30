import { Schema, model, models, type InferSchemaType, Types } from "mongoose";

const visitSchema = new Schema(
  {
    businessId: { type: Types.ObjectId, ref: "BusinessOwner", required: true, index: true },
    customerId: { type: Types.ObjectId, ref: "Customer", required: true, index: true },
    amount: { type: Number, default: 0 },
    category: { type: String, default: "", trim: true },
    note: { type: String, default: "", trim: true },
    visitedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

export type VisitDoc = InferSchemaType<typeof visitSchema>;
export const VisitModel = models.Visit || model("Visit", visitSchema, "visits");
