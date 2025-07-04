import request from 'supertest';
import app from '../setup/app';
import db from '../setup/db';
import * as stripeLib from '../../src/app/lib/stripe';

import {
  StripePriceBuilder,
  StripeProductBuilder, 
  StripeSessionBuilder,
  StripeSubscriptionBuilder
 } from './builders/stripeBuilder';
import e from 'express';



describe('Stripe API tests', () => {
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