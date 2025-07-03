import * as StripeProduct from '../model/stripeProduct';
import * as StripePrice from '../model/stripePrice';
import * as StripeSession from '../model/stripeSession';
import * as StripeSubscription from '../model/stripeSubscription';
import * as Tenant from '../model/tenants';
import { winstonLogger } from '../../loaders/logger';
import mongoose, { Mongoose } from 'mongoose';
import { getStripe } from '../lib/stripe';
import { Stripe } from 'stripe';
import stripeConfig from '../config/stripe';
import { tenantsDBConnection } from '../database/connections';
import { ITenantTrialHistory } from '../types';
import { IStripeSessionData, IStripeSubscriptionData } from '../types/stripe';

const isFreePlan = async (tenantsConnection: Mongoose, priceId?: string) => {
  const FREE_PLAN_SUBSCRIPTION_AMOUNT = 0;
  const stripePriceModel = StripePrice.getModel(tenantsConnection);
  const priceInfo = await stripePriceModel.findOne({
    stripePriceId: priceId,
  });

  if (!priceInfo) {
    throw new Error('Product not been found');
  }
  return priceInfo.subscriptionAmount === FREE_PLAN_SUBSCRIPTION_AMOUNT;
};

export const createStripeCheckoutSession = async (
  tenantsConnection: Mongoose,
  domainURL: string,
  priceId: string,
  customerId: string,
  tenantId: string,
) => {
  const PRODUCT_QUANTITY = 1;
  const TRIAL_PERIOD_DAYS = 7;
  const isPlanFree = await isFreePlan(tenantsConnection, priceId);
  let successURL = domainURL + '/payment/success';
  let priceURL = domainURL + '/price';

  const stripeCheckoutSession = await getStripe().checkout.sessions.create({
    customer: customerId,
    line_items: [
      {
        price: priceId,
        quantity: PRODUCT_QUANTITY,
      },
    ],
    metadata: {
      domainURL: domainURL,
      tenantId: tenantId,
    },
    mode: 'subscription',
    success_url: successURL,
    cancel_url: priceURL,
    payment_method_collection: 'if_required',
    subscription_data: {
      trial_period_days: TRIAL_PERIOD_DAYS,
    },
  });
  return { url: stripeCheckoutSession.url, isPlanFree: isPlanFree };
};

const getTenantInfo = async (tenantsConnection: Mongoose, tenantId: string) => {
  const tenantModel = await Tenant.getModel(tenantsConnection);
  return tenantModel.findOne({ _id: new mongoose.Types.ObjectId(tenantId) });
};

const hasStripeSession = async (tenantsConnection: Mongoose, tenantId: string) => {
  const stripeSessionModel = StripeSession.getModel(tenantsConnection);
  return stripeSessionModel.findOne({ tenant: new mongoose.Types.ObjectId(tenantId) });
};

const createSubscriptionConfiguration = async (plansUserHasSubscribed: ITenantTrialHistory[]) => {
  const formattedProducts = plansUserHasSubscribed.map(
    (item: { productId: string; priceIds: string[] }) => ({
      product: item.productId,
      prices: item.priceIds,
    }),
  );

  const currentSubscriptionConfiguration = await getStripe().billingPortal.configurations.create({
    features: {
      subscription_update: {
        default_allowed_updates: ['price'],
        enabled: true,
        products: formattedProducts,
        proration_behavior: 'create_prorations',
      },
      customer_update: {
        enabled: true,
        allowed_updates: ['email', 'address', 'name'],
      },
      payment_method_update: { enabled: true },
      invoice_history: { enabled: true },
    },
  });
  return currentSubscriptionConfiguration.id;
};

export const createStripeCustomerPortal = async (
  tenantsConnection: Mongoose,
  customerId: string,
  domainUrl: string,
  tenantId: string,
) => {
  if (customerId === '') {
    winstonLogger.error('stripeService: Missing customer Id');
    throw new Error('Missing customer Id');
  }
  const returnURL = domainUrl + '/projects';

  const tenantInfo = await getTenantInfo(tenantsConnection, tenantId);
  const hasStripeCheckoutSession = await hasStripeSession(tenantsConnection, tenantId);
  const plansUserHasSubscribed = tenantInfo.tenantTrialHistory;

  const configurationId = hasStripeCheckoutSession
    ? await createSubscriptionConfiguration(plansUserHasSubscribed)
    : undefined;

  const stripeCustomerPortal = await getStripe().billingPortal.sessions.create({
    customer: customerId,
    configuration: configurationId,
    return_url: returnURL,
  });

  return stripeCustomerPortal.url;
};

export const getAllProductsInfo = async () => {
  const tenantsConnection = await tenantsDBConnection();
  const stripeProductModel = StripeProduct.getModel(tenantsConnection);
  const stripePriceModel = StripePrice.getModel(tenantsConnection);

  const allStripeProductsInfo = await stripeProductModel
    .find({})
    .populate({
      path: 'stripePrices.monthly',
      select: 'stripePriceId subscriptionAmount subscriptionPeriod',
      model: stripePriceModel,
    })
    .populate({
      path: 'stripePrices.yearly',
      select: 'stripePriceId subscriptionAmount subscriptionPeriod',
      model: stripePriceModel,
    });
  return allStripeProductsInfo;
};

export const getPriceInfoById = async (tenantsConnection: Mongoose, priceId: string) => {
  const stripePriceModel = StripePrice.getModel(tenantsConnection);
  const stripePriceInfo = await stripePriceModel.findById(priceId);
  return stripePriceInfo;
};

export const getSubscriptionHistory = async (tenantsConnection: Mongoose, tenantId: string) => {
  const tenantInfo = await getTenantInfo(tenantsConnection, tenantId);
  const productModel = StripeProduct.getModel(tenantsConnection);
  const customerSubscriptionHistory = [];

  for (let product of tenantInfo.tenantTrialHistory) {
    const productInfo = await productModel.findOne({ stripeProductId: product.productId });
    if (!productInfo) {
      winstonLogger.error('stripeService: Missing product info');
      throw new Error('product info not found');
    }
    customerSubscriptionHistory.push(productInfo.stripeProductName);
  }
  return customerSubscriptionHistory;
};

export const getCurrentPlanId = async (tenantId: string, tenantsConnection: Mongoose) => {
  const stripeSubscriptionModel = StripeSubscription.getModel(tenantsConnection);
  const tenantSubscriptionInfo = await stripeSubscriptionModel.findOne({
    tenant: new mongoose.Types.ObjectId(tenantId),
    stripeSubscriptionStatus: { $in: ['active', 'trialing'] },
  });
  if (!tenantSubscriptionInfo) {
    winstonLogger.error('stripeService: Missing tenant subscription info');
    throw new Error('tenant subscription info not found');
  }
  const stripeProductId = tenantSubscriptionInfo.stripeProductId;
  return stripeProductId;
};

export const getFreePlanPriceId = async (tenantsConnection: Mongoose) => {
  const FREE_PLAN = 'Free';
  const stripePriceModel = StripePrice.getModel(tenantsConnection);
  const stripeProductModel = StripeProduct.getModel(tenantsConnection);
  const freePlanProduct = await stripeProductModel
    .findOne({ stripeProductName: FREE_PLAN })
    .populate({
      path: 'stripePrices.monthly',
      select: 'stripePriceId',
      model: stripePriceModel,
    });
  if (!freePlanProduct) {
    winstonLogger.error('stripeService: Missing free plan Product');
    throw new Error('Free plan is not found');
  }
  const freePlanPriceId = freePlanProduct.stripePrices.monthly?.stripePriceId;
  return freePlanPriceId;
};

export const getFreePlanProductId = async () => {
  const FREE_PLAN = 'Free';
  const tenantsConnection = await tenantsDBConnection();
  const stripeProductModel = StripeProduct.getModel(tenantsConnection);
  const freePlanProduct = await stripeProductModel.findOne({ stripeProductName: FREE_PLAN });
  if (!freePlanProduct) {
    winstonLogger.error('stripeService: Missing free plan Product');
    throw new Error('Free plan is not found');
  }
  const freePlanProductId = freePlanProduct.stripeProductId;
  return freePlanProductId;
};

export const isCurrentPlanFree = async (tenantId: string, tenantsConnection: Mongoose) => {
  if (tenantId === '') {
    winstonLogger.error('stripeService: Missing tenant Id');
    throw new Error('TenantId is not found');
  }

  const stripeSubscriptionModel = StripeSubscription.getModel(tenantsConnection);
  const tenantSubscriptionInfo = await stripeSubscriptionModel.findOne({
    tenant: new mongoose.Types.ObjectId(tenantId),
  });
  const freePlanPriceId = await getFreePlanPriceId(tenantsConnection);
  if (!tenantSubscriptionInfo) {
    winstonLogger.error('stripeService: Missing tenant subscription info');
    throw new Error('tenant subscription info not found');
  }
  const stripePriceId = tenantSubscriptionInfo.stripePriceId;
  if (stripePriceId === freePlanPriceId) {
    return true;
  }
  return false;
};

export const isCurrentPlanSubscribed = async (
  tenantsConnection: Mongoose,
  priceId: string,
  tenantId: string,
) => {
  const tenantInfo = await getTenantInfo(tenantsConnection, tenantId);
  for (let product of tenantInfo.tenantTrialHistory) {
    if (product.priceIds.includes(priceId)) {
      return true;
    }
  }
  return false;
};

export const getCustomerId = async (tenantId: string, tenantsConnection: Mongoose) => {
  const stripeSubscriptionModel = StripeSubscription.getModel(tenantsConnection);
  const tenantSubscriptionInfo = await stripeSubscriptionModel.findOne({
    tenant: new mongoose.Types.ObjectId(tenantId),
  });
  if (tenantSubscriptionInfo) {
    return tenantSubscriptionInfo.stripeCustomerId;
  }
};

const saveStripeSessionModel = async (
  tenantsConnection: Mongoose,
  sessionData: IStripeSessionData,
) => {
  const stripeSessionModel = StripeSession.getModel(tenantsConnection);
  await stripeSessionModel.create({
    stripeSessionId: sessionData.sessionId,
    tenant: sessionData.tenantId,
  });
};

const getPriceIdByProductId = async (tenantsConnection: Mongoose, currentPlan: string) => {
  const stripeProductModel = StripeProduct.getModel(tenantsConnection);
  const stripePriceModel = StripePrice.getModel(tenantsConnection);
  const relatedPriceId = await stripeProductModel
    .findOne({ stripeProductId: currentPlan })
    .populate({
      path: 'stripePrices.monthly',
      select: 'stripePriceId',
      model: stripePriceModel,
    })
    .populate({
      path: 'stripePrices.yearly',
      select: 'stripePriceId',
      model: stripePriceModel,
    });

  if (!relatedPriceId) {
    winstonLogger.error('stripeService: Missing stripe priceId');
    throw new Error('Stripe priceId not found');
  }
  return relatedPriceId;
};

const updateTenantModel = async (
  tenantsConnection: Mongoose,
  tenantId: string,
  currentPlan: string,
  stripeProductName: string,
) => {
  const priceIdsArray = [];
  const tenantModel = await Tenant.getModel(tenantsConnection);
  const relatedPriceId = await getPriceIdByProductId(tenantsConnection, currentPlan);

  if (relatedPriceId.stripePrices.monthly) {
    priceIdsArray.push(relatedPriceId.stripePrices.monthly.stripePriceId);
  }
  if (relatedPriceId.stripePrices.yearly) {
    priceIdsArray.push(relatedPriceId.stripePrices.yearly.stripePriceId);
  }

  await tenantModel.findOneAndUpdate(
    { _id: tenantId },
    {
      $set: { plan: stripeProductName },
      $addToSet: {
        tenantTrialHistory: {
          productId: currentPlan,
          priceIds: priceIdsArray,
        },
      },
    },
  );
};

const saveStripeSubscriptionModel = async (
  tenantsConnection: Mongoose,
  sessionData: IStripeSessionData,
) => {
  const {
    tenantId,
    productId,
    priceId,
    customerId,
    currentActiveSubscriptionId,
    subscriptionStatus,
  } = sessionData;
  const stripeSubscriptionModel = StripeSubscription.getModel(tenantsConnection);
  await stripeSubscriptionModel.create({
    tenant: new mongoose.Types.ObjectId(tenantId),
    stripeProductId: productId,
    stripePriceId: priceId,
    stripeCustomerId: customerId,
    stripeSubscriptionId: currentActiveSubscriptionId,
    stripeSubscriptionStatus: subscriptionStatus,
  });
};

const saveStripeCheckoutData = async (
  tenantsConnection: Mongoose,
  sessionData: IStripeSessionData,
) => {
  const { tenantId, productId } = sessionData;
  const stripeProductModel = StripeProduct.getModel(tenantsConnection);
  const stripeProduct = await stripeProductModel.findOne({ stripeProductId: productId });
  if (!stripeProduct) {
    winstonLogger.error('stripeService: Missing stripe product');
    throw new Error('Stripe product not found');
  }
  const stripeProductName = stripeProduct.stripeProductName.toLowerCase();

  await saveStripeSessionModel(tenantsConnection, sessionData);
  await updateTenantModel(tenantsConnection, tenantId, productId, stripeProductName);
  await saveStripeSubscriptionModel(tenantsConnection, sessionData);
};

const handleCheckoutSessionCompleted = async (
  tenantId: string,
  tenantsConnection: Mongoose,
  event: Stripe.Event,
) => {
  const checkoutSessionData = event.data.object as Stripe.Checkout.Session;
  const sessionId = checkoutSessionData.id;
  const currentActiveSubscriptionId = checkoutSessionData.subscription as string;
  const customerId = checkoutSessionData.customer as string;
  const subscription = await getStripe().subscriptions.retrieve(currentActiveSubscriptionId);
  const productId = subscription.items.data[0]?.price.product as string;
  const priceId = subscription.items.data[0]?.price.id;
  const subscriptionStatus = subscription.status as string;
  const stripeSessionData = {
    sessionId,
    tenantId,
    customerId,
    currentActiveSubscriptionId,
    productId,
    priceId,
    subscriptionStatus,
  };

  const stripeSubscriptionModel = StripeSubscription.getModel(tenantsConnection);
  const tenantActiveSubscriptionInfo = await stripeSubscriptionModel.findOne({
    tenant: new mongoose.Types.ObjectId(tenantId),
    stripeSubscriptionStatus: { $in: ['active', 'trialing'] },
  });
  if (!tenantActiveSubscriptionInfo) {
    winstonLogger.error('stripeService: Missing tenant active subscription information');
    throw new Error('Tenant active subscription info not found');
  }
  await getStripe().subscriptions.cancel(tenantActiveSubscriptionInfo.stripeSubscriptionId);
  await stripeSubscriptionModel.findOneAndUpdate(
    { stripeSubscriptionId: tenantActiveSubscriptionInfo.stripeSubscriptionId },
    {
      stripeSubscriptionStatus: 'canceled',
      updatedAt: new Date(),
    },
  );
  await saveStripeCheckoutData(tenantsConnection, stripeSessionData);
};

const moveUserToFreePlan = async (
  tenantsConnection: Mongoose,
  tenantId: string,
  subscriptionId: string,
  customerId: string,
) => {
  const freePlanProductId = await getFreePlanProductId();
  const freePlanPriceId = await getFreePlanPriceId(tenantsConnection);

  await getStripe().subscriptions.update(subscriptionId, {
    items: [{
      price: freePlanPriceId,
    }],
  });
  const stripeSubscriptionModel = StripeSubscription.getModel(tenantsConnection);

  await stripeSubscriptionModel.findOneAndUpdate(
    {
      tenant: new mongoose.Types.ObjectId(tenantId),
      stripeSubscriptionId: subscriptionId,
    },
    {
      stripeCustomerId: customerId,
      stripeSubscriptionStatus: 'active',
      stripePriceId: freePlanPriceId,
      stripeProductId: freePlanProductId,
    },
  );
};

const updateSubscriptionPlan = async (
  tenantsConnection: Mongoose,
  tenantId: string,
  stripeSubscriptionData: IStripeSubscriptionData,
) => {
  const { subscriptionId, priceId, productId } = stripeSubscriptionData;
  const stripeSubscriptionModel = StripeSubscription.getModel(tenantsConnection);
  await stripeSubscriptionModel.findOneAndUpdate(
    {
      tenant: new mongoose.Types.ObjectId(tenantId),
      stripeSubscriptionId: subscriptionId,
    },
    {
      stripePriceId: priceId,
      stripeProductId: productId,
      stripeSubscriptionStatus: 'active',
    },
  );
};

const handleFreeTrialEnd = async (
  tenantsConnection: Mongoose,
  tenantId: string,
  stripeSubscriptionData: IStripeSubscriptionData,
) => {
  const { subscriptionId, customerId, priceId, productId, subscriptionStatus } =
    stripeSubscriptionData;
  const stripeSubscriptionModel = StripeSubscription.getModel(tenantsConnection);
  if (subscriptionStatus === 'past_due') {
    await moveUserToFreePlan(tenantsConnection, tenantId, subscriptionId, customerId);
  }
  if (subscriptionStatus === 'active') {
    await stripeSubscriptionModel.findOneAndUpdate(
      {
        tenant: new mongoose.Types.ObjectId(tenantId),
        stripeSubscriptionStatus: 'active',
      },
      {
        stripePriceId: priceId,
        stripeProductId: productId,
      },
    );
  }
};

const handleSubscriptionUpdated = async (
  tenantId: string,
  tenantsConnection: Mongoose,
  event: Stripe.Event,
) => {
  const subscriptionUpdatedData = event.data.object as Stripe.Subscription;
  const subscriptionUpdatedPlanInfo = subscriptionUpdatedData.items.data[0];
  const subscriptionId = subscriptionUpdatedPlanInfo.subscription;
  const productId = subscriptionUpdatedPlanInfo.price.product as string;
  const priceId = subscriptionUpdatedPlanInfo.price.id;
  const customerId = subscriptionUpdatedData.customer as string;
  const subscriptionStatus = subscriptionUpdatedData.status;
  const previousSubscriptionAttributes = (event.data.previous_attributes ||
    {}) as Partial<Stripe.Subscription>;

  const stripeSubscriptionData = {
    subscriptionId,
    customerId,
    productId,
    priceId,
    subscriptionStatus,
    previousSubscriptionAttributes,
  };

  // case 1: upgrade/downgrade detect (items chagnge, but no status changes from trialing)
  if (previousSubscriptionAttributes.hasOwnProperty('items')) {
    await updateSubscriptionPlan(tenantsConnection, tenantId, stripeSubscriptionData);
  }

  // case 2: Free trial ended (status changes from trialing to something else)
  if (
    previousSubscriptionAttributes.hasOwnProperty('status') &&
    subscriptionUpdatedData.status != 'trialing'
  ) {
    await handleFreeTrialEnd(tenantsConnection, tenantId, stripeSubscriptionData);
  }
};

export const listenStripeWebhook = async (
  tenantId: string,
  tenantsConnection: Mongoose,
  event: Stripe.Event,
  payloadString: string,
) => {
  const secret = stripeConfig.stripeWebhookSecretKey;
  const header = getStripe().webhooks.generateTestHeaderString({
    payload: payloadString,
    secret,
  });
  const constructEvent = getStripe().webhooks.constructEvent(payloadString, header, secret);
  if (constructEvent.type === 'checkout.session.completed') {
    handleCheckoutSessionCompleted(tenantId, tenantsConnection, event);
  }
  if (constructEvent.type === 'customer.subscription.updated') {
    handleSubscriptionUpdated(tenantId, tenantsConnection, event);
  }
};

const stripeService = {
  createStripeCheckoutSession,
  createStripeCustomerPortal,
  getAllProductsInfo,
  getPriceInfoById,
  getSubscriptionHistory,
  getCurrentPlanId,
  isCurrentPlanFree,
  isCurrentPlanSubscribed,
  getCustomerId,
  listenStripeWebhook,
};

export { stripeService };
