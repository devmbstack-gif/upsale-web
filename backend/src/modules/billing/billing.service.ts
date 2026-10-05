import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectConnection } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import type { Connection } from 'mongoose';
import Stripe from 'stripe';
import { ConfirmCheckoutDto, CreateCheckoutDto } from './billing.dto.js';

type Pricing = { currency: string; amount: number; interval: 'month' | 'year' };
type PackageRecord = {
  name: string;
  slug: string;
  shortDescription: string;
  isActive: boolean;
  isEnterprise: boolean;
  countryPricing: Pricing[];
};
type BusinessRecord = { email: string; currency?: string };

@Injectable()
export class BillingService {
  private readonly stripe: Stripe;

  constructor(
    private readonly config: ConfigService,
    @InjectConnection() private readonly connection: Connection,
  ) {
    this.stripe = new Stripe(config.getOrThrow<string>('STRIPE_SECRET_KEY'));
  }

  private async businessAndPackage(businessId: string, planSlug: string) {
    const businesses = this.connection.collection<BusinessRecord>('businesses');
    const packages = this.connection.collection<PackageRecord>('packages');
    const [business, plan] = await Promise.all([
      businesses.findOne({ _id: new Types.ObjectId(businessId) }),
      packages.findOne({ slug: planSlug, isActive: true, isEnterprise: false }),
    ]);
    if (!business) throw new NotFoundException('Business account not found.');
    if (!plan) throw new NotFoundException('Plan not found or unavailable.');

    const currency = business.currency?.toUpperCase();
    const pricing =
      plan.countryPricing.find((item) => item.currency.toUpperCase() === currency) ??
      plan.countryPricing.find((item) => item.currency.toUpperCase() === 'USD') ??
      plan.countryPricing[0];
    if (!pricing || pricing.amount <= 0) {
      throw new BadRequestException('This plan has no purchasable price for your account.');
    }
    return { business, plan, pricing };
  }

  async createCheckout(dto: CreateCheckoutDto) {
    const { business, plan, pricing } = await this.businessAndPackage(dto.businessId, dto.planSlug);
    const session = await this.stripe.checkout.sessions.create({
      mode: 'subscription',
      client_reference_id: dto.businessId,
      customer_email: business.email,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: pricing.currency.toLowerCase(),
            unit_amount: Math.round(pricing.amount * 100),
            recurring: { interval: pricing.interval },
            product_data: {
              name: `UPSale ${plan.name}`,
              description: plan.shortDescription,
              metadata: { planSlug: plan.slug },
            },
          },
        },
      ],
      metadata: { businessId: dto.businessId, planSlug: plan.slug },
      subscription_data: { metadata: { businessId: dto.businessId, planSlug: plan.slug } },
      success_url: `${dto.successUrl}${dto.successUrl.includes('?') ? '&' : '?'}session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: dto.cancelUrl,
    });
    if (!session.url) throw new BadRequestException('Stripe did not return a checkout URL.');
    return { url: session.url };
  }

  async confirmCheckout(dto: ConfirmCheckoutDto) {
    const session = await this.stripe.checkout.sessions.retrieve(dto.sessionId);
    if (
      session.client_reference_id !== dto.businessId ||
      session.metadata?.businessId !== dto.businessId
    ) {
      throw new BadRequestException('This checkout does not belong to your account.');
    }
    if (session.status !== 'complete' || !['paid', 'no_payment_required'].includes(session.payment_status)) {
      throw new BadRequestException('Payment is not complete.');
    }
    return this.activateCheckout(session);
  }

  private async activateCheckout(session: Stripe.Checkout.Session) {
    const businessId = session.metadata?.businessId ?? session.client_reference_id;
    const planSlug = session.metadata?.planSlug;
    if (!businessId || !Types.ObjectId.isValid(businessId)) {
      throw new BadRequestException('Checkout business is missing.');
    }
    if (!planSlug) throw new BadRequestException('Checkout plan is missing.');
    const plan = await this.connection
      .collection<PackageRecord>('packages')
      .findOne({ slug: planSlug, isActive: true });
    if (!plan) throw new NotFoundException('Purchased plan no longer exists.');

    await this.connection.collection('businesses').updateOne(
      { _id: new Types.ObjectId(businessId) },
      {
        $set: {
          plan: plan.name,
          planSlug,
          subscriptionStatus: 'active',
          stripeCustomerId: String(session.customer ?? ''),
          stripeSubscriptionId: String(session.subscription ?? ''),
        },
      },
    );
    return { plan: plan.name };
  }

  async handleWebhook(signature: string | undefined, rawBody: Buffer | undefined) {
    const webhookSecret = this.config.get<string>('STRIPE_WEBHOOK_SECRET');
    if (!webhookSecret || !signature || !rawBody) {
      throw new BadRequestException('Stripe webhook is not configured.');
    }
    const event = this.stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    if (event.type === 'checkout.session.completed') {
      await this.activateCheckout(event.data.object);
    } else if (event.type === 'customer.subscription.deleted') {
      await this.connection.collection('businesses').updateOne(
        { stripeSubscriptionId: event.data.object.id },
        { $set: { subscriptionStatus: 'cancelled' } },
      );
    } else if (event.type === 'invoice.payment_failed') {
      const subscription = event.data.object.parent?.subscription_details?.subscription;
      const subscriptionId = typeof subscription === 'string' ? subscription : subscription?.id;
      if (subscriptionId) {
        await this.connection.collection('businesses').updateOne(
          { stripeSubscriptionId: subscriptionId },
          { $set: { subscriptionStatus: 'past_due' } },
        );
      }
    } else if (event.type === 'invoice.paid') {
      const subscription = event.data.object.parent?.subscription_details?.subscription;
      const subscriptionId = typeof subscription === 'string' ? subscription : subscription?.id;
      if (subscriptionId) {
        await this.connection.collection('businesses').updateOne(
          { stripeSubscriptionId: subscriptionId },
          { $set: { subscriptionStatus: 'active' } },
        );
      }
    } else if (event.type === 'customer.subscription.updated') {
      const subscription = event.data.object;
      const status = ['active', 'trialing'].includes(subscription.status)
        ? 'active'
        : ['past_due', 'unpaid'].includes(subscription.status)
          ? 'past_due'
          : subscription.status === 'canceled'
            ? 'cancelled'
            : subscription.status;
      await this.connection.collection('businesses').updateOne(
        { stripeSubscriptionId: subscription.id },
        { $set: { subscriptionStatus: status } },
      );
    }
    return { received: true };
  }
}
