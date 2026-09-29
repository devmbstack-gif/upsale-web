import { createHash, randomBytes } from "crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { sendResetPasswordEmail } from "@/lib/auth/mail";
import { BusinessOwnerModel } from "@/lib/models/business-owner";
import { connectDB } from "@/lib/mongodb";

const THIRTY_MINUTES = 30 * 60 * 1000;

const bodySchema = z.object({
  email: z.string().trim().email(),
});

function appOrigin(request: Request) {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
  if (configured) return configured;
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  const proto = request.headers.get("x-forwarded-proto") ?? "http";
  if (host) return `${proto}://${host}`;
  return "http://localhost:3000";
}

export async function POST(request: Request) {
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, message: "Enter a valid business email." }, { status: 400 });
  }

  const email = parsed.data.email.toLowerCase();
  console.log("Sending password reset to:", email);

  try {
    await connectDB();
    const owner = await BusinessOwnerModel.findOne({ email });

    // Always return success to avoid email enumeration.
    if (!owner || !owner.isVerified) {
      return NextResponse.json({
        ok: true,
        message: "If that email is registered, a reset link is on its way.",
      });
    }

    const rawToken = randomBytes(32).toString("hex");
    const resetToken = createHash("sha256").update(rawToken).digest("hex");
    const resetTokenExpiry = new Date(Date.now() + THIRTY_MINUTES);

    owner.resetToken = resetToken;
    owner.resetTokenExpiry = resetTokenExpiry;
    await owner.save();

    const resetUrl = `${appOrigin(request)}/reset-password?token=${rawToken}`;
    const sent = await sendResetPasswordEmail(email, resetUrl);
    if (!sent.ok) {
      owner.resetToken = null;
      owner.resetTokenExpiry = null;
      await owner.save();
      return NextResponse.json({ ok: false, message: sent.message }, { status: 502 });
    }

    return NextResponse.json({
      ok: true,
      message: "If that email is registered, a reset link is on its way.",
    });
  } catch {
    return NextResponse.json(
      { ok: false, message: "The database is not reachable. Start MongoDB and try again." },
      { status: 503 },
    );
  }
}
