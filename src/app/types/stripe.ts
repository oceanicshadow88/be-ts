import { Stripe } from 'stripe';

export interface IStripeSessionData {
  sessionId: string;
  tenantId: string;
  productId: string;
  priceId: string;
  customerId: string;
  currentActiveSubscriptionId: string;
  subscriptionStatus: string;
}

export interface IStripeSubscriptionData {
  subscriptionId: string;
  customerId: string;
  productId: string;
  priceId: string;
  subscriptionStatus: string;
  previousSubscriptionAttributes: Partial<Stripe.Subscription>;
}
