import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyCaptchaForEmail } from "@/lib/auth/captcha";
import { sendOtpEmail } from "@/lib/auth/mail";
import { clearOtp, issueOtp, startOtpLifetime } from "@/lib/auth/otp";
import { BusinessOwnerModel } from "@/lib/models/business-owner";
import { connectDB } from "@/lib/mongodb";

const bodySchema = z.object({
  email: z.string().trim().email(),
  captchaToken: z.string().min(1).optional(),
  captchaAnswer: z.string().min(1).optional(),
});

export async function POST(request: Request) {
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, message: "Enter a valid business email." }, { status: 400 });
  }

  const businessEmail = parsed.data.email;
  try {
    await connectDB();
    const existing = await BusinessOwnerModel.exists({
      email: businessEmail.toLowerCase(),
      isVerified: true,
    });
    if (existing) {
      return NextResponse.json(
        { ok: false, message: "An account with this email already exists. Log in instead." },
        { status: 409 },
      );
    }
  } catch (err) {
    console.error("Account lookup failed:", err);
    return NextResponse.json(
      { ok: false, message: "The database is not reachable. Check MONGODB_URI and try again." },
      { status: 503 },
    );
  }
  const captcha = verifyCaptchaForEmail(businessEmail, parsed.data.captchaToken, parsed.data.captchaAnswer);
  if (!captcha.ok) {
    return NextResponse.json(
      { ok: false, message: "CAPTCHA verification failed. Solve it again on step 1, then retry." },
      { status: 400 },
    );
  }

  console.log("Sending OTP to:", businessEmail);

  let issued: Awaited<ReturnType<typeof issueOtp>>;
  try {
    issued = await issueOtp(businessEmail);
  } catch (err) {
    console.error("issueOtp failed:", err);
    return NextResponse.json(
      { ok: false, message: "The database is not reachable. Check MONGODB_URI and try again." },
      { status: 503 },
    );
  }

  if (!issued.ok) {
    return NextResponse.json(
      {
        ok: false,
        waitSeconds: issued.waitSeconds,
        message: `Wait ${issued.waitSeconds}s before resending the code.`,
      },
      { status: 429 },
    );
  }

  let sent: Awaited<ReturnType<typeof sendOtpEmail>>;
  try {
    sent = await sendOtpEmail(businessEmail, issued.code);
  } catch (err) {
    console.error("sendOtpEmail failed:", err);
    await clearOtp(businessEmail).catch(() => undefined);
    return NextResponse.json(
      { ok: false, message: "The email service did not accept the message." },
      { status: 502 },
    );
  }

  if (!sent.ok) {
    await clearOtp(businessEmail).catch(() => undefined);
    return NextResponse.json({ ok: false, message: sent.message }, { status: 502 });
  }

  try {
    await startOtpLifetime(businessEmail);
  } catch (err) {
    console.error("Failed to activate OTP lifetime:", err);
    await clearOtp(businessEmail).catch(() => undefined);
    return NextResponse.json(
      { ok: false, message: "The verification code could not be activated. Request a new code." },
      { status: 503 },
    );
  }

  return NextResponse.json({
    ok: true,
    resendAfterSeconds: 60,
    message: "We sent a 6-digit code to your business email.",
  });
}
