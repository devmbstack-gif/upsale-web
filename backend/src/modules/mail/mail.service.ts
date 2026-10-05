import {
  BadRequestException,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer from 'upsale-nodemailer';
import type { SendMailDto } from './mail.dto.js';

@Injectable()
export class MailService {
  constructor(private readonly config: ConfigService) {}

  private transporter() {
    const host = this.config.getOrThrow<string>('SMTP_HOST');
    const port = Number(this.config.get<string>('SMTP_PORT') ?? 587);
    const user = this.config.getOrThrow<string>('SMTP_USER');
    const pass = this.config
      .getOrThrow<string>('SMTP_PASSWORD')
      .replace(/\s/g, '');

    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      requireTLS: port === 587,
      auth: { user, pass },
    });
  }

  private layout(title: string, copy: string, content: string) {
    return `<!doctype html><html><body style="margin:0;background:#050408;color:#f4f1fb;font-family:Arial,sans-serif;"><table width="100%" cellpadding="0" cellspacing="0" style="background:#050408;padding:32px 16px;"><tr><td align="center"><table width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#0e0a17;border:1px solid #2a2144;border-radius:16px;padding:28px;"><tr><td><p style="margin:0;color:#a78bfa;font-size:12px;letter-spacing:.14em;text-transform:uppercase;">UPSale</p><h1 style="margin:12px 0 0;font-size:24px;line-height:1.2;">${title}</h1><p style="margin:12px 0 0;color:#c4b5e0;line-height:1.5;">${copy}</p>${content}<p style="margin:0;color:#9b90b0;font-size:13px;line-height:1.5;">If you did not request this, you can ignore this email.</p></td></tr></table></td></tr></table></body></html>`;
  }

  async send(payload: SendMailDto) {
    let subject: string;
    let html: string;

    if (!payload.code) throw new BadRequestException('OTP code is required');

    if (payload.type === 'otp') {
      subject = 'Your UPSale verification code';
      html = this.layout(
        'Your verification code',
        'Enter this code to finish creating your business account. It expires in 5 minutes.',
        `<p style="margin:24px 0;font-size:32px;letter-spacing:.28em;font-weight:700;color:#fff;">${payload.code}</p>`,
      );
    } else {
      subject = 'Your UPSale password reset code';
      html = this.layout(
        'Reset your password',
        'Enter this code to choose a new password. It expires in 5 minutes.',
        `<p style="margin:24px 0;font-size:32px;letter-spacing:.28em;font-weight:700;color:#fff;">${payload.code}</p>`,
      );
    }

    try {
      await this.transporter().sendMail({
        from:
          this.config.get<string>('SMTP_FROM') ??
          this.config.getOrThrow<string>('SMTP_USER'),
        to: payload.to,
        subject,
        html,
      });
      return { ok: true };
    } catch (error) {
      console.error(
        'SMTP delivery failed:',
        error instanceof Error ? error.message : error,
      );
      throw new ServiceUnavailableException('Email delivery failed');
    }
  }

  async sendWhatsAppFailureAlert(to: string, details: { phone: string; reason: string }) {
    const safePhone = details.phone.replace(/[<>&"']/g, "");
    const safeReason = details.reason.replace(/[<>&"']/g, "");
    try {
      await this.transporter().sendMail({
        from: this.config.get<string>('SMTP_FROM') ?? this.config.getOrThrow<string>('SMTP_USER'),
        to,
        subject: 'UPSale WhatsApp delivery failed',
        html: this.layout(
          'WhatsApp delivery failed',
          `A campaign message to ${safePhone} could not be delivered.`,
          `<p style="margin:20px 0;padding:14px;border-radius:10px;background:#1a1228;color:#fca5a5;">${safeReason}</p>`,
        ),
      });
    } catch (error) {
      console.error('WhatsApp failure alert email failed:', error instanceof Error ? error.message : error);
    }
  }
}
