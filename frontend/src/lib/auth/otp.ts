import { randomInt, timingSafeEqual } from "crypto";
import { connectDB } from "@/lib/mongodb";
import { OtpModel } from "@/lib/models/otp";

const FIVE_MINUTES = 5 * 60 * 1000;
const RESEND_WAIT = 60 * 1000;

function sameHash(stored: string, next: string) {
  const left = Buffer.from(stored);
  const right = Buffer.from(next);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

export async function issueOtp(email: string) {
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
      code,
      expiresAt: new Date(now.getTime() + FIVE_MINUTES),
      sentAt: now,
      attempts: 0,
    },
    { upsert: true },
  );
  return { ok: true as const, code };
}

export async function checkOtp(email: string, code: string) {
  await connectDB();
  const key = email.toLowerCase();
  const record = await OtpModel.findOne({ email: key });
  if (!record || record.expiresAt.getTime() < Date.now()) {
    await OtpModel.deleteOne({ email: key });
    return { ok: false as const, reason: "expired" as const };
  }
  if (record.attempts >= 5) {
    return { ok: false as const, reason: "locked" as const };
  }
  record.attempts += 1;
  await record.save();
  if (!sameHash(record.code, code)) {
    return { ok: false as const, reason: "invalid" as const };
  }
  return { ok: true as const };
}

export async function clearOtp(email: string) {
  await connectDB();
  await OtpModel.deleteOne({ email: email.toLowerCase() });
}
