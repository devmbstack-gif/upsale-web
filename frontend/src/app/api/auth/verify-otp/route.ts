import bcrypt from "bcrypt";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { checkOtp, clearOtp } from "@/lib/auth/otp";
import { createSessionToken, SESSION_COOKIE, type SessionPayload } from "@/lib/auth/session";
import { BusinessOwnerModel } from "@/lib/models/business-owner";
import { connectDB } from "@/lib/mongodb";
import { submittedCategorySchema } from "@/lib/validations/auth";
import { callBackend } from "@/lib/server/backend";
import { offerNameSlug } from "@/lib/offer-slug";
import { escapeRegex, normalizeBusinessName } from "@/lib/business-name";

const bodySchema = z.object({
  email: z.string().trim().email(),
  code: z.string().regex(/^\d{6}$/),
  businessName: z.string().trim().min(1),
  password: z.string().min(8).regex(/[A-Z]/).regex(/[0-9]/),
  category: submittedCategorySchema,
  country: z.string().trim().min(1),
  currency: z.string().trim().min(1),
  timezone: z.string().trim().min(1),
  city: z.string().trim().min(2),
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

    const businessName = data.businessName.trim().replace(/\s+/g, " ");
    const businessNameKey = normalizeBusinessName(businessName);
    const businessSlug = offerNameSlug(businessName);
    const nameOwner = await BusinessOwnerModel.exists({
      email: { $ne: email },
      $or: [
        { businessNameKey },
        { businessName: { $regex: `^${escapeRegex(businessName)}$`, $options: "i" } },
        { businessSlug },
      ],
    });
    if (nameOwner) {
      return NextResponse.json({ ok: false, message: "A business with this name already exists." }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(data.password, 12);
    const owner = await BusinessOwnerModel.findOneAndUpdate(
      { email },
      {
        businessName,
        businessNameKey,
        businessSlug,
        email,
        passwordHash,
        isVerified: true,
        supportEmail: "",
        category: data.category,
        country: data.country,
        currency: data.currency,
        timezone: data.timezone,
        city: data.city,
        logoUrl: "",
        whatsapp: "",
        termsAccepted: true,
        marketingConsent: true,
        plan: "Plan not selected",
        planSlug: "",
        subscriptionStatus: "onboarding_pending",
        trialStartedAt: null,
        trialEndsAt: null,
        trialGrantedOnce: false,
        trialPackageId: null,
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
      businessName,
      plan: "Plan not selected",
      category: data.category,
      country: data.country,
      currency: data.currency,
      timezone: data.timezone,
      city: data.city,
      whatsapp: "",
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
  } catch (error) {
    if (typeof error === "object" && error && "code" in error && error.code === 11000) {
      return NextResponse.json({ ok: false, message: "A business with this name already exists." }, { status: 409 });
    }
    return NextResponse.json(
      { ok: false, message: "The account could not be saved. Check MongoDB and try again." },
      { status: 503 },
    );
  }
}
