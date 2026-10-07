import { NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/mongodb";
import { BusinessOwnerModel } from "@/lib/models/business-owner";
import { escapeRegex, normalizeBusinessName } from "@/lib/business-name";

const schema = z.object({ businessName: z.string().trim().min(2).max(100) });

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, available: false, message: "Enter a valid business name." }, { status: 400 });
  }
  await connectDB();
  const businessName = parsed.data.businessName.trim().replace(/\s+/g, " ");
  const key = normalizeBusinessName(businessName);
  const exists = await BusinessOwnerModel.exists({
    $or: [
      { businessNameKey: key },
      { businessName: { $regex: `^${escapeRegex(businessName)}$`, $options: "i" } },
    ],
  });
  return NextResponse.json(
    exists
      ? { ok: false, available: false, message: "A business with this name already exists." }
      : { ok: true, available: true, message: "Business name is available." },
    { status: exists ? 409 : 200 },
  );
}
