import { NextResponse } from "next/server";
import { requireBusiness } from "@/lib/auth/require-business";
import { BusinessOwnerModel } from "@/lib/models/business-owner";
import { callBackend } from "@/lib/server/backend";

export async function PUT(request: Request) {
  const auth = await requireBusiness();
  if ("error" in auth) return auth.error;
  const { businessId } = auth;

  const body = (await request.json().catch(() => null)) as {
    logoPreview?: string;
  } | null;
  const dataUrl = body?.logoPreview?.trim() ?? "";
  if (!dataUrl) {
    return NextResponse.json(
      { ok: false, message: "Choose an image to upload." },
      { status: 400 },
    );
  }

  const { response, data: saved } = await callBackend<{ url?: string; publicId?: string; message?: string }>(
    "/api/internal/media/logo",
    { businessId, dataUrl },
  );
  if (!response.ok || !saved.url || !saved.publicId) return NextResponse.json({ ok: false, message: saved.message ?? "Could not upload logo." }, { status: response.status });
  const profile = await BusinessOwnerModel.findByIdAndUpdate(
    businessId,
    { $set: { logoUrl: saved.url, logoPublicId: saved.publicId } },
    { new: true },
  )
    .select("-passwordHash -resetToken -resetTokenExpiry")
    .lean();

  return NextResponse.json({ ok: true, logoUrl: saved.url, profile });
}

export async function DELETE() {
  const auth = await requireBusiness();
  if ("error" in auth) return auth.error;
  const { businessId, owner } = auth;

  const previousPublicId = owner.logoPublicId ?? "";
  const profile = await BusinessOwnerModel.findByIdAndUpdate(
    businessId,
    { $set: { logoUrl: "", logoPublicId: "" } },
    { new: true },
  )
    .select("-passwordHash -resetToken -resetTokenExpiry")
    .lean();

  if (previousPublicId) {
    await callBackend("/api/internal/media/logo/delete", { publicId: previousPublicId }).catch(() => undefined);
  }

  return NextResponse.json({ ok: true, logoUrl: "", profile });
}
