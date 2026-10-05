import bcrypt from "bcrypt";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { checkOtp, clearOtp } from "@/lib/auth/otp";
import { createSessionToken, SESSION_COOKIE, type SessionPayload } from "@/lib/auth/session";
import { BusinessOwnerModel } from "@/lib/models/business-owner";
import { connectDB } from "@/lib/mongodb";
import { submittedCategorySchema } from "@/lib/validations/auth";
import { verifyWhatsAppProof } from "@/lib/auth/whatsapp-proof";
import { TrialSettingsModel } from "@/lib/models/trial-settings";
import { callBackend } from "@/lib/server/backend";

const bodySchema = z.object({
  email: z.string().trim().email(),
  code: z.string().regex(/^\d{6}$/),
  businessName: z.string().trim().min(1),
  businessUsername: z.string().trim().toLowerCase().min(3).max(30).regex(/^[a-z0-9._]+$/),
  password: z.string().min(8).regex(/[A-Z]/).regex(/[0-9]/),
  supportEmail: z.string().trim().email(),
  category: submittedCategorySchema,
  country: z.string().trim().min(1),
  currency: z.string().trim().min(1),
  timezone: z.string().trim().min(1),
  city: z.string().trim().min(2),
  whatsapp: z.string().trim().min(8),
  whatsappProof: z.string().min(20),
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
  if (!verifyWhatsAppProof(data.whatsappProof, data.email, data.whatsapp)) {
    return NextResponse.json({ ok: false, message: "Confirm this WhatsApp number again before creating the account." }, { status: 400 });
  }
  let otp: Awaited<ReturnType<typeof checkOtp>>;
  try {
    // Validate first, but keep the OTP available until external WhatsApp
    // verification succeeds. A temporary WhatsApp/configuration failure must
    // not destroy an otherwise correct email code.
    otp = await checkOtp(data.email, data.code, "signup", false);
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
          : otp.reason === "missing"
            ? "No active code was found. Resend a new code."
            : "That code does not match. Try again.";
    return NextResponse.json({ ok: false, message }, { status: 401 });
  }

  // Consume the OTP only after every external validation has passed.
  const consumedOtp = await checkOtp(data.email, data.code);
  if (!consumedOtp.ok) {
    const message =
      consumedOtp.reason === "expired"
        ? "That code expired. Resend a new one."
        : consumedOtp.reason === "locked"
          ? "Too many attempts. Resend a new code."
          : consumedOtp.reason === "missing"
            ? "That code was already used. Resend a new code."
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

    const usernameOwner = await BusinessOwnerModel.exists({
      businessUsername: data.businessUsername,
      email: { $ne: email },
    });
    if (usernameOwner) {
      return NextResponse.json({ ok: false, message: "Username not available." }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(data.password, 12);
    const trialSettings = await TrialSettingsModel.findOne({ key: "default" }).lean();
    const trialEnabled = trialSettings?.enabled !== false;
    const trialDays = Math.max(1, trialSettings?.trialDays ?? 14);
    const trialStartedAt = new Date();
    const trialEndsAt = trialEnabled
      ? new Date(trialStartedAt.getTime() + trialDays * 24 * 60 * 60 * 1000)
      : trialStartedAt;
    const owner = await BusinessOwnerModel.findOneAndUpdate(
      { email },
      {
        businessName: data.businessName,
        businessUsername: data.businessUsername,
        email,
        passwordHash,
        isVerified: true,
        supportEmail: data.supportEmail.toLowerCase(),
        category: data.category,
        country: data.country,
        currency: data.currency,
        timezone: data.timezone,
        city: data.city,
        logoUrl: "",
        whatsapp: data.whatsapp,
        termsAccepted: true,
        marketingConsent: true,
        plan: "Free Trial",
        planSlug: "free-trial",
        subscriptionStatus: trialEnabled ? "trial" : "trial_expired",
        trialStartedAt,
        trialEndsAt,
        trialGrantedOnce: true,
        trialPackageId: trialSettings?.unlockedPackageId ?? null,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
    if (!owner) {
      return NextResponse.json(
        { ok: false, message: "The account could not be saved. Check MongoDB and try again." },
        { status: 503 },
      );
    }
    if (data.logoPreview) {
      try {
        const uploaded = await callBackend<{ url?: string; publicId?: string }>(
          "/api/internal/media/logo",
          { businessId: String(owner._id), dataUrl: data.logoPreview },
        );
        if (uploaded.response.ok && uploaded.data.url && uploaded.data.publicId) {
          owner.logoUrl = uploaded.data.url;
          owner.logoPublicId = uploaded.data.publicId;
          await owner.save();
        }
      } catch {
        // Logo upload is optional and must not invalidate an otherwise verified account.
      }
    }

    const payload: SessionPayload = {
      sub: String(owner._id),
      email,
      businessName: data.businessName,
      businessUsername: data.businessUsername,
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
