import bcrypt from "bcrypt";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { createSessionToken, SESSION_COOKIE, type SessionPayload } from "@/lib/auth/session";
import { BusinessOwnerModel } from "@/lib/models/business-owner";
import { connectDB } from "@/lib/mongodb";

const bodySchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});

export async function POST(request: Request) {
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, message: "Enter your email and password." }, { status: 400 });
  }

  const email = parsed.data.email.toLowerCase();

  try {
    await connectDB();
    const owner = await BusinessOwnerModel.findOne({ email });
    if (!owner) {
      return NextResponse.json({ ok: false, message: "Invalid email or password." }, { status: 401 });
    }

    if (!owner.isVerified) {
      return NextResponse.json(
        { ok: false, message: "This account is not verified yet. Finish signup first." },
        { status: 403 },
      );
    }

    const matches = await bcrypt.compare(parsed.data.password, owner.passwordHash);
    if (!matches) {
      return NextResponse.json({ ok: false, message: "Invalid email or password." }, { status: 401 });
    }

    const plan = owner.plan === "Free Trial" ? "Free Trial" : "Free Trial";
    const payload: SessionPayload = {
      sub: String(owner._id),
      email: owner.email,
      businessName: owner.businessName,
      plan,
      category: owner.category,
      country: owner.country,
      currency: owner.currency,
      timezone: owner.timezone,
      city: owner.city,
      whatsapp: owner.whatsapp,
      exp: Math.floor(Date.now() / 1000) + 14 * 24 * 60 * 60,
    };

    const jar = await cookies();
    jar.set(SESSION_COOKIE, createSessionToken(payload), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 14 * 24 * 60 * 60,
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { ok: false, message: "The database is not reachable. Start MongoDB and try again." },
      { status: 503 },
    );
  }
}
