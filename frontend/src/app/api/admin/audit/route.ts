import { AuditLogModel } from "@/lib/models/audit-log";
import { withSuperAdmin, jsonOk } from "@/lib/admin/api";

export async function GET(request: Request) {
  const auth = await withSuperAdmin();
  if ("error" in auth) return auth.error;

  const { searchParams } = new URL(request.url);
  const limit = Math.min(200, Math.max(1, Number(searchParams.get("limit") ?? 50)));

  const logs = await AuditLogModel.find()
    .sort({ timestamp: -1 })
    .limit(limit)
    .populate("userId", "email name")
    .lean();

  return jsonOk({
    logs: logs.map((log) => ({
      id: String(log._id),
      action: log.action,
      entity: log.entity,
      previousValue: log.previousValue,
      newValue: log.newValue,
      timestamp: log.timestamp,
      user:
        log.userId && typeof log.userId === "object" && "email" in log.userId
          ? {
              id: String((log.userId as { _id: unknown })._id),
              email: String((log.userId as { email: string }).email),
              name: String((log.userId as { name?: string }).name ?? ""),
            }
          : null,
    })),
  });
}
