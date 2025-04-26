import { Mongoose } from 'mongoose';
import {
  products,
  insertPriceInfo,
  upsertProductInfo,
  ISeedPrices,
  ISeedPriceInfo,
  ISeedProduct,
} from '../database/seeders/paymentSeeder';
import * as StripeProduct from '../model/stripeProduct';
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

export { processProduct };
