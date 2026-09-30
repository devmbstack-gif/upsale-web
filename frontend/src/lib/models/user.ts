import { Schema, model, models, type InferSchemaType } from "mongoose";

export const USER_ROLES = ["super_admin", "business_owner"] as const;
export type UserRole = (typeof USER_ROLES)[number];

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    role: {
      type: String,
      enum: USER_ROLES,
      default: "business_owner",
      required: true,
      index: true,
    },
    isActive: { type: Boolean, default: true },
    /** Optional link when role is business_owner */
    businessId: { type: Schema.Types.ObjectId, ref: "BusinessOwner", default: null },
  },
  { timestamps: true },
);

export type User = InferSchemaType<typeof userSchema>;

export const UserModel = models.User || model("User", userSchema, "users");
