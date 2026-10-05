import { NextResponse } from "next/server";
import { z } from "zod";
import { sendResetPasswordEmail } from "@/lib/auth/mail";
import { clearOtp, issueOtp, startOtpLifetime } from "@/lib/auth/otp";
import { BusinessOwnerModel } from "@/lib/models/business-owner";
import { connectDB } from "@/lib/mongodb";

const bodySchema = z.object({ email: z.string().trim().email() });

export async function POST(request: Request) {
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, message: "Enter a valid business email." }, { status: 400 });
  }

  const email = parsed.data.email.toLowerCase();
  try {
    await connectDB();
    const owner = await BusinessOwnerModel.exists({ email, isVerified: true });
    if (!owner) {
      return NextResponse.json(
        { ok: false, message: "No account exists with this email." },
        { status: 404 },
      );
    }

    const issued = await issueOtp(email, "password-reset");
    if (!issued.ok) {
      return NextResponse.json(
        { ok: false, message: `Wait ${issued.waitSeconds}s before requesting another OTP.`, waitSeconds: issued.waitSeconds },
        { status: 429 },
      );
    }

    const sent = await sendResetPasswordEmail(email, issued.code);
    if (!sent.ok) {
      await clearOtp(email);
      return NextResponse.json({ ok: false, message: sent.message }, { status: 502 });
    }
    await startOtpLifetime(email);
    return NextResponse.json({ ok: true, message: "OTP is sent to your email." });
  } catch (error) {
    console.error("Password reset OTP failed:", error);
    return NextResponse.json(
      { ok: false, message: "Could not send the password reset OTP." },
      { status: 503 },
    );
  }
}
