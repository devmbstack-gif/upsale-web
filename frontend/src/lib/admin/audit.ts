import { Types } from "mongoose";
import { AuditLogModel, type AuditAction } from "@/lib/models/audit-log";

export async function writeAuditLog(input: {
  userId: string | Types.ObjectId;
  action: AuditAction;
  entity: string;
  previousValue?: unknown;
  newValue?: unknown;
}) {
  await AuditLogModel.create({
    userId: input.userId,
    action: input.action,
    entity: input.entity,
    previousValue: input.previousValue ?? null,
    newValue: input.newValue ?? null,
    timestamp: new Date(),
  });
}
