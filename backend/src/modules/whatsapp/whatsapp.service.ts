import { BadRequestException, Injectable, OnModuleDestroy, OnModuleInit, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectConnection } from '@nestjs/mongoose';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { Types } from 'mongoose';
import type { Connection } from 'mongoose';
import { ConnectWhatsAppDto, ScheduleCampaignDto, SendCampaignDto } from './whatsapp.dto.js';
import { decryptWhatsAppSecret, encryptWhatsAppSecret } from './whatsapp.crypto.js';
import { MailService } from '../mail/mail.service.js';
import { PlatformSettingsService } from '../platform-settings/platform-settings.service.js';

type WaConnection = {
  businessId: Types.ObjectId;
  accessTokenEncrypted: string;
  phoneNumberId: string;
  businessAccountId: string;
  displayPhoneNumber?: string;
  verifiedName?: string;
  qualityRating?: string;
  status: 'connected' | 'error' | 'disabled';
  lastError?: string;
  lastTestedAt?: Date;
  failureEmailAlerts?: boolean;
  failureAlertEmail?: string;
};

@Injectable()
export class WhatsAppService implements OnModuleInit, OnModuleDestroy {
  private scheduler?: NodeJS.Timeout;
  constructor(private readonly config: ConfigService, @InjectConnection() private readonly db: Connection, private readonly mail: MailService, private readonly platformSettings: PlatformSettingsService) {}

  onModuleInit() {
    this.scheduler = setInterval(() => void this.processScheduledCampaign(), 30_000);
    this.scheduler.unref();
    void this.processScheduledCampaign();
  }

  onModuleDestroy() {
    if (this.scheduler) clearInterval(this.scheduler);
  }

  private async baseUrl() {
    const base = await this.platformSettings.whatsAppApiBaseUrl();
    return `${base.replace(/\/$/, '')}/${this.config.get('WHATSAPP_API_VERSION', 'v23.0')}`;
  }

  private masterKey() {
    return this.config.getOrThrow<string>('WHATSAPP_ENCRYPTION_KEY');
  }

  private async graph<T>(path: string, token: string, init?: RequestInit): Promise<T> {
    const response = await fetch(`${await this.baseUrl()}/${path}`, {
      ...init,
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', ...init?.headers },
      signal: AbortSignal.timeout(15000),
    });
    const data = (await response.json().catch(() => ({}))) as T & { error?: { message?: string; code?: number } };
    if (!response.ok || data.error) throw new BadRequestException(data.error?.message ?? `WhatsApp API request failed (${response.status}).`);
    return data;
  }

  async connect(dto: ConnectWhatsAppDto) {
    const details = await this.graph<{ display_phone_number?: string; verified_name?: string; quality_rating?: string }>(
      `${dto.phoneNumberId}?fields=display_phone_number,verified_name,quality_rating`, dto.accessToken,
    );
    await this.db.collection<WaConnection>('whatsapp_connections').updateOne(
      { businessId: new Types.ObjectId(dto.businessId) },
      { $set: {
        accessTokenEncrypted: encryptWhatsAppSecret(dto.accessToken, this.masterKey()),
        phoneNumberId: dto.phoneNumberId,
        businessAccountId: dto.businessAccountId,
        displayPhoneNumber: details.display_phone_number ?? '',
        verifiedName: details.verified_name ?? '',
        qualityRating: details.quality_rating ?? '',
        status: 'connected', lastError: '', lastTestedAt: new Date(), updatedAt: new Date(),
      }, $setOnInsert: { createdAt: new Date() } }, { upsert: true },
    );
    return { status: 'connected', displayPhoneNumber: details.display_phone_number ?? '', verifiedName: details.verified_name ?? '', qualityRating: details.quality_rating ?? '' };
  }

  async status(businessId: string) {
    const value = await this.db.collection<WaConnection>('whatsapp_connections').findOne({ businessId: new Types.ObjectId(businessId) });
    if (!value) return { status: 'not_connected' };
    return { status: value.status, displayPhoneNumber: value.displayPhoneNumber ?? '', verifiedName: value.verifiedName ?? '', qualityRating: value.qualityRating ?? '', lastError: value.lastError ?? '', lastTestedAt: value.lastTestedAt ?? null, tokenMasked: '••••••••', failureEmailAlerts: Boolean(value.failureEmailAlerts), failureAlertEmail: value.failureAlertEmail ?? '' };
  }

  async preferences(businessId: string, failureEmailAlerts: boolean, failureAlertEmail?: string) {
    await this.db.collection<WaConnection>('whatsapp_connections').updateOne(
      { businessId: new Types.ObjectId(businessId) },
      { $set: { failureEmailAlerts, failureAlertEmail: failureAlertEmail ?? '', updatedAt: new Date() } },
    );
    return { failureEmailAlerts, failureAlertEmail: failureAlertEmail ?? '' };
  }

  async history(businessId: string) {
    const id = new Types.ObjectId(businessId);
    const [items, counts] = await Promise.all([
      this.db.collection('whatsapp_messages').aggregate([
        { $match: { businessId: id } }, { $sort: { createdAt: -1 } }, { $limit: 200 },
        { $lookup: { from: 'deals', localField: 'dealId', foreignField: '_id', as: 'deal' } },
        { $project: { phone: 1, recipientName: 1, status: 1, error: 1, messageId: 1, createdAt: 1, updatedAt: 1, dealTitle: { $arrayElemAt: ['$deal.title', 0] } } },
      ]).toArray(),
      this.db.collection('whatsapp_messages').aggregate([
        { $match: { businessId: id } }, { $group: { _id: '$status', count: { $sum: 1 } } },
      ]).toArray(),
    ]);
    return { items, counts: Object.fromEntries(counts.map((item) => [String(item._id), item.count])) };
  }

  async health() {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const [connectedBusinesses, failedMessages24h] = await Promise.all([
      this.db.collection('whatsapp_connections').countDocuments({ status: 'connected' }),
      this.db.collection('whatsapp_messages').countDocuments({ status: 'failed', updatedAt: { $gte: since } }),
    ]);
    const configured = Boolean(
      this.config.get('WHATSAPP_ACCESS_TOKEN') &&
      this.config.get('WHATSAPP_PHONE_NUMBER_ID') &&
      this.config.get('WHATSAPP_APP_SECRET') &&
      this.config.get('WHATSAPP_WEBHOOK_VERIFY_TOKEN') &&
      this.config.get('WHATSAPP_ENCRYPTION_KEY'),
    );
    return { configured, connectedBusinesses, failedMessages24h, apiVersion: this.config.get('WHATSAPP_API_VERSION', 'v23.0') };
  }

  private async connection(businessId: string) {
    const connection = await this.db.collection<WaConnection>('whatsapp_connections').findOne({ businessId: new Types.ObjectId(businessId), status: 'connected' });
    if (!connection) throw new BadRequestException('Connect and test WhatsApp before sending messages.');
    return { ...connection, token: decryptWhatsAppSecret(connection.accessTokenEncrypted, this.masterKey()) };
  }

  private normalize(phone: string) { return phone.replace(/\D/g, ''); }

  private async sendTemplate(phoneNumberId: string, token: string, to: string, templateName: string, bodyValues: string[] = [], imageUrl?: string) {
    const components: Array<Record<string, unknown>> = [];
    if (imageUrl) components.push({ type: 'header', parameters: [{ type: 'image', image: { link: imageUrl } }] });
    if (bodyValues.length) components.push({ type: 'body', parameters: bodyValues.map((text) => ({ type: 'text', text })) });
    return this.graph<{ messages?: Array<{ id: string }> }>(`${phoneNumberId}/messages`, token, {
      method: 'POST',
      body: JSON.stringify({ messaging_product: 'whatsapp', recipient_type: 'individual', to: this.normalize(to), type: 'template', template: { name: templateName, language: { code: this.config.get('WHATSAPP_TEMPLATE_LANGUAGE', 'en_US') }, ...(components.length ? { components } : {}) } }),
    });
  }

  async test(businessId: string, recipient: string) {
    const connection = await this.connection(businessId);
    const result = await this.sendTemplate(connection.phoneNumberId, connection.token, recipient, this.config.get('WHATSAPP_TEST_TEMPLATE_NAME', 'hello_world'));
    await this.db.collection('whatsapp_connections').updateOne({ businessId: new Types.ObjectId(businessId) }, { $set: { lastTestedAt: new Date(), lastError: '' } });
    return { accepted: true, messageId: result.messages?.[0]?.id ?? null };
  }

  async verifyNumber(phone: string) {
    // Testing switch: keep the production verification flow below intact.
    // Set WHATSAPP_NUMBER_VERIFICATION_ENABLED=true to re-enable real Meta delivery verification.
    if (this.config.get<string>('WHATSAPP_NUMBER_VERIFICATION_ENABLED', 'true').toLowerCase() === 'false') {
      return { accepted: true, bypassed: true, phone: this.normalize(phone) };
    }
    const token = this.config.get<string>('WHATSAPP_ACCESS_TOKEN');
    const phoneNumberId = this.config.get<string>('WHATSAPP_PHONE_NUMBER_ID');
    if (!token || !phoneNumberId) throw new ServiceUnavailableException('WhatsApp number verification is not configured.');
    try {
      const result = await this.sendTemplate(phoneNumberId, token, phone, this.config.get('WHATSAPP_VERIFICATION_TEMPLATE_NAME', 'hello_world'));
      const messageId = result.messages?.[0]?.id;
      if (!messageId) throw new BadRequestException('This number could not be verified on WhatsApp.');
      await this.db.collection('whatsapp_number_checks').updateOne({ messageId }, { $set: { messageId, phone: this.normalize(phone), status: 'accepted', updatedAt: new Date() } }, { upsert: true });
      for (let attempt = 0; attempt < 15; attempt += 1) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        const check = await this.db.collection('whatsapp_number_checks').findOne({ messageId });
        if (check?.status === 'delivered' || check?.status === 'read') {
          return { accepted: true, messageId };
        }
        if (check?.status === 'failed') {
          throw new BadRequestException('This number is not registered on WhatsApp or cannot receive the verification message.');
        }
      }
      throw new ServiceUnavailableException('WhatsApp could not confirm delivery. Check the number and try again.');
    } catch (error) {
      if (error instanceof BadRequestException) throw new BadRequestException('This number is not registered on WhatsApp or cannot receive the verification message.');
      throw error;
    }
  }

  async sendCampaign(dto: SendCampaignDto) {
    const connection = await this.connection(dto.businessId);
    const templateName = dto.templateName || this.config.get<string>('WHATSAPP_MARKETING_TEMPLATE_NAME');
    if (!templateName) throw new BadRequestException('An approved WhatsApp marketing template name is required.');
    const logs = this.db.collection('whatsapp_messages');
    let accepted = 0;
    let failed = 0;
    for (const recipient of dto.recipients.slice(0, 500)) {
      try {
        const personalized = dto.message.replace(/\{\{name\}\}/gi, recipient.name);
        const body = dto.postCaption ? `${personalized}\n\n${dto.postCaption}` : personalized;
        const result = await this.sendTemplate(connection.phoneNumberId, connection.token, recipient.phone, templateName, [body], dto.productImageUrl);
        await logs.insertOne({ businessId: new Types.ObjectId(dto.businessId), dealId: new Types.ObjectId(dto.dealId), customerId: new Types.ObjectId(recipient.customerId), recipientName: recipient.name, phone: this.normalize(recipient.phone), messageId: result.messages?.[0]?.id ?? '', status: 'accepted', createdAt: new Date(), updatedAt: new Date() });
        accepted += 1;
      } catch (error) {
        failed += 1;
        await logs.insertOne({ businessId: new Types.ObjectId(dto.businessId), dealId: new Types.ObjectId(dto.dealId), customerId: new Types.ObjectId(recipient.customerId), recipientName: recipient.name, phone: this.normalize(recipient.phone), status: 'failed', error: error instanceof Error ? error.message : 'WhatsApp send failed', createdAt: new Date(), updatedAt: new Date() });
      }
    }
    if (failed > 0 && connection.failureEmailAlerts && connection.failureAlertEmail) {
      void this.mail.sendWhatsAppFailureAlert(connection.failureAlertEmail, {
        phone: `${failed} campaign recipient${failed === 1 ? '' : 's'}`,
        reason: `${failed} message${failed === 1 ? '' : 's'} were rejected while the campaign was being sent. Review Delivery history for details.`,
      });
    }
    return { accepted, failed };
  }

  async scheduleCampaign(dto: ScheduleCampaignDto) {
    await this.connection(dto.businessId);
    const templateName = dto.templateName || this.config.get<string>('WHATSAPP_MARKETING_TEMPLATE_NAME');
    if (!templateName) throw new BadRequestException('An approved WhatsApp marketing template name is required.');
    const scheduledAt = new Date(dto.scheduledAt);
    if (scheduledAt.getTime() <= Date.now()) throw new BadRequestException('Scheduled time must be in the future.');
    await this.db.collection('whatsapp_campaign_jobs').insertOne({
      businessId: new Types.ObjectId(dto.businessId), dealId: new Types.ObjectId(dto.dealId),
      message: dto.message, templateName, productImageUrl: dto.productImageUrl, postCaption: dto.postCaption, recipients: dto.recipients,
      scheduleType: dto.scheduleType, scheduledAt, status: 'scheduled', attempts: 0,
      createdAt: new Date(), updatedAt: new Date(),
    });
    return { scheduled: true };
  }

  private async processScheduledCampaign() {
    const jobs = this.db.collection('whatsapp_campaign_jobs');
    const job = await jobs.findOneAndUpdate(
      { status: 'scheduled', scheduledAt: { $lte: new Date() } },
      { $set: { status: 'processing', lockedAt: new Date(), updatedAt: new Date() }, $inc: { attempts: 1 } },
      { sort: { scheduledAt: 1 }, returnDocument: 'after' },
    );
    if (!job) return;
    try {
      const result = await this.sendCampaign({
        businessId: String(job.businessId), dealId: String(job.dealId),
        message: String(job.message), templateName: String(job.templateName),
        productImageUrl: job.productImageUrl ? String(job.productImageUrl) : undefined,
        postCaption: job.postCaption ? String(job.postCaption) : undefined,
        recipients: job.recipients as SendCampaignDto['recipients'],
      });
      const nextStatus = result.accepted > 0 ? (result.failed > 0 ? 'partial' : 'sent') : 'failed';
      await this.db.collection('deals').updateOne(
        { _id: job.dealId },
        { $set: { status: nextStatus, acceptedCount: result.accepted, failedCount: result.failed, sentAt: result.accepted > 0 ? new Date() : null } },
      );
      if (job.scheduleType === 'daily' || job.scheduleType === 'weekly') {
        const next = new Date(job.scheduledAt);
        next.setDate(next.getDate() + (job.scheduleType === 'daily' ? 1 : 7));
        await jobs.updateOne({ _id: job._id }, { $set: { status: 'scheduled', scheduledAt: next, lastResult: result, updatedAt: new Date() } });
      } else {
        await jobs.updateOne({ _id: job._id }, { $set: { status: 'completed', lastResult: result, updatedAt: new Date() } });
      }
    } catch (error) {
      const reason = error instanceof Error ? error.message : 'Scheduled WhatsApp delivery failed.';
      await Promise.all([
        jobs.updateOne({ _id: job._id }, { $set: { status: 'failed', error: reason, updatedAt: new Date() } }),
        this.db.collection('deals').updateOne({ _id: job.dealId }, { $set: { status: 'failed', failureReason: reason } }),
      ]);
    }
    setImmediate(() => void this.processScheduledCampaign());
  }

  verifyWebhookSignature(rawBody: Buffer, signature?: string) {
    const appSecret = this.config.get<string>('WHATSAPP_APP_SECRET');
    if (!appSecret || !signature?.startsWith('sha256=')) return false;
    const expected = Buffer.from(createHmac('sha256', appSecret).update(rawBody).digest('hex'));
    const actual = Buffer.from(signature.slice(7));
    return expected.length === actual.length && timingSafeEqual(expected, actual);
  }

  async webhook(payload: any) {
    for (const entry of payload?.entry ?? []) for (const change of entry?.changes ?? []) {
      const value = change?.value;
      const phoneNumberId = value?.metadata?.phone_number_id;
      const connection = phoneNumberId ? await this.db.collection<WaConnection>('whatsapp_connections').findOne({ phoneNumberId }) : null;
      for (const status of value?.statuses ?? []) {
        const next = status.status === 'failed' ? 'failed' : status.status;
        const reason = status.errors?.[0]?.error_data?.details ?? status.errors?.[0]?.title ?? '';
        const updated = await this.db.collection('whatsapp_messages').findOneAndUpdate({ messageId: status.id }, { $set: { status: next, error: reason, updatedAt: new Date() } }, { returnDocument: 'before' });
        await this.db.collection('whatsapp_number_checks').updateOne({ messageId: status.id }, { $set: { status: next, error: status.errors?.[0]?.error_data?.details ?? '', updatedAt: new Date() } });
        if (next === 'failed' && updated?.status !== 'failed' && updated?.businessId) {
          const alertConnection = await this.db.collection<WaConnection>('whatsapp_connections').findOne({ businessId: updated.businessId });
          if (alertConnection?.failureEmailAlerts && alertConnection.failureAlertEmail) {
            void this.mail.sendWhatsAppFailureAlert(alertConnection.failureAlertEmail, { phone: String(updated.phone ?? ''), reason: reason || 'Meta reported that the message could not be delivered.' });
          }
        }
      }
      if (!connection) continue;
      for (const message of value?.messages ?? []) {
        const text = String(message?.text?.body ?? '').trim().toLowerCase();
        if (['stop', 'unsubscribe', 'cancel', 'end', 'quit'].includes(text)) {
          const digits = this.normalize(message.from ?? '');
          await this.db.collection('customers').updateMany(
            { businessId: connection.businessId, $or: [{ phoneNormalized: digits }, { phone: message.from }, { phone: `+${digits}` }] },
            { $set: { optedOut: true, optedOutAt: new Date(), optOutSource: 'whatsapp_stop' } },
          );
        }
      }
    }
    return { received: true };
  }
}
