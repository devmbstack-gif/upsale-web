import { Schema, model, models } from "mongoose";

const otpSchema = new Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  purpose: { type: String, enum: ["signup", "password-reset"], default: "signup", required: true },
  code: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  sentAt: { type: Date, required: true },
  attempts: { type: Number, default: 0 },
});

otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const OtpModel = models.Otp || model("Otp", otpSchema, "otps");
