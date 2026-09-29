import { Resend } from "resend";

export function otpEmailHtml(code: string) {
  return `<!doctype html>
<html>
  <body style="margin:0;background:#050408;color:#f4f1fb;font-family:Arial,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#050408;padding:32px 16px;">
      <tr>
        <td align="center">
          <table width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#0e0a17;border:1px solid #2a2144;border-radius:16px;padding:28px;">
            <tr>
              <td>
                <p style="margin:0;color:#a78bfa;font-size:12px;letter-spacing:0.14em;text-transform:uppercase;">UPSale</p>
                <h1 style="margin:12px 0 0;font-size:24px;line-height:1.2;">Your verification code</h1>
                <p style="margin:12px 0 0;color:#c4b5e0;line-height:1.5;">Enter this code to finish creating your business account. It expires in 5 minutes.</p>
                <p style="margin:24px 0;font-size:32px;letter-spacing:0.28em;font-weight:700;color:#ffffff;">${code}</p>
                <p style="margin:0;color:#9b90b0;font-size:13px;line-height:1.5;">If you did not try to create an UPSale account, you can ignore this email.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export function resetPasswordEmailHtml(resetUrl: string) {
  return `<!doctype html>
<html>
  <body style="margin:0;background:#050408;color:#f4f1fb;font-family:Arial,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#050408;padding:32px 16px;">
      <tr>
        <td align="center">
          <table width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#0e0a17;border:1px solid #2a2144;border-radius:16px;padding:28px;">
            <tr>
              <td>
                <p style="margin:0;color:#a78bfa;font-size:12px;letter-spacing:0.14em;text-transform:uppercase;">UPSale</p>
                <h1 style="margin:12px 0 0;font-size:24px;line-height:1.2;">Reset your password</h1>
                <p style="margin:12px 0 0;color:#c4b5e0;line-height:1.5;">Click the button below to choose a new password. This link expires in 30 minutes.</p>
                <p style="margin:28px 0;">
                  <a href="${resetUrl}" style="display:inline-block;padding:14px 22px;border-radius:999px;background:#7c3aed;color:#ffffff;text-decoration:none;font-weight:700;">Reset My Password</a>
                </p>
                <p style="margin:0;color:#9b90b0;font-size:13px;line-height:1.5;">If you did not ask to reset your password, you can ignore this email.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

async function sendWithResend(to: string, subject: string, html: string) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return {
      ok: false as const,
      message: "Email delivery is not configured. Add RESEND_API_KEY to frontend/.env.local.",
    };
  }

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from: "onboarding@resend.dev",
    to,
    subject,
    html,
  });

  if (error) {
    return { ok: false as const, message: error.message || "The email could not be sent." };
  }

  return { ok: true as const };
}

export async function sendOtpEmail(email: string, code: string) {
  return sendWithResend(email, "Your UPSale verification code", otpEmailHtml(code));
}

export async function sendResetPasswordEmail(email: string, resetUrl: string) {
  return sendWithResend(email, "Reset your UPSale password", resetPasswordEmailHtml(resetUrl));
}
