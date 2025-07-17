/* eslint-disable no-console */
import { tenantsDBConnection } from '../database/connections';
import { processProduct, processSubscription } from '../services/paymentSeedingService';
import stripeConfig from '../config/stripe';

const init = async () => {
  if (!stripeConfig.stripeEnabled) {
    console.error('Stripe is not enabled. Please set STRIPE_ENABLE to true in your environment variables.');
    return;
  }

  try {
    const tenantsDbConnection = await tenantsDBConnection();
    await processProduct(tenantsDbConnection);
    await processSubscription(tenantsDbConnection);
    console.log('Process complete');
    process.exit(0);
  } catch (e) {
    console.error('Cannot seed Product to Stripe', e?.toString());
    process.exit(1);
  }
};

init();
