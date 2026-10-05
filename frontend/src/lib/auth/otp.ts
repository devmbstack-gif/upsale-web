import { createHmac, randomInt, timingSafeEqual } from "crypto";
import { connectDB } from "@/lib/mongodb";
import { OtpModel } from "@/lib/models/otp";

const FIVE_MINUTES = 5 * 60 * 1000;
const RESEND_WAIT = 60 * 1000;

type OtpPurpose = "signup" | "password-reset";

function otpHash(email: string, code: string, purpose: OtpPurpose) {
  const secret = process.env.AUTH_SECRET || process.env.JWT_SECRET;
  if (!secret) throw new Error("AUTH_SECRET or JWT_SECRET must be configured.");
  return createHmac("sha256", secret).update(`${purpose}:${email.toLowerCase()}:${code}`).digest("hex");
}

function sameHash(stored: string, next: string) {
  const left = Buffer.from(stored);
  const right = Buffer.from(next);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

export async function issueOtp(email: string, purpose: OtpPurpose = "signup") {
  await connectDB();
  const key = email.toLowerCase();
  const existing = await OtpModel.findOne({ email: key });
  if (existing && Date.now() - new Date(existing.sentAt).getTime() < RESEND_WAIT) {
    const waitSeconds = Math.ceil((RESEND_WAIT - (Date.now() - new Date(existing.sentAt).getTime())) / 1000);
    return { ok: false as const, waitSeconds };
  }

  const code = randomInt(100000, 1000000).toString();
  const now = new Date();
  await OtpModel.findOneAndUpdate(
    { email: key },
    {
      email: key,
      code: otpHash(key, code, purpose),
      purpose,
      expiresAt: new Date(now.getTime() + FIVE_MINUTES),
      sentAt: now,
      attempts: 0,
    },
    { upsert: true },
  );
  return { ok: true as const, code };
}

export async function checkOtp(
  email: string,
  code: string,
  purpose: OtpPurpose = "signup",
  consume = true,
) {
  await connectDB();
  const key = email.toLowerCase();
  const record = await OtpModel.findOne({ email: key, purpose });
  if (!record) {
    return { ok: false as const, reason: "missing" as const };
  }
  if (record.expiresAt.getTime() < Date.now()) {
    await OtpModel.deleteOne({ email: key });
    return { ok: false as const, reason: "expired" as const };
  }
  if (record.attempts >= 5) {
    return { ok: false as const, reason: "locked" as const };
  }
  if (!sameHash(record.code, otpHash(key, code, purpose))) {
    await OtpModel.updateOne({ _id: record._id }, { $inc: { attempts: 1 } });
    return { ok: false as const, reason: "invalid" as const };
  }

  if (!consume) return { ok: true as const };

  // Consume a correct OTP atomically so concurrent requests cannot reuse it.
  const consumed = await OtpModel.findOneAndDelete({ _id: record._id, code: record.code });
  if (!consumed) {
    return { ok: false as const, reason: "invalid" as const };
  }
  return { ok: true as const };
}

export async function clearOtp(email: string) {
  await connectDB();
  await OtpModel.deleteOne({ email: email.toLowerCase() });
}

export async function startOtpLifetime(email: string) {
  await connectDB();
  const now = new Date();
  await OtpModel.updateOne(
    { email: email.toLowerCase() },
    { $set: { sentAt: now, expiresAt: new Date(now.getTime() + FIVE_MINUTES) } },
  );
}
