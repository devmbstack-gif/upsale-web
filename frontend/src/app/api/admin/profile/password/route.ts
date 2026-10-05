import bcrypt from "bcrypt";
import { NextResponse } from "next/server";
import { z } from "zod";
import { writeAuditLog } from "@/lib/admin/audit";
import { requireSuperAdmin } from "@/lib/auth/require-super-admin";
import { UserModel } from "@/lib/models/user";

const schema = z.object({
  currentPassword: z.string().min(1, "Current password is required."),
  newPassword: z.string().min(8, "Use at least 8 characters.").regex(/[A-Z]/, "Include an uppercase letter.").regex(/[0-9]/, "Include a number."),
  confirmPassword: z.string().min(1, "Confirm your new password."),
}).refine((value) => value.newPassword === value.confirmPassword, {
  message: "Passwords do not match.", path: ["confirmPassword"],
}).refine((value) => value.currentPassword !== value.newPassword, {
  message: "New password must be different from the current password.", path: ["newPassword"],
});

export async function POST(request: Request) {
  const auth = await requireSuperAdmin();
  if ("error" in auth) return auth.error;
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false, message: parsed.error.issues[0]?.message ?? "Check the password fields." }, { status: 400 });

  const admin = await UserModel.findById(auth.adminId).select("+passwordHash role isActive");
  if (!admin || admin.role !== "super_admin" || admin.isActive === false) {
    return NextResponse.json({ ok: false, message: "Admin account is unavailable." }, { status: 404 });
  }
  const matches = await bcrypt.compare(parsed.data.currentPassword, admin.passwordHash);
  if (!matches) return NextResponse.json({ ok: false, message: "Current password is incorrect." }, { status: 401 });

  admin.passwordHash = await bcrypt.hash(parsed.data.newPassword, 12);
  await admin.save();
  await writeAuditLog({ userId: admin._id, action: "CHANGE_ADMIN_PASSWORD", entity: `User:${admin._id}` });
  return NextResponse.json({ ok: true, message: "Admin password changed successfully." });
}
