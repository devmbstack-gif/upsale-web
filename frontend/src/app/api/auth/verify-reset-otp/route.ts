import { createHash, randomBytes } from "crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { checkOtp } from "@/lib/auth/otp";
import { BusinessOwnerModel } from "@/lib/models/business-owner";
import { connectDB } from "@/lib/mongodb";

const TEN_MINUTES = 10 * 60 * 1000;
const bodySchema = z.object({
  email: z.string().trim().email(),
  code: z.string().regex(/^\d{6}$/),
});

export async function POST(request: Request) {
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, message: "Enter the six-digit OTP." }, { status: 400 });
  }

  try {
    const email = parsed.data.email.toLowerCase();
    const otp = await checkOtp(email, parsed.data.code, "password-reset");
    if (!otp.ok) {
      const message =
        otp.reason === "expired"
          ? "That OTP has expired. Request a new one."
          : otp.reason === "missing"
            ? "No active reset OTP was found. Request a new one."
            : "That OTP is invalid.";
      return NextResponse.json({ ok: false, message }, { status: 401 });
    }

    await connectDB();
    const owner = await BusinessOwnerModel.findOne({ email, isVerified: true });
    if (!owner) {
      return NextResponse.json({ ok: false, message: "No account exists with this email." }, { status: 404 });
    }

    const rawToken = randomBytes(32).toString("hex");
    owner.resetToken = createHash("sha256").update(rawToken).digest("hex");
    owner.resetTokenExpiry = new Date(Date.now() + TEN_MINUTES);
    await owner.save();
    return NextResponse.json({ ok: true, token: rawToken });
  } catch (error) {
    console.error("Reset OTP verification failed:", error);
    return NextResponse.json({ ok: false, message: "Could not verify the OTP." }, { status: 503 });
  }
}
