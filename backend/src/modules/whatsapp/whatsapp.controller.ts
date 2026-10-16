import { Body, Controller, Get, Headers, Post, Query, Req, Res, UnauthorizedException } from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import type { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { WhatsAppService } from './whatsapp.service.js';
import { BusinessRequestDto, ConnectWhatsAppDto, EmbeddedSignupDto, ScheduleCampaignDto, SendCampaignDto, TestWhatsAppDto, VerifyNumberDto, WhatsAppPreferencesDto } from './whatsapp.dto.js';

@Controller()
export class WhatsAppController {
  constructor(private readonly whatsapp: WhatsAppService, private readonly config: ConfigService) {}

  private internal(secret?: string) {
    if (!secret || secret !== this.config.getOrThrow<string>('INTERNAL_API_SECRET')) throw new UnauthorizedException();
  }

  @Post('internal/whatsapp/connect')
  connect(@Headers('x-internal-secret') secret: string | undefined, @Body() dto: ConnectWhatsAppDto) {
    this.internal(secret); return this.whatsapp.connect(dto);
  }

  @Post('internal/whatsapp/embedded-signup')
  embeddedSignup(@Headers('x-internal-secret') secret: string | undefined, @Body() dto: EmbeddedSignupDto) {
    this.internal(secret); return this.whatsapp.connectEmbeddedSignup(dto);
  }

  @Post('internal/whatsapp/status')
  status(@Headers('x-internal-secret') secret: string | undefined, @Body() dto: BusinessRequestDto) {
    this.internal(secret); return this.whatsapp.status(dto.businessId);
  }

  @Post('internal/whatsapp/test')
  test(@Headers('x-internal-secret') secret: string | undefined, @Body() dto: TestWhatsAppDto) {
    this.internal(secret); return this.whatsapp.test(dto.businessId, dto.recipient);
  }

  @Post('internal/whatsapp/verify-number')
  verifyNumber(@Headers('x-internal-secret') secret: string | undefined, @Body() dto: VerifyNumberDto) {
    this.internal(secret); return this.whatsapp.verifyNumber(dto.phone);
  }

  @Post('internal/whatsapp/send-campaign')
  campaign(@Headers('x-internal-secret') secret: string | undefined, @Body() dto: SendCampaignDto) {
    this.internal(secret); return this.whatsapp.sendCampaign(dto);
  }

  @Post('internal/whatsapp/schedule-campaign')
  scheduleCampaign(@Headers('x-internal-secret') secret: string | undefined, @Body() dto: ScheduleCampaignDto) {
    this.internal(secret); return this.whatsapp.scheduleCampaign(dto);
  }

  @Post('internal/whatsapp/health')
  health(@Headers('x-internal-secret') secret: string | undefined) {
    this.internal(secret); return this.whatsapp.health();
  }

  @Post('internal/whatsapp/history')
  history(@Headers('x-internal-secret') secret: string | undefined, @Body() dto: BusinessRequestDto) {
    this.internal(secret); return this.whatsapp.history(dto.businessId);
  }

  @Post('internal/whatsapp/preferences')
  preferences(@Headers('x-internal-secret') secret: string | undefined, @Body() dto: WhatsAppPreferencesDto) {
    this.internal(secret); return this.whatsapp.preferences(dto.businessId, dto.failureEmailAlerts, dto.failureAlertEmail);
  }

  @Get('webhooks/whatsapp')
  verifyWebhook(@Query('hub.mode') mode: string, @Query('hub.verify_token') token: string, @Query('hub.challenge') challenge: string, @Res() response: Response) {
    if (mode === 'subscribe' && token === this.config.get<string>('WHATSAPP_WEBHOOK_VERIFY_TOKEN')) return response.status(200).send(challenge);
    return response.sendStatus(403);
  }

  @Post('webhooks/whatsapp')
  async receiveWebhook(@Headers('x-hub-signature-256') signature: string | undefined, @Req() request: RawBodyRequest<Request>) {
    if (!request.rawBody || !this.whatsapp.verifyWebhookSignature(request.rawBody, signature)) throw new UnauthorizedException('Invalid WhatsApp webhook signature.');
    return this.whatsapp.webhook(request.body);
  }
}
