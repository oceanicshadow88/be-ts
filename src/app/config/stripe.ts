export {};
const dotenv = require('dotenv');
process.env.NODE_ENV = process.env.NODE_ENV ?? 'development';
dotenv.config();

const stripeConfig = {
  stripeWebhookSecretKey: process.env.STRIPE_WEBHOOK_SECRET ?? '',
  stripeApiSecretKey: process.env.STRIPE_SECRET_KEY ?? '',
  stripeEnabled: process.env.STRIPE_ENABLE === 'true' ? true : false,
};

export default stripeConfig;
