import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../setup/app';
import db from '../setup/db';
import UserBuilder from './builders/userBuilder';
import TenantBuilder from './builders/tenantBuilder';
import { StripePriceBuilder, StripeProductBuilder } from './builders/stripeBuilder';
import * as stripeLib from '../../src/app/lib/stripe';
import config from '../../src/app/config/app';
import { getModel as getStripeSubscriptionModel } from '../../src/app/model/stripeSubscription';

describe('Register Activation - store (Account Activation)', () => {
  beforeEach(async () => {
    jest.spyOn(stripeLib, 'getStripe').mockReturnValue({
      customers: {
        create: jest.fn().mockResolvedValue({ id: 'cus_test_123' })
      },
      subscriptions: {
        create: jest.fn().mockResolvedValue({ 
          id: 'sub_test_123', 
          status: 'active' 
        })
      }
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should successfully activate user account with valid data', async () => {
    const stripePrice = await new StripePriceBuilder()
      .withStripePriceId('price_free_123')
      .withSubscriptionAmount(0)
      .withSubscriptionPeriod('month')
      .save();

    const stripeProduct = await new StripeProductBuilder()
      .withStripeProductName('Free')
      .withStripeProductId('prod_free_123')
      .withStripePrices(stripePrice._id, stripePrice._id)
      .save();

    const testUser = await new UserBuilder()
      .withEmail('test@example.com')
      .withName('Test User')
      .withActive(false)
      .save();

    const testTenant = await new TenantBuilder()
      .withOrigin('http://test-success.example.com')
      .withActive(false)
      .withOwner(testUser._id)
      .withTenantTrialHistory([])
      .save();

    testUser.tenants = [testTenant._id];
    await testUser.save();

    const token = jwt.sign({ id: testUser._id }, config.emailSecret);

    const requestBody = {
      email: 'test@example.com',
      name: 'Test User',
      password: 'newPassword123'
    };

    const response = await request(app.application)
      .put(`/api/v2/register/${token}`)
      .send(requestBody)
      .expect(200);

    expect(response.body).toHaveProperty('user');
    expect(response.body.user).toHaveProperty('email', 'test@example.com');
    expect(response.body.user).toHaveProperty('name', 'Test User');
    
    const updatedUser = await db.tenantsConnection.model('users').findById(testUser._id);
    expect(updatedUser.active).toBe(true);

    const stripe = stripeLib.getStripe();
    expect(stripe.customers.create).toHaveBeenCalledTimes(1);
    const customerCall = stripe.customers.create.mock.calls[0][0];
    expect(customerCall.email).toBe('test@example.com');
    expect(String(customerCall.metadata.tenantId)).toBe(String(testTenant._id));

    expect(stripe.subscriptions.create).toHaveBeenCalledTimes(1);
    const subscriptionCall = stripe.subscriptions.create.mock.calls[0][0];
    expect(subscriptionCall.customer).toBe('cus_test_123');
    expect(subscriptionCall.items[0].price).toBe(stripePrice.stripePriceId);
    expect(String(subscriptionCall.metadata.tenantId)).toBe(String(testTenant._id));

    const savedSubscription = await getStripeSubscriptionModel(db.tenantsConnection).findOne({
      tenant: testTenant._id
    });
    expect(savedSubscription).not.toBeNull();
    expect(savedSubscription.stripeSubscriptionId).toBe('sub_test_123');
    expect(savedSubscription.stripeCustomerId).toBe('cus_test_123');
    expect(savedSubscription.stripePriceId).toBe(stripePrice.stripePriceId);
    expect(savedSubscription.stripeProductId).toBe(stripeProduct.stripeProductId);
    expect(savedSubscription.stripeSubscriptionStatus).toBe('active');

    const updatedTenant = await db.tenantsConnection.model('tenants').findById(testTenant._id);
    expect(updatedTenant.active).toBe(true);
    
    expect(updatedTenant.plan).toBe('Free');
    
    expect(updatedTenant.email).toBe('test@example.com');
    
    expect(updatedTenant.tenantTrialHistory).toBeDefined();
    expect(updatedTenant.tenantTrialHistory).toHaveLength(1);
    expect(updatedTenant.tenantTrialHistory[0].productId).toBe(stripeProduct.stripeProductId);
    expect(updatedTenant.tenantTrialHistory[0].priceIds).toContain(stripePrice.stripePriceId);
  });

  it('should handle upsert when subscription already exists', async () => {
    const stripePrice = await new StripePriceBuilder()
      .withStripePriceId('price_free_123')
      .withSubscriptionAmount(0)
      .withSubscriptionPeriod('month')
      .save();

    const stripeProduct = await new StripeProductBuilder()
      .withStripeProductName('Free')
      .withStripeProductId('prod_free_123')
      .withStripePrices(stripePrice._id, stripePrice._id)
      .save();

    const testUser = await new UserBuilder()
      .withEmail('test-upsert@example.com')
      .withName('Test User')
      .withActive(false)
      .save();

    const testTenant = await new TenantBuilder()
      .withOrigin('http://test-upsert.example.com')
      .withActive(false)
      .withOwner(testUser._id)
      .save();

    testUser.tenants = [testTenant._id];
    await testUser.save();

    // Create existing subscription record
    await getStripeSubscriptionModel(db.tenantsConnection).create({
      tenant: testTenant._id,
      stripeSubscriptionId: 'old_sub_123',
      stripeCustomerId: 'old_cus_123',
      stripePriceId: 'old_price_123',
      stripeProductId: 'old_prod_123',
      stripeSubscriptionStatus: 'canceled',
    });

    const token = jwt.sign({ id: testUser._id }, config.emailSecret);

    await request(app.application)
      .put(`/api/v2/register/${token}`)
      .send({
        email: 'test-upsert@example.com',
        name: 'Test User',
        password: 'newPassword123'
      })
      .expect(200);

    const subscriptionCount = await getStripeSubscriptionModel(db.tenantsConnection).countDocuments({
      tenant: testTenant._id
    });
    expect(subscriptionCount).toBe(1);

    const updatedSubscription = await getStripeSubscriptionModel(db.tenantsConnection).findOne({
      tenant: testTenant._id
    });
    expect(updatedSubscription.stripeSubscriptionId).toBe('sub_test_123');
    expect(updatedSubscription.stripeCustomerId).toBe('cus_test_123');
    expect(updatedSubscription.stripeSubscriptionStatus).toBe('active');
  });

  it('should handle missing free plan product', async () => {
    const testUser = await new UserBuilder()
      .withEmail('test-no-product@example.com')
      .withName('Test User')
      .withActive(false)
      .save();

    const testTenant = await new TenantBuilder()
      .withOrigin('http://test-no-product.example.com')
      .withActive(false)
      .withOwner(testUser._id)
      .save();

    testUser.tenants = [testTenant._id];
    await testUser.save();

    const token = jwt.sign({ id: testUser._id }, config.emailSecret);

    const response = await request(app.application)
      .put(`/api/v2/register/${token}`)
      .send({
        email: 'test-no-product@example.com',
        name: 'Test User',
        password: 'newPassword123'
      })
      .expect(200);

    const stripe = stripeLib.getStripe();
    expect(stripe.customers.create).not.toHaveBeenCalled();
    expect(stripe.subscriptions.create).not.toHaveBeenCalled();

    const subscription = await getStripeSubscriptionModel(db.tenantsConnection).findOne({
      tenant: testTenant._id
    });
    expect(subscription).toBeNull();

    const updatedUser = await db.tenantsConnection.model('users').findById(testUser._id);
    expect(updatedUser.active).toBe(true);

    const updatedTenant = await db.tenantsConnection.model('tenants').findById(testTenant._id);
    expect(updatedTenant.active).toBe(true);
  });

  it('should return 422 when validation fails', async () => {
    const testUser = await new UserBuilder()
      .withEmail('test@example.com')
      .withName('Test User')
      .withActive(false)
      .save();

    const token = jwt.sign({ id: testUser._id }, config.emailSecret);

    const requestBody = {};

    const response = await request(app.application)
      .put(`/api/v2/register/${token}`)
      .send(requestBody)
      .expect(422);

    expect(response.body).toEqual({});
  });

  it('should return 500 when user save fails', async () => {
    const testUser = await new UserBuilder()
      .withEmail('test@example.com')
      .withName('Test User')
      .withActive(false)
      .save();

    const token = jwt.sign({ id: testUser._id }, config.emailSecret);

    const requestBody = {
      email: 'different@example.com',
      name: 'Test User',
      password: 'newPassword123'
    };

    const response = await request(app.application)
      .put(`/api/v2/register/${token}`)
      .send(requestBody)
      .expect(500);

    expect(response.body).toHaveProperty('status', 'fail');
    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toContain('register err:');
  });

  it('should handle subscription creation failure gracefully', async () => {
    const stripePrice = await new StripePriceBuilder()
      .withStripePriceId('price_free_123')
      .withSubscriptionAmount(0)
      .withSubscriptionPeriod('month')
      .save();

    const stripeProduct = await new StripeProductBuilder()
      .withStripeProductName('Free')
      .withStripeProductId('prod_free_123')
      .withStripePrices(stripePrice._id, stripePrice._id)
      .save();

    const stripe = stripeLib.getStripe();
    stripe.customers.create.mockRejectedValue(new Error('Stripe API error'));

    const testUser = await new UserBuilder()
      .withEmail('test-failure@example.com')
      .withName('Test User')
      .withActive(false)
      .save();

    const testTenant = await new TenantBuilder()
      .withOrigin('http://test-failure.example.com')
      .withActive(false)
      .withOwner(testUser._id)
      .save();

    testUser.tenants = [testTenant._id];
    await testUser.save();

    const token = jwt.sign({ id: testUser._id }, config.emailSecret);

    const requestBody = {
      email: 'test-failure@example.com',
      name: 'Test User',
      password: 'newPassword123'
    };

    const response = await request(app.application)
      .put(`/api/v2/register/${token}`)
      .send(requestBody)
      .expect(200);

    expect(response.body).toHaveProperty('user');
    
    const updatedUser = await db.tenantsConnection.model('users').findById(testUser._id);
    expect(updatedUser.active).toBe(true);

    const updatedTenant = await db.tenantsConnection.model('tenants').findById(testTenant._id);
    expect(updatedTenant.active).toBe(true);

    const subscription = await getStripeSubscriptionModel(db.tenantsConnection).findOne({
      tenant: testTenant._id
    });
    expect(subscription).toBeNull();
  });
});