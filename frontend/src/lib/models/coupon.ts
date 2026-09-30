import { Schema, model, models, type InferSchemaType, Types } from "mongoose";

const couponSchema = new Schema(
  {
    businessId: { type: Types.ObjectId, ref: "BusinessOwner", required: true, index: true },
    offerId: { type: Types.ObjectId, ref: "Offer", required: true },
    customerId: { type: Types.ObjectId, ref: "Customer", required: true },
    code: { type: String, required: true, unique: true },
    status: {
      type: String,
      enum: ["issued", "redeemed", "expired"],
      default: "issued",
    },
    issuedAt: { type: Date, default: Date.now },
    redeemedAt: { type: Date, default: null },
    expiresAt: { type: Date, default: null },
  },
  { timestamps: true },
);

export type CouponDoc = InferSchemaType<typeof couponSchema>;
export const CouponModel = models.Coupon || model("Coupon", couponSchema, "coupons");
