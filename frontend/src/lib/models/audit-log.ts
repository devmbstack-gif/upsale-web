import { Schema, model, models, type InferSchemaType } from "mongoose";

export const AUDIT_ACTIONS = [
  "UPDATE_PACKAGE",
  "CREATE_PACKAGE",
  "DELETE_PACKAGE",
  "UPDATE_BUSINESS",
  "CHANGE_PLATFORM_KEY",
  "UPDATE_TRIAL_SETTINGS",
  "UPDATE_CMS_SECTION",
  "PUBLISH_CMS_SECTION",
  "ROLLBACK_CMS_SECTION",
  "SEED_ADMIN",
  "LOGIN_ADMIN",
] as const;

export type AuditAction = (typeof AUDIT_ACTIONS)[number] | string;

const auditLogSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    action: { type: String, required: true, index: true },
    entity: { type: String, required: true, trim: true },
    previousValue: { type: Schema.Types.Mixed, default: null },
    newValue: { type: Schema.Types.Mixed, default: null },
    timestamp: { type: Date, default: Date.now, index: true },
  },
  { timestamps: false },
);

export type AuditLog = InferSchemaType<typeof auditLogSchema>;

export const AuditLogModel =
  models.AuditLog || model("AuditLog", auditLogSchema, "audit_logs");
