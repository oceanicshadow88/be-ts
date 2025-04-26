import Stripe from 'stripe';
import stripeConfig from '../config/stripe';

let stripe: Stripe | null = null;

export const getStripe = () => {
  if (!stripe) {
    stripe = new Stripe(stripeConfig.stripeApiSecretKey, { apiVersion: '2025-02-24.acacia' });
    return stripe;
  }
  return stripe;
};
