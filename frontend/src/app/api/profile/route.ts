import { NextResponse } from "next/server";
import { requireBusiness } from "@/lib/auth/require-business";
import { BusinessOwnerModel } from "@/lib/models/business-owner";

export async function GET() {
  const auth = await requireBusiness();
  if ("error" in auth && auth.error) return auth.error;
  const { owner } = auth as { owner: Record<string, unknown> };
  const { passwordHash: _, resetToken: __, resetTokenExpiry: ___, ...safe } = owner as {
    passwordHash?: string;
    resetToken?: string;
    resetTokenExpiry?: Date;
  } & Record<string, unknown>;
  return NextResponse.json({ ok: true, profile: safe });
}

export async function PATCH(request: Request) {
  const auth = await requireBusiness();
  if ("error" in auth && auth.error) return auth.error;
  const { businessId } = auth as { businessId: string };
  const body = await request.json();
  const allowed = [
    "businessName",
    "supportEmail",
    "category",
    "country",
    "currency",
    "timezone",
    "city",
    "whatsapp",
  ] as const;
  const update: Record<string, unknown> = {};
  for (const key of allowed) {
    if (body[key] !== undefined) update[key] = body[key];
  }
  const profile = await BusinessOwnerModel.findByIdAndUpdate(
    businessId,
    { $set: update },
    { new: true },
  )
    .select("-passwordHash -resetToken -resetTokenExpiry")
    .lean();
  return NextResponse.json({ ok: true, profile });
}
