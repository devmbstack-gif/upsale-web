import { NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/mongodb";
import { BusinessOwnerModel } from "@/lib/models/business-owner";

const schema = z.object({ username: z.string().trim().toLowerCase().min(3).max(30).regex(/^[a-z0-9._]+$/) });

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false, available: false, message: "Use 3-30 lowercase letters, numbers, periods, or underscores." }, { status: 400 });
  await connectDB();
  const exists = await BusinessOwnerModel.exists({ businessUsername: parsed.data.username });
  return NextResponse.json(exists
    ? { ok: false, available: false, message: "Username not available." }
    : { ok: true, available: true, message: "Username available." }, { status: exists ? 409 : 200 });
}
