import * as StripePrice from '../../../src/app/model/stripePrice';
import * as StripeProduct from '../../../src/app/model/stripeProduct';
import * as StripeSession from '../../../src/app/model/stripeSession';
import * as StripeSubscription from '../../../src/app/model/stripeSubscription';

import db from '../../setup/db';
import BaseBuilder from './baseBuilder';

class StripePriceBuilder extends BaseBuilder {
  constructor(defaultValues = true) {
    super(defaultValues, false);
  }

  withStripePriceId(stripePriceId) {
    this.properties.stripePriceId = stripePriceId;
    return this;
  }

  withSubscriptionAmount(subscriptionAmount) {
    this.properties.subscriptionAmount = subscriptionAmount;
    return this;
  }

  withSubscriptionPeriod(subscriptionPeriod) {
    this.properties.subscriptionPeriod = subscriptionPeriod;
    return this;
  }

  build() {
    return {
      stripePriceId: this.properties.stripePriceId,
      subscriptionAmount: this.properties.subscriptionAmount,
      subscriptionPeriod: this.properties.subscriptionPeriod,
    };
  }

  buildDefault() {
    return {
      stripePriceId: 'price_1234567890',
      subscriptionAmount: 29,
      subscriptionPeriod: 'month',
    };
  }

  save() {
    return super.save(StripePrice.getModel(db.tenantsConnection));
  }
}

class StripeProductBuilder extends BaseBuilder {
  constructor(defaultValues = true) {
    super(defaultValues, false);
  }

  withStripeProductId(stripeProductId) {
    this.properties.stripeProductId = stripeProductId;
    return this;
  }

  withStripeProductName(stripeProductName) {
    this.properties.stripeProductName = stripeProductName;
    return this;
  }

  withStripeProductDescription(stripeProductDescription) {
    this.properties.stripeProductDescription = stripeProductDescription;
    return this;
  }

  withStripePrices(stripeMonthlyPricesId, stripeYearlyPricesId) {
    this.properties.stripePrices = {
      monthly: stripeMonthlyPricesId,
      yearly: stripeYearlyPricesId,
    };
    return this;
  }

  build() {
    return {
      stripeProductId: this.properties.stripeProductId,
      stripeProductName: this.properties.stripeProductName,
      stripeProductDescription: this.properties.stripeProductDescription,
      stripePrices: this.properties.stripePrices,
    };
  }

  buildDefault() {
    return {
      stripeProductId: 'prod_1234567890',
      stripeProductName: 'Test Product',
      stripeProductDescription: 'This is a test product',
      stripePrices: {
        monthly: new StripePriceBuilder().buildDefault()._id,
        yearly: new StripePriceBuilder().buildDefault()._id,
      },
    };
  }

  save() {
    return super.save(StripeProduct.getModel(db.tenantsConnection));
  }
}

class StripeSessionBuilder extends BaseBuilder {
  constructor(defaultValues = true) {
    super(defaultValues, false);
  }

  withStripeSessionId(stripeSessionId) {
    this.properties.stripeSessionId = stripeSessionId;
    return this;
  }

  withTenant(tenantId) {
    this.properties.tenant = tenantId;
    return this;
  }

  build() {
    return {
      stripeSessionId: this.properties.stripeSessionId,
      tenant: this.properties.tenant,
    };
  }

  buildDefault() {
    return {
      stripeSessionId: 'sess_1234567890',
      tenant: db.defaultTenant._id,
    };
  }

  save() {
    return super.save(StripeSession.getModel(db.tenantsConnection));
  }
}

class StripeSubscriptionBuilder extends BaseBuilder {
  constructor(defaultValues = true) {
    super(defaultValues, false);
  }

  withStripeSubscriptionId(stripeSubscriptionId) {
    this.properties.stripeSubscriptionId = stripeSubscriptionId;
    return this;
  }

  withTenant(tenantId) {
    this.properties.tenant = tenantId;
    return this;
  }

  withStripeCustomerId(stripeCustomerId) {
    this.properties.stripeCustomerId = stripeCustomerId;
    return this;
  }

  withStripePriceId(stripePriceId) {
    this.properties.stripePriceId = stripePriceId;
    return this;
  }

  withStripeProductId(stripeProductId) {
    this.properties.stripeProductId = stripeProductId;
    return this;
  }

  withStripeSubscriptionStatus(stripeSubscriptionStatus) {
    this.properties.stripeSubscriptionStatus = stripeSubscriptionStatus;
    return this;
  }

  build() {
    return {
      stripeSubscriptionId: this.properties.stripeSubscriptionId,
      tenant: this.properties.tenant,
      stripeCustomerId: this.properties.stripeCustomerId,
      stripePriceId: this.properties.stripePriceId,
      stripeProductId: this.properties.stripeProductId,
      stripeSubscriptionStatus: this.properties.stripeSubscriptionStatus,
    };
  }

  buildDefault() {
    return {
      stripeSubscriptionId: 'sub_1234567890',
      tenant: db.defaultTenant._id,
      stripeCustomerId: 'cus_1234567890',
      stripePriceId: 'default_price_1234567890',
      stripeProductId: 'default_product_1234567890',
      stripeSubscriptionStatus: 'active',
    };
  }

  save() {
    return super.save(StripeSubscription.getModel(db.tenantsConnection));
  }
}

export {
  StripePriceBuilder,
  StripeProductBuilder,
  StripeSessionBuilder,
  StripeSubscriptionBuilder,
};