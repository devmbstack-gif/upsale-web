import { NextResponse } from "next/server";
import { deleteLogoFile, saveLogoFromDataUrl } from "@/lib/auth/logo";
import { requireBusiness } from "@/lib/auth/require-business";
import { BusinessOwnerModel } from "@/lib/models/business-owner";

export async function PUT(request: Request) {
  const auth = await requireBusiness();
  if ("error" in auth && auth.error) return auth.error;
  const { businessId, owner } = auth as {
    businessId: string;
    owner: { logoUrl?: string };
  };

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

  const saved = await saveLogoFromDataUrl(dataUrl);
  if (!saved.ok) {
    return NextResponse.json({ ok: false, message: saved.message }, { status: 400 });
  }

  const previous = owner.logoUrl;
  const profile = await BusinessOwnerModel.findByIdAndUpdate(
    businessId,
    { $set: { logoUrl: saved.url } },
    { new: true },
  )
    .select("-passwordHash -resetToken -resetTokenExpiry")
    .lean();

  if (previous && previous !== saved.url) {
    await deleteLogoFile(previous);
  }

  return NextResponse.json({ ok: true, logoUrl: saved.url, profile });
}

export async function DELETE() {
  const auth = await requireBusiness();
  if ("error" in auth && auth.error) return auth.error;
  const { businessId, owner } = auth as {
    businessId: string;
    owner: { logoUrl?: string };
  };

  const previous = owner.logoUrl ?? "";
  const profile = await BusinessOwnerModel.findByIdAndUpdate(
    businessId,
    { $set: { logoUrl: "" } },
    { new: true },
  )
    .select("-passwordHash -resetToken -resetTokenExpiry")
    .lean();

  await deleteLogoFile(previous);

  return NextResponse.json({ ok: true, logoUrl: "", profile });
}
