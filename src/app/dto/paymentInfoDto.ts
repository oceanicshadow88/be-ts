import { IProductInfo } from '../types';

export const paymentInfoDtos = (stripeProduct: IProductInfo[]) => {
  return stripeProduct.map((item: IProductInfo) => {
    return {
      objectId: item._id,
      productId: item.stripeProductId,
      productName: item.stripeProductName,
      productDescription: item.stripeProductDescription,
      prices: {
        monthly: item.stripePrices?.monthly
          ? {
            priceId: item.stripePrices.monthly.stripePriceId,
            subscriptionAmount: item.stripePrices.monthly.subscriptionAmount,
            subscriptionPeriod: item.stripePrices.monthly.subscriptionPeriod,
          }
          : null,
        yearly: item.stripePrices?.yearly
          ? {
            priceId: item.stripePrices.yearly.stripePriceId,
            subscriptionAmount: item.stripePrices.yearly.subscriptionAmount,
            subscriptionPeriod: item.stripePrices.yearly.subscriptionPeriod,
          }
          : null,
      },
    };
  });
};
