import { NextResponse } from "next/server";
import { issueCaptchaChallenge } from "@/lib/auth/captcha";

export async function GET() {
  return NextResponse.json({ ok: true, ...issueCaptchaChallenge() });
}

export async function POST() {
  return NextResponse.json({ ok: true, ...issueCaptchaChallenge() });
}
