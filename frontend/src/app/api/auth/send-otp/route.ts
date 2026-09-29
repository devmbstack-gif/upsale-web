import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyCaptchaForEmail } from "@/lib/auth/captcha";
import { sendOtpEmail } from "@/lib/auth/mail";
import { clearOtp, issueOtp } from "@/lib/auth/otp";

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
  const captcha = verifyCaptchaForEmail(businessEmail, parsed.data.captchaToken, parsed.data.captchaAnswer);
  if (!captcha.ok) {
    return NextResponse.json(
      { ok: false, message: "CAPTCHA verification failed. Try again." },
      { status: 400 },
    );
  }

  console.log("Sending OTP to:", businessEmail);

  let issued: Awaited<ReturnType<typeof issueOtp>>;
  try {
    issued = await issueOtp(businessEmail);
  } catch {
    return NextResponse.json(
      { ok: false, message: "The database is not reachable. Start MongoDB and try again." },
      { status: 503 },
    );
  }

  if (!issued.ok) {
    return NextResponse.json(
      { ok: false, message: `Wait ${issued.waitSeconds}s before resending the code.` },
      { status: 429 },
    );
  }

  let sent: Awaited<ReturnType<typeof sendOtpEmail>>;
  try {
    sent = await sendOtpEmail(businessEmail, issued.code);
  } catch {
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

  return NextResponse.json({ ok: true });
}
