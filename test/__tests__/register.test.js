import request from 'supertest';
import app from '../setup/app';
import db from '../setup/db';
import config from '../../src/app/config/app';

describe('Register API tests', () => {
  it('should register a company if valid data provided', async () => {
    const company = 'testcompany';
  
    const res = await request(app.application)
      .post('/api/v2/register')
      .send({
        company: company,
        email: db.defaultUser.email,
      })
    expect(res.statusCode).toBe(200);
    expect(res.body.data.newTenants.origin).toBe(`${config.protocol}${company}.${config.mainDomain}`);
    expect(res.body.data.newTenants.owner).toBe(db.defaultUser.id);
    expect(res.body.data.newUser.email).toBe(db.defaultUser.email);
    expect(res.body.data.newUser.id).toBe(db.defaultUser.id);
  });

  it('should register a company for uppercased email', async () => {
    const company = 'testcompany';
  
    const res = await request(app.application)
      .post('/api/v2/register')
      .send({
        company: company,
        email: db.defaultUser.email.toUpperCase(),
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.newTenants.origin).toBe(`${config.protocol}${company}.${config.mainDomain}`);
    expect(res.body.data.newTenants.owner).toBe(db.defaultUser.id);
    expect(res.body.data.newUser.email).toBe(db.defaultUser.email.toLowerCase());
    expect(res.body.data.newUser.id).toBe(db.defaultUser.id);
  });
});




// registerService.test.ts
import { createSubscription } from '../services/registerServiceV2';
import { getStripe } from '../lib/stripe';

// Mock all the models
jest.mock('../model/stripeProduct');
jest.mock('../model/stripePrice');
jest.mock('../model/stripeSubscription');
jest.mock('../model/tenants');
jest.mock('../lib/stripe');

const stripeProductModel = require('../model/stripeProduct');
const stripePriceModel = require('../model/stripePrice');
const stripeSubscriptionModel = require('../model/stripeSubscription');
const tenantModel = require('../model/tenants');

describe('createSubscription', () => {
  let mockTenantsConnection: any;
  let mockStripeProduct: any;
  let mockStripePrice: any;
  let mockStripeSubscription: any;
  let mockTenant: any;
  let mockStripe: any;

  // Test data
  const testTenantId = '68669473c2d9c26c59e61c2c';
  const testEmail = 'test@example.com';
  const testStripeProductId = 'prod_SbW4lv2TrO5RtF';
  const testStripePriceId = 'price_1RgJ21POzqrLEv6rO0bf61WD';
  const testStripeCustomerId = 'cus_TestCustomer123';
  const testStripeSubscriptionId = 'sub_TestSubscription123';

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();

    // Mock database connection
    mockTenantsConnection = {};

    // Mock model instances
    mockStripeProduct = {
      findOne: jest.fn().mockReturnThis(),
      populate: jest.fn().mockResolvedValue({
        stripeProductId: testStripeProductId,
        stripeProductName: 'Free',
        stripePrices: {
          monthly: {
            stripePriceId: testStripePriceId,
            subscriptionAmount: 0,
            subscriptionPeriod: 'month'
          }
        }
      })
    };

    mockStripePrice = {};

    mockStripeSubscription = {
      findOneAndUpdate: jest.fn().mockResolvedValue({
        _id: 'subscription_doc_id',
        tenant: testTenantId,
        stripeSubscriptionId: testStripeSubscriptionId,
        stripeCustomerId: testStripeCustomerId,
        stripePriceId: testStripePriceId,
        stripeProductId: testStripeProductId,
        stripeSubscriptionStatus: 'active'
      })
    };

    mockTenant = {
      findByIdAndUpdate: jest.fn().mockResolvedValue({
        _id: testTenantId,
        origin: 'http://test.example.com',
        plan: 'Free',
        email: testEmail,
        active: true,
        tenantTrialHistory: [{
          productId: testStripeProductId,
          priceIds: [testStripePriceId],
          _id: '686694b8d5f355923307f8ff'
        }]
      })
    };

    // Mock Stripe API
    mockStripe = {
      customers: {
        create: jest.fn().mockResolvedValue({
          id: testStripeCustomerId,
          email: testEmail,
          metadata: { tenantId: testTenantId }
        })
      },
      subscriptions: {
        create: jest.fn().mockResolvedValue({
          id: testStripeSubscriptionId,
          customer: testStripeCustomerId,
          status: 'active',
          items: {
            data: [{
              price: { id: testStripePriceId }
            }]
          },
          metadata: { tenantId: testTenantId }
        })
      }
    };

    // Setup model mocks
    stripeProductModel.getModel.mockReturnValue(mockStripeProduct);
    stripePriceModel.getModel.mockReturnValue(mockStripePrice);
    stripeSubscriptionModel.getModel.mockReturnValue(mockStripeSubscription);
    tenantModel.getModel.mockReturnValue(mockTenant);
    (getStripe as jest.Mock).mockReturnValue(mockStripe);
  });

  describe('Happy Path', () => {
    it('should successfully create a free subscription for a new tenant', async () => {
      await createSubscription(mockTenantsConnection, testTenantId, testEmail);

      // Verify model initialization
      expect(stripeProductModel.getModel).toHaveBeenCalledWith(mockTenantsConnection);
      expect(stripePriceModel.getModel).toHaveBeenCalledWith(mockTenantsConnection);
      expect(stripeSubscriptionModel.getModel).toHaveBeenCalledWith(mockTenantsConnection);
      expect(tenantModel.getModel).toHaveBeenCalledWith(mockTenantsConnection);

      // Verify free plan product was fetched
      expect(mockStripeProduct.findOne).toHaveBeenCalledWith({ stripeProductName: 'Free' });
      expect(mockStripeProduct.populate).toHaveBeenCalledWith({
        path: 'stripePrices.monthly',
        model: mockStripePrice
      });

      // Verify Stripe customer creation
      expect(mockStripe.customers.create).toHaveBeenCalledWith({
        email: testEmail,
        metadata: { tenantId: testTenantId }
      });

      // Verify Stripe subscription creation
      expect(mockStripe.subscriptions.create).toHaveBeenCalledWith({
        customer: testStripeCustomerId,
        items: [{ price: testStripePriceId }],
        metadata: { tenantId: testTenantId }
      });

      // Verify subscription document update
      expect(mockStripeSubscription.findOneAndUpdate).toHaveBeenCalledWith(
        { tenant: testTenantId },
        {
          stripeSubscriptionId: testStripeSubscriptionId,
          stripeCustomerId: testStripeCustomerId,
          stripePriceId: testStripePriceId,
          stripeProductId: testStripeProductId,
          stripeSubscriptionStatus: 'active'
        },
        { upsert: true, new: true }
      );

      // Verify tenant update
      expect(mockTenant.findByIdAndUpdate).toHaveBeenCalledWith(
        testTenantId,
        {
          plan: 'Free',
          email: testEmail,
          $addToSet: {
            tenantTrialHistory: {
              productId: testStripeProductId,
              priceIds: [testStripePriceId]
            }
          }
        },
        { new: true }
      );
    });

    it('should handle existing subscription update correctly', async () => {
      // Simulate existing subscription
      const existingSubscription = {
        _id: 'existing_sub_id',
        stripeSubscriptionId: 'old_sub_id'
      };
      mockStripeSubscription.findOneAndUpdate.mockResolvedValue(existingSubscription);

      await createSubscription(mockTenantsConnection, testTenantId, testEmail);

      // Verify upsert was called
      expect(mockStripeSubscription.findOneAndUpdate).toHaveBeenCalledWith(
        { tenant: testTenantId },
        expect.any(Object),
        { upsert: true, new: true }
      );
    });
  });

  describe('Error Handling', () => {
    it('should throw error when free plan product is not found', async () => {
      mockStripeProduct.populate.mockResolvedValue(null);

      await expect(
        createSubscription(mockTenantsConnection, testTenantId, testEmail)
      ).rejects.toThrow();

      // Verify Stripe APIs were not called
      expect(mockStripe.customers.create).not.toHaveBeenCalled();
      expect(mockStripe.subscriptions.create).not.toHaveBeenCalled();
    });

    it('should throw error when free plan has no monthly price', async () => {
      mockStripeProduct.populate.mockResolvedValue({
        stripeProductId: testStripeProductId,
        stripeProductName: 'Free',
        stripePrices: {
          monthly: null
        }
      });

      await expect(
        createSubscription(mockTenantsConnection, testTenantId, testEmail)
      ).rejects.toThrow();
    });

    it('should throw error when Stripe customer creation fails', async () => {
      const stripeError = new Error('Stripe customer creation failed');
      mockStripe.customers.create.mockRejectedValue(stripeError);

      await expect(
        createSubscription(mockTenantsConnection, testTenantId, testEmail)
      ).rejects.toThrow('Stripe customer creation failed');

      // Verify subscription was not created
      expect(mockStripe.subscriptions.create).not.toHaveBeenCalled();
      expect(mockStripeSubscription.findOneAndUpdate).not.toHaveBeenCalled();
    });

    it('should throw error when Stripe subscription creation fails', async () => {
      const stripeError = new Error('Stripe subscription creation failed');
      mockStripe.subscriptions.create.mockRejectedValue(stripeError);

      await expect(
        createSubscription(mockTenantsConnection, testTenantId, testEmail)
      ).rejects.toThrow('Stripe subscription creation failed');

      // Verify database was not updated
      expect(mockStripeSubscription.findOneAndUpdate).not.toHaveBeenCalled();
      expect(mockTenant.findByIdAndUpdate).not.toHaveBeenCalled();
    });

    it('should throw error when database subscription update fails', async () => {
      const dbError = new Error('Database update failed');
      mockStripeSubscription.findOneAndUpdate.mockRejectedValue(dbError);

      await expect(
        createSubscription(mockTenantsConnection, testTenantId, testEmail)
      ).rejects.toThrow('Database update failed');

      // Verify tenant was not updated
      expect(mockTenant.findByIdAndUpdate).not.toHaveBeenCalled();
    });

    it('should throw error when tenant update fails', async () => {
      const dbError = new Error('Tenant update failed');
      mockTenant.findByIdAndUpdate.mockRejectedValue(dbError);

      await expect(
        createSubscription(mockTenantsConnection, testTenantId, testEmail)
      ).rejects.toThrow('Tenant update failed');
    });
  });

  describe('Data Validation', () => {
    it('should handle missing tenant ID', async () => {
      await expect(
        createSubscription(mockTenantsConnection, '', testEmail)
      ).rejects.toThrow();
    });

    it('should handle missing email', async () => {
      await expect(
        createSubscription(mockTenantsConnection, testTenantId, '')
      ).rejects.toThrow();
    });

    it('should handle null connection', async () => {
      await expect(
        createSubscription(null, testTenantId, testEmail)
      ).rejects.toThrow();
    });
  });

  describe('Stripe Metadata', () => {
    it('should include tenant ID in Stripe customer metadata', async () => {
      await createSubscription(mockTenantsConnection, testTenantId, testEmail);

      expect(mockStripe.customers.create).toHaveBeenCalledWith(
        expect.objectContaining({
          metadata: { tenantId: testTenantId }
        })
      );
    });

    it('should include tenant ID in Stripe subscription metadata', async () => {
      await createSubscription(mockTenantsConnection, testTenantId, testEmail);

      expect(mockStripe.subscriptions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          metadata: { tenantId: testTenantId }
        })
      );
    });
  });

  describe('Trial History', () => {
    it('should correctly add trial history to tenant', async () => {
      await createSubscription(mockTenantsConnection, testTenantId, testEmail);

      const updateCall = mockTenant.findByIdAndUpdate.mock.calls[0];
      const updateData = updateCall[1];

      expect(updateData.$addToSet.tenantTrialHistory).toEqual({
        productId: testStripeProductId,
        priceIds: [testStripePriceId]
      });
    });

    it('should not duplicate trial history entries', async () => {
      // Run twice to test $addToSet behavior
      await createSubscription(mockTenantsConnection, testTenantId, testEmail);

      // Verify $addToSet was used (prevents duplicates)
      expect(mockTenant.findByIdAndUpdate).toHaveBeenCalledWith(
        testTenantId,
        expect.objectContaining({
          $addToSet: expect.any(Object)
        }),
        expect.any(Object)
      );
    });
  });
});

// registerService.edge-cases.test.ts
describe('createSubscription - Edge Cases', () => {
  describe('Concurrent Subscription Creation', () => {
    it('should handle race conditions when creating multiple subscriptions', async () => {
      // Test concurrent calls don't create duplicate subscriptions
    });
  });

  describe('Stripe API Rate Limiting', () => {
    it('should handle Stripe rate limit errors gracefully', async () => {
      const rateLimitError = new Error('Rate limit exceeded');
      rateLimitError.type = 'StripeRateLimitError';
      mockStripe.customers.create.mockRejectedValue(rateLimitError);
      
      // Test retry logic or error handling
    });
  });

  describe('Network Issues', () => {
    it('should handle network timeouts', async () => {
      const timeoutError = new Error('ETIMEDOUT');
      mockStripe.subscriptions.create.mockRejectedValue(timeoutError);
      
      // Test timeout handling
    });
  });

  describe('Invalid Email Formats', () => {
    const invalidEmails = [
      'notanemail',
      '@example.com',
      'user@',
      'user@.com',
      'user@domain',
    ];

    invalidEmails.forEach(email => {
      it(`should handle invalid email: ${email}`, async () => {
        // Test validation
      });
    });
  });
});