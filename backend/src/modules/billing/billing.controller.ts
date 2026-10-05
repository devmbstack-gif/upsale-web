import { Body, Controller, Headers, Post, Req, UnauthorizedException } from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';
import { BillingService } from './billing.service.js';
import { ConfirmCheckoutDto, CreateCheckoutDto } from './billing.dto.js';

@Controller('internal/billing')
export class BillingController {
  constructor(
    private readonly billing: BillingService,
    private readonly config: ConfigService,
  ) {}

  private authorize(secret: string | undefined) {
    if (!secret || secret !== this.config.getOrThrow<string>('INTERNAL_API_SECRET')) {
      throw new UnauthorizedException();
    }
  }

  @Post('checkout')
  async checkout(@Headers('x-internal-secret') secret: string | undefined, @Body() dto: CreateCheckoutDto) {
    this.authorize(secret);
    return { ok: true, ...(await this.billing.createCheckout(dto)) };
  }

  @Post('confirm')
  async confirm(@Headers('x-internal-secret') secret: string | undefined, @Body() dto: ConfirmCheckoutDto) {
    this.authorize(secret);
    return { ok: true, ...(await this.billing.confirmCheckout(dto)) };
  }

  @Post('webhook')
  webhook(
    @Headers('stripe-signature') signature: string | undefined,
    @Req() request: RawBodyRequest<Request>,
  ) {
    return this.billing.handleWebhook(signature, request.rawBody);
  }
}
