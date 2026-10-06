import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectConnection } from '@nestjs/mongoose';
import { createDecipheriv, scryptSync } from 'node:crypto';
import type { Connection } from 'mongoose';

type PlatformSettingsRecord = {
  key: string;
  geminiApiKey?: string;
  openAiApiKey?: string;
  waApiBaseUrl?: string;
  appPublicUrl?: string;
};

@Injectable()
export class PlatformSettingsService {
  private readonly logger = new Logger(PlatformSettingsService.name);

  constructor(
    private readonly config: ConfigService,
    @InjectConnection() private readonly db: Connection,
  ) {}

  private decrypt(value?: string) {
    if (!value || !value.startsWith('v1:')) return value?.trim() ?? '';
    const secret = this.config.get<string>('INTERNAL_API_SECRET') || this.config.get<string>('PLATFORM_SECRETS_KEY') || this.config.get<string>('JWT_SECRET');
    if (!secret) return '';
    try {
      const [, iv, tag, ciphertext] = value.split(':');
      if (!iv || !tag || !ciphertext) return '';
      const key = scryptSync(secret, 'upsale-platform-secrets-v1', 32);
      const decipher = createDecipheriv('aes-256-gcm', key, Buffer.from(iv, 'base64url'));
      decipher.setAuthTag(Buffer.from(tag, 'base64url'));
      return Buffer.concat([
        decipher.update(Buffer.from(ciphertext, 'base64url')),
        decipher.final(),
      ]).toString('utf8').trim();
    } catch {
      this.logger.error('Could not decrypt platform settings. Save the values again in the admin Platform Settings page.');
      return '';
    }
  }

  private async current() {
    return this.db.collection<PlatformSettingsRecord>('platform_settings').findOne({ key: 'default' });
  }

  async geminiApiKey() {
    const settings = await this.current();
    return this.decrypt(settings?.geminiApiKey || settings?.openAiApiKey) || this.config.get<string>('GEMINI_API_KEY') || '';
  }

  async whatsAppApiBaseUrl() {
    const settings = await this.current();
    return this.decrypt(settings?.waApiBaseUrl) || this.config.get<string>('WHATSAPP_API_BASE_URL') || 'https://graph.facebook.com';
  }

  async appPublicUrl() {
    const settings = await this.current();
    return (this.decrypt(settings?.appPublicUrl) || this.config.get<string>('FRONTEND_URL') || 'http://localhost:3000').replace(/\/$/, '');
  }
}
