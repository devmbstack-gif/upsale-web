import { Schema, model, models, type InferSchemaType, Types } from "mongoose";

const customerSchema = new Schema(
  {
    businessId: { type: Types.ObjectId, ref: "BusinessOwner", required: true, index: true },
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, default: null },
    consent: { type: Boolean, default: true },
    optedOut: { type: Boolean, default: false },
    scans: { type: Number, default: 0 },
    couponsRedeemed: { type: Number, default: 0 },
    visitCount: { type: Number, default: 0 },
    totalSpend: { type: Number, default: 0 },
    tags: { type: [String], default: [] },
    lastVisitAt: { type: Date, default: Date.now },
  },
  { timestamps: { createdAt: "joinedAt", updatedAt: true } },
);

export type CustomerDoc = InferSchemaType<typeof customerSchema>;
export const CustomerModel =
  models.Customer || model("Customer", customerSchema, "customers");
