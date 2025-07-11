import { Mongoose } from 'mongoose';
import {
  products,
  insertPriceInfo,
  upsertProductInfo,
  ISeedPrices,
  ISeedPriceInfo,
  ISeedProduct,
} from '../database/seeders/paymentSeeder';
import * as User from '../model/user';
import * as Tenant from '../model/tenants';
import * as StripeProduct from '../model/stripeProduct';
import * as StripeSubscription from '../model/stripeSubscription';
import { getFreePlanPriceId, getFreePlanProductId } from './stripeService';
import { getStripe } from '../lib/stripe';

interface PriceInfo {
  subscriptionAmount: number;
  currency: string;
  subscriptionPeriod: string | null;
}

interface StripePriceInfo {
  recurring: {
    interval: 'month' | 'year';
  };
  unit_amount: number;
  currency: string;
  product: string;
}

const createStripeProduct = async (product: ISeedProduct) => {
  const stripeProduct = await getStripe().products.create({
    name: product.stripeProductName,
    description: product.stripeProductDescription,
  });

  return stripeProduct;
};

const createStripePrice = async (stripeProductId: string, priceInfo: PriceInfo) => {
  const CENTS_PER_DOLLAR = 100;
  const totalAmount =
    priceInfo.subscriptionPeriod === 'year'
      ? priceInfo.subscriptionAmount * 12
      : priceInfo.subscriptionAmount;

  const stripePrice = await getStripe().prices.create({
    product: stripeProductId,
    unit_amount: totalAmount * CENTS_PER_DOLLAR,
    recurring: { interval: priceInfo.subscriptionPeriod },
    currency: priceInfo.currency,
  } as StripePriceInfo);

  return stripePrice;
};

const saveProductInStripeDashboard = async (product: ISeedProduct) => {
  const stripeProduct = await createStripeProduct(product);
  return stripeProduct.id;
};

const savePricesInStripeDashboardAndDatabase = async (
  tenantsConnection: Mongoose,
  stripeProductId: string,
  price: ISeedPriceInfo,
) => {
  const stripePrice = await createStripePrice(stripeProductId, price);
  const insertPrice = await insertPriceInfo(tenantsConnection, stripePrice.id, price);

  return insertPrice?.id || null;
};

const processPrices = async (
  tenantsConnection: Mongoose,
  stripeProductId: string,
  prices: ISeedPrices,
) => {
  const isEnterprise = !prices.monthly && !prices.yearly;
  if (isEnterprise) {
    return;
  }
  const stripeMonthlyPriceId =
    prices.monthly &&
    (await savePricesInStripeDashboardAndDatabase(
      tenantsConnection,
      stripeProductId,
      prices.monthly,
    ));
  const stripeYearlyPriceId =
    prices.yearly &&
    (await savePricesInStripeDashboardAndDatabase(
      tenantsConnection,
      stripeProductId,
      prices.yearly,
    ));

  return { stripeMonthlyPriceId, stripeYearlyPriceId };
};

const processProduct = async (tenantsConnection: Mongoose) => {
  const productModel = StripeProduct.getModel(tenantsConnection);

  for (let product of products) {
    let dbProduct = await productModel.findOne({ stripeProductName: product.stripeProductName });
    if (dbProduct || !product) return;
    const { stripePrices } = product;
    const stripeProductId = await saveProductInStripeDashboard(product);
    const { stripeMonthlyPriceId: monthlyPriceId, stripeYearlyPriceId: yearlyPriceId } =
      (await processPrices(tenantsConnection, stripeProductId, stripePrices)) || {};
    await upsertProductInfo(
      tenantsConnection,
      stripeProductId,
      monthlyPriceId,
      yearlyPriceId,
      product,
    );
  }
};

const processSubscription = async (tenantsConnection: Mongoose) => {
  const userModel = User.getModel(tenantsConnection);
  const tenantModel = Tenant.getModel(tenantsConnection);
  const stripeSubscriptionModel = StripeSubscription.getModel(tenantsConnection);
  const freePlanPriceId = await getFreePlanPriceId(tenantsConnection);
  const freePlanProductId = await getFreePlanProductId(tenantsConnection);
  const tenants = await tenantModel.find()
    .populate({
      path: 'owner',
      model: userModel,
      select: 'email',
    });

  for (const tenant of tenants) {
    if (!tenant.owner) {
      throw new Error(`Tenant ${tenant._id} does not have an owner.`);
    }
    const tenantSubscription = await stripeSubscriptionModel.findOne({ tenant: tenant._id });
    if (tenantSubscription) continue;
    
    const customerInfo = await getStripe().customers.create({
      email: tenant.owner.email,
      metadata: { tenantId: tenant.id },
    });
    const stripeCustomerId = customerInfo.id;
    const subscriptionInfo = await getStripe().subscriptions.create({
      customer: stripeCustomerId,
      items: [{ price: freePlanPriceId }],
      metadata: { tenantId: tenant.id },
    });
    const stripeSubscriptionId = subscriptionInfo.id;
    const stripeSubscriptionStatus = subscriptionInfo.status;
    await stripeSubscriptionModel.findOneAndUpdate(
      { tenant: tenant._id },
      {
        stripeCustomerId: stripeCustomerId,
        stripeSubscriptionId: stripeSubscriptionId,
        stripePriceId: freePlanPriceId,
        stripeProductId: freePlanProductId,
        stripeSubscriptionStatus: stripeSubscriptionStatus,
      },
      { upsert: true, new: true },
    );

    await tenantModel.findByIdAndUpdate(tenant._id, {
      tenantTrialHistory: [
        {
          productId: freePlanProductId,
          priceIds: [freePlanPriceId],
        },
      ],
    });
  }   
};

export { processProduct, processSubscription };
