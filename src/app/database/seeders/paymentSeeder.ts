import * as StripeProduct from '../../model/stripeProduct';
import * as StripePrice from '../../model/stripePrice';
import { Mongoose } from 'mongoose';

export interface ISeedPriceInfo {
  subscriptionAmount: number;
  currency: string;
  subscriptionPeriod: string | null;
}

export interface ISeedPrices {
  monthly: ISeedPriceInfo | null;
  yearly: ISeedPriceInfo | null;
}
export interface ISeedProduct {
  stripeProductName: string;
  stripeProductDescription: string;
  stripePrices: ISeedPrices;
}

const FREE_PLAN = 'Free';

const products: ISeedProduct[] = [
  {
    stripeProductName: 'Free',
    stripeProductDescription: 'Perfect for individuals or new businesses.',
    stripePrices: {
      monthly: {
        subscriptionAmount: 0,
        currency: 'USD',
        subscriptionPeriod: 'month',
      },
      yearly: null,
    },
  },
  {
    stripeProductName: 'Advanced',
    stripeProductDescription:
      'Affordable tools small businesses need to manage their inventory and assets.',
    stripePrices: {
      monthly: {
        subscriptionAmount: 49,
        currency: 'USD',
        subscriptionPeriod: 'month',
      },
      yearly: {
        subscriptionAmount: 29,
        currency: 'USD',
        subscriptionPeriod: 'year',
      },
    },
  },
  {
    stripeProductName: 'Ultra',
    stripeProductDescription: 'Scalable inventory solution for growing businesses.',
    stripePrices: {
      monthly: {
        subscriptionAmount: 149,
        currency: 'USD',
        subscriptionPeriod: 'month',
      },
      yearly: {
        subscriptionAmount: 59,
        currency: 'USD',
        subscriptionPeriod: 'year',
      },
    },
  },
  {
    stripeProductName: 'Enterprise',
    stripeProductDescription:
      'For organizations that need additional security, control, and support.',
    stripePrices: {
      monthly: null,
      yearly: null,
    },
  },
];

const insertPriceInfo = async (
  tenantsConnection: Mongoose,
  stripePriceId: string,
  priceInfo: ISeedPriceInfo,
) => {
  const priceModel = StripePrice.getModel(tenantsConnection);

  const insertMonthlyPrice = await priceModel.create({
    stripePriceId: stripePriceId,
    subscriptionAmount: priceInfo.subscriptionAmount,
    subscriptionPeriod: priceInfo.subscriptionPeriod,
  });

  return insertMonthlyPrice;
};

const upsertProductInfo = async (
  tenantsConnection: Mongoose,
  stripeProductId: string,
  monthlyPriceId: string | null,
  yearlyPriceId: string | null,
  product: ISeedProduct,
) => {
  const productModel = StripeProduct.getModel(tenantsConnection);

  if (product.stripeProductName === FREE_PLAN) {
    yearlyPriceId = monthlyPriceId;
  }
  const updatedOrInsertProduct = await productModel.findOneAndUpdate(
    { stripeProductId: stripeProductId },
    {
      stripeProductId: stripeProductId,
      stripeProductName: product.stripeProductName,
      stripeProductDescription: product.stripeProductDescription,
      stripePrices: {
        monthly: monthlyPriceId,
        yearly: yearlyPriceId,
      },
    },
    { upsert: true, new: true },
  );

  return updatedOrInsertProduct;
};

export { products, insertPriceInfo, upsertProductInfo };
