import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { FlattenMaps } from "mongoose";
import { connectDB } from "@/lib/mongodb";
import { BusinessOwnerModel, type BusinessOwner } from "@/lib/models/business-owner";
import { readSessionToken, SESSION_COOKIE } from "@/lib/auth/session";

type OwnerLean = FlattenMaps<BusinessOwner> & { _id: { toString(): string } };

export async function requireBusiness(): Promise<
  | { error: NextResponse }
  | { owner: OwnerLean; businessId: string }
> {
  await connectDB();
  const jar = await cookies();
  const session = readSessionToken(jar.get(SESSION_COOKIE)?.value);
  if (!session?.sub) {
    return { error: NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 }) };
  }
  const owner = (await BusinessOwnerModel.findById(session.sub).lean()) as OwnerLean | null;
  if (!owner?._id) {
    return { error: NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 }) };
  }
  if (owner.isSuspended) {
    return {
      error: NextResponse.json(
        { ok: false, message: "This account has been suspended." },
        { status: 403 },
      ),
    };
  }
  return { owner, businessId: String(owner._id) };
}
