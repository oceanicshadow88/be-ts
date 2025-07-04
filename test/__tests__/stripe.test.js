import request from 'supertest';
import app from '../setup/app';
import db from '../setup/db';
import * as stripeLib from '../../src/app/lib/stripe';
import * as StripePrice from '../../src/app/model/stripePrice';
import * as StripeProduct from '../../src/app/model/stripeProduct';
import * as StripeSession from '../../src/app/model/stripeSession';
import * as StripeSubscription from '../../src/app/model/stripeSubscription';
import * as Tenant from '../../src/app/model/tenants';

import {
  StripePriceBuilder,
  StripeProductBuilder, 
  StripeSubscriptionBuilder
 } from './builders/stripeBuilder';

describe('Stripe API tests', () => {
  let stripePriceModel = null;
  let stripeProductModel = null;
  let stripeSessionModel = null;
  let stripeSubscriptionModel = null;
  let tenantModel = null;

  beforeAll(async () => {
    stripePriceModel = StripePrice.getModel(db.tenantsConnection);
    stripeProductModel = StripeProduct.getModel(db.tenantsConnection);
    stripeSessionModel = StripeSession.getModel(db.tenantsConnection);
    stripeSubscriptionModel = StripeSubscription.getModel(db.tenantsConnection);
    tenantModel = Tenant.getModel(db.tenantsConnection);
  });

  it('should handle Stripe checkout session webhook event', async () => {
    const customerId = 'cus_test_123';
    const subscriptionId = 'sub_test_123';

    const event = {
      id: 'evt_test_123',
      type: 'checkout.session.completed',
      data: {
        object: {
          id: 'cs_test_123',
          customer: customerId,
          payment_status: 'paid',
          subscription: subscriptionId,
          metadata: {
            tenantId: db.defaultTenant._id.toString(),
          }, 
        },
      },
    };

    const sessionId = event.data.object.id;
    const price = await new StripePriceBuilder().save();
    const product = await new StripeProductBuilder()
      .withStripePrices(price._id, price._id)
      .save();

    const originSubscription = await new StripeSubscriptionBuilder()
      .withTenant(db.defaultTenant._id)
      .save();
    
    jest.spyOn(stripeLib, 'getStripe').mockReturnValue({
      webhooks: {
        generateTestHeaderString: jest.fn().mockReturnValue('test-header'),
        constructEvent: jest.fn().mockImplementation((payload, header, secret) => {
          return JSON.parse(payload);
        }),
      },
      subscriptions: {
        retrieve: jest.fn().mockResolvedValue({
          id: subscriptionId,
          items: {
            data: [{
              price: {
                id: price.stripePriceId,
                product: product.stripeProductId,
              },
            }],
          },
          customer: customerId,
          status: 'active',
        }),
        cancel: jest.fn().mockResolvedValue({
          id: subscriptionId,
          status: 'canceled',
        }),
      }
    });

    const res = await request(app.application)
      .post('/api/v2/webhook')
      .send(event)

    expect(res.statusCode).toBe(200);
    
    // Check if the original subscription is canceled
    const canceledSubscription = await stripeSubscriptionModel.findOne({
      stripeSubscriptionId: originSubscription.stripeSubscriptionId
    });
    expect(canceledSubscription).not.toBeNull();
    expect(canceledSubscription.stripeSubscriptionStatus).toBe('canceled');

    // Check if the new session is created
    const newSession = await stripeSessionModel.findOne({
      stripeSessionId: sessionId, 
      tenant: db.defaultTenant._id,
    });
    expect(newSession).not.toBeNull();

    // Check if the tenant's trial history is updated
    const tenant = await tenantModel.findById(db.defaultTenant._id);
    expect(tenant.tenantTrialHistory).not.toBeNull();
    const lastTrialHistory = tenant.tenantTrialHistory.at(-1);
    expect(lastTrialHistory.productId).toBe(product.stripeProductId);
    lastTrialHistory.priceIds.map((priceId) => {
      expect(priceId).toBe(price.stripePriceId);
    });

    // Check if the new subscription is created
    const newSubscription = await stripeSubscriptionModel.findOne({
      tenant: db.defaultTenant._id,
      stripeProductId: product.stripeProductId,
      stripePriceId: price.stripePriceId,
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscriptionId,
      stripeSubscriptionStatus: 'active',
    });
    expect(newSubscription).not.toBeNull();
  });

  it('should create a checkout session', async () => {
    const stripePrice = await new StripePriceBuilder().save();
    const stripeSubscription = await new StripeSubscriptionBuilder()
      .withStripePriceId(stripePrice.stripePriceId)
      .save();

    const url = 'https://mocked.stripe.com/checkout/session/cs_test_123';
    jest.spyOn(stripeLib, 'getStripe').mockReturnValue({
      checkout: {
        sessions: {
          create: jest.fn().mockResolvedValue({
            id: 'cs_test_123',
            url: url,
          }),
        },
      },
    });

    const res = await request(app.application)
      .post('/api/v2/payment/createCheckoutSession')
      .set('Origin', 'http://test.com')
      .send({
        priceId: stripePrice.stripePriceId,
        customerId: stripeSubscription.stripeCustomerId,
      });

    expect(res.statusCode).toBe(200);
    expect(Object.keys(res.body).sort()).toEqual(['url', 'isPlanFree'].sort());
    expect(res.body).toHaveProperty('url');
    expect(res.body.url).toBe(url);
    expect(res.body).toHaveProperty('isPlanFree');
    expect(res.body.isPlanFree).toBe(stripePrice.subscriptionAmount === 0);

  });

  it('should create a customer portal session', async () => {
    const stripeSubscription = await new StripeSubscriptionBuilder().save();

    const url = 'https://mocked.stripe.com/billing-portal/session/ps_test_123';
    jest.spyOn(stripeLib, 'getStripe').mockReturnValue({
      billingPortal: {
        sessions: {
          create: jest.fn().mockResolvedValue({
            url: url,
          }),
        },
      }, 
    });

    const res = await request(app.application)
      .post('/api/v2/payment/createCustomerPortal')
      .set('Origin', db.defaultTenant.origin)
      .send({
        customerId: stripeSubscription.stripeCustomerId,
      });

    expect(res.statusCode).toBe(200);
    expect(res.body).toBe(url);
  });

  it('can check current plan is free', async () => {
    const stripePrice = await new StripePriceBuilder()
      .withSubscriptionAmount(0)
      .save();

    const stripeProduct = await new StripeProductBuilder()
      .withStripePrices(stripePrice._id, stripePrice._id)
      .withStripeProductName('Free')
      .save();
  
    await new StripeSubscriptionBuilder()
      .withStripePriceId(stripePrice.stripePriceId)
      .withStripeProductId(stripeProduct.stripeProductId)
      .withTenant(db.defaultTenant._id)
      .save();

    const res = await request(app.application)
      .get('/api/v2/payment/isCurrentPlanFree')

    expect(res.statusCode).toBe(200);
    expect(res.body).toBe(stripePrice.subscriptionAmount === 0);
  });

  it('can check if current plan is subscribed', async () => {
    const res = await request(app.application)
      .get('/api/v2/payment/isCurrentPlanSubscribed')
      .query({
        priceId: db.defaultTenant.tenantTrialHistory[0].priceIds[0],
      });

    expect(res.statusCode).toBe(200);
    expect(res.body).toBe(true);
  });

  it('can get current plan\'s id', async () => {
    const subscription = await new StripeSubscriptionBuilder()
      .withTenant(db.defaultTenant._id)
      .save();

    const res = await request(app.application)
      .get('/api/v2/payment/currentPlanId');

    expect(res.statusCode).toBe(200);
    expect(res.body).toBe(subscription.stripeProductId);
  });

  it('can get customer id', async () => {
    const subscription = await new StripeSubscriptionBuilder()
      .withTenant(db.defaultTenant._id)
      .save();

    const res = await request(app.application)
      .get('/api/v2/payment/customerId');
    expect(res.statusCode).toBe(200);
    expect(res.body).toBe(subscription.stripeCustomerId);
  });

  it('can get price infomation', async () => {
    const stripePrice = await new StripePriceBuilder().save();

    const res = await request(app.application)
      .get(`/api/v2/payment/priceInfo/${stripePrice._id}`)

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('stripePriceId', stripePrice.stripePriceId);
    expect(res.body.stripePriceId).toBe(stripePrice.stripePriceId);
    expect(res.body).toHaveProperty('subscriptionAmount', stripePrice.subscriptionAmount);
    expect(res.body.subscriptionAmount).toBe(stripePrice.subscriptionAmount);
    expect(res.body).toHaveProperty('subscriptionPeriod', stripePrice.subscriptionPeriod);
    expect(res.body.subscriptionPeriod).toBe(stripePrice.subscriptionPeriod);
  });

  it('can get subscription history', async () => {
    const productsInfo = db.defaultTenant.tenantTrialHistory.map(history => (history.productId));

    const stripeProducts = await Promise.all(productsInfo.map(productId =>
      new StripeProductBuilder()
        .withStripeProductId(productId)
        .save()
    ));

    const res = await request(app.application)
      .get('/api/v2/payment/subscriptionHistory');
    expect(res.statusCode).toBe(200);
    expect(res.body).toBeInstanceOf(Array);
    expect(res.body.length).toBe(stripeProducts.length);
    expect(res.body.sort()).toEqual(stripeProducts.map(product => (product.stripeProductName)).sort());
  });
});