type SendResult = { ok: true } | { ok: false; message: string };

async function sendThroughBackend(payload: {
  type: "otp" | "password-reset-otp";
  to: string;
  code?: string;
}): Promise<SendResult> {
  const backendUrl = (process.env.BACKEND_INTERNAL_URL || "http://localhost:4000").replace(/\/$/, "");
  const secret = process.env.INTERNAL_API_SECRET;
  if (!secret) return { ok: false, message: "Internal email delivery is not configured." };

  try {
    const response = await fetch(`${backendUrl}/api/internal/mail`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-internal-api-key": secret,
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });
    if (!response.ok) {
      console.error("Backend email service rejected the request:", response.status);
      return { ok: false, message: "The email service did not accept the message." };
    }
    return { ok: true };
  } catch (error) {
    console.error("Backend email service is unavailable:", error instanceof Error ? error.message : error);
    return { ok: false, message: "The email service is unavailable." };
  }
}

export function sendOtpEmail(email: string, code: string) {
  return sendThroughBackend({ type: "otp", to: email, code });
}

export function sendResetPasswordEmail(email: string, code: string) {
  return sendThroughBackend({ type: "password-reset-otp", to: email, code });
}
