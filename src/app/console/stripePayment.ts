/* eslint-disable no-console */
import { tenantsDBConnection } from '../database/connections';
import { processProduct } from '../services/paymentSeedingService';

const init = async () => {
  try {
    const tenantsDbConnection = await tenantsDBConnection();
    processProduct(tenantsDbConnection);
    console.log('Process complete');
  } catch (e) {
    console.error('Cannot seed Product to Stripe', e?.toString());
  }
};

init();
