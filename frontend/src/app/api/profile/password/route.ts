import bcrypt from "bcrypt";
import { NextResponse } from "next/server";
import { z } from "zod";
import { requireBusiness } from "@/lib/auth/require-business";
import { BusinessOwnerModel } from "@/lib/models/business-owner";

const bodySchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must include an uppercase letter")
      .regex(/[0-9]/, "Password must include a number"),
    confirmPassword: z.string().min(1, "Confirm your new password"),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .refine((values) => values.currentPassword !== values.newPassword, {
    message: "New password must be different from the current password",
    path: ["newPassword"],
  });

export async function POST(request: Request) {
  const auth = await requireBusiness();
  if ("error" in auth && auth.error) return auth.error;
  const { businessId } = auth as { businessId: string };

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    const first = parsed.error.issues[0]?.message ?? "Check your passwords and try again.";
    return NextResponse.json({ ok: false, message: first }, { status: 400 });
  }

  const owner = await BusinessOwnerModel.findById(businessId).select("+passwordHash");
  if (!owner?.passwordHash) {
    return NextResponse.json({ ok: false, message: "Account not found." }, { status: 404 });
  }

  const matches = await bcrypt.compare(parsed.data.currentPassword, owner.passwordHash);
  if (!matches) {
    return NextResponse.json(
      { ok: false, message: "Current password is incorrect." },
      { status: 401 },
    );
  }

  owner.passwordHash = await bcrypt.hash(parsed.data.newPassword, 12);
  owner.resetToken = null;
  owner.resetTokenExpiry = null;
  await owner.save();

  return NextResponse.json({ ok: true, message: "Password updated." });
}
