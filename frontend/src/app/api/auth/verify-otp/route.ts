import bcrypt from "bcrypt";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { saveLogo } from "@/lib/auth/logo";
import { checkOtp, clearOtp } from "@/lib/auth/otp";
import { createSessionToken, SESSION_COOKIE, type SessionPayload } from "@/lib/auth/session";
import { BusinessOwnerModel } from "@/lib/models/business-owner";
import { connectDB } from "@/lib/mongodb";
import { businessCategories, countries, currencies, timezones } from "@/lib/validations/auth";

const bodySchema = z.object({
  email: z.string().trim().email(),
  code: z.string().regex(/^\d{6}$/),
  businessName: z.string().trim().min(1),
  password: z.string().min(8).regex(/[A-Z]/).regex(/[0-9]/),
  supportEmail: z.string().trim().email(),
  category: z.enum(businessCategories),
  country: z.enum(countries),
  currency: z.enum(currencies),
  timezone: z.enum(timezones),
  city: z.string().trim().min(2),
  whatsapp: z.string().trim().min(8),
  termsAccepted: z.literal(true),
  marketingConsent: z.literal(true),
  logoPreview: z.string().optional(),
});

export async function POST(request: Request) {
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, message: "Check the code and account details." }, { status: 400 });
  }

  const data = parsed.data;
  let otp: Awaited<ReturnType<typeof checkOtp>>;
  try {
    otp = await checkOtp(data.email, data.code);
  } catch {
    return NextResponse.json(
      { ok: false, message: "The database is not reachable. Start MongoDB and try again." },
      { status: 503 },
    );
  }

  if (!otp.ok) {
    const message =
      otp.reason === "expired"
        ? "That code expired. Resend a new one."
        : otp.reason === "locked"
          ? "Too many attempts. Resend a new code."
          : "That code does not match. Try again.";
    return NextResponse.json({ ok: false, message }, { status: 401 });
  }

  try {
    await connectDB();
    const email = data.email.toLowerCase();
    const existing = await BusinessOwnerModel.findOne({ email });
    if (existing?.isVerified) {
      await clearOtp(email);
      return NextResponse.json(
        { ok: false, message: "An account with this email already exists. Log in instead." },
        { status: 409 },
      );
    }

    const passwordHash = await bcrypt.hash(data.password, 12);
    const logoUrl = await saveLogo(data.logoPreview);
    const owner = await BusinessOwnerModel.findOneAndUpdate(
      { email },
      {
        businessName: data.businessName,
        email,
        passwordHash,
        isVerified: true,
        supportEmail: data.supportEmail.toLowerCase(),
        category: data.category,
        country: data.country,
        currency: data.currency,
        timezone: data.timezone,
        city: data.city,
        logoUrl,
        whatsapp: data.whatsapp,
        termsAccepted: true,
        marketingConsent: true,
        plan: "Free Trial",
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
    if (!owner) {
      return NextResponse.json(
        { ok: false, message: "The account could not be saved. Check MongoDB and try again." },
        { status: 503 },
      );
    }

    const payload: SessionPayload = {
      sub: String(owner._id),
      email,
      businessName: data.businessName,
      plan: "Free Trial",
      category: data.category,
      country: data.country,
      currency: data.currency,
      timezone: data.timezone,
      city: data.city,
      whatsapp: data.whatsapp,
      exp: Math.floor(Date.now() / 1000) + 14 * 24 * 60 * 60,
    };

    await clearOtp(email);

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
      { ok: false, message: "The account could not be saved. Check MongoDB and try again." },
      { status: 503 },
    );
  }
}
