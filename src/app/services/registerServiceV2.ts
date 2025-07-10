import { emailSender, getDomain } from '../utils/emailSender';
import jwt from 'jsonwebtoken';
import { winstonLogger } from '../../loaders/logger';
import mongoose from 'mongoose';
import * as User from '../model/user';
import config from '../config/app';
import { getStripe } from '../lib/stripe';

const stripeProductModel = require('../model/stripeProduct');
const stripePriceModel = require('../model/stripePrice');
const stripeSubscriptionModel = require('../model/stripeSubscription');
const tenantModel = require('../model/tenants');

export const createSubscription = async (
  tenantsConnection: any,
  activeTenant: string,
  email: string
) => {
  const stripePrice = stripePriceModel.getModel(tenantsConnection);
  const stripeProduct = stripeProductModel.getModel(tenantsConnection);
  const stripeSubscription = stripeSubscriptionModel.getModel(tenantsConnection);

  const freePlanProduct = await stripeProduct
    .findOne({stripeProductName: 'Free'})
    .populate({
      path: 'stripePrices.monthly',
      model: stripePrice
    });

  if (!freePlanProduct) {
    throw new Error('Free plan is not found');
  }

  if (!freePlanProduct.stripePrices?.monthly) {
    throw new Error('Free plan monthly price is not found');
  }

  const stripeCustomer = await getStripe().customers.create({
    email: email,
    metadata: {
      tenantId: activeTenant,
    }
  });
  
  const subscription = await getStripe().subscriptions.create({
    customer: stripeCustomer.id,
    items: [{
      price: freePlanProduct.stripePrices.monthly.stripePriceId,
    }],
    metadata: {tenantId: activeTenant}
  });

  await stripeSubscription.findOneAndUpdate(
    { tenant: activeTenant },
    {
      stripeSubscriptionId: subscription.id,
      stripeCustomerId: stripeCustomer.id,
      stripePriceId: freePlanProduct.stripePrices.monthly.stripePriceId,
      stripeProductId: freePlanProduct.stripeProductId,
      stripeSubscriptionStatus: subscription.status,
    },
    { upsert: true, new: true }
  );

  const tenant = tenantModel.getModel(tenantsConnection);
  await tenant.findByIdAndUpdate(
    activeTenant, {
      plan: 'Free',
      email: email,
      $addToSet: {
        tenantTrialHistory: {
          productId: freePlanProduct.stripeProductId,
          priceIds: [freePlanProduct.stripePrices.monthly.stripePriceId],
        }
      }
    },
    { new: true }
  );
}

export const emailRegister = async (
  resUserDbConnection: any,
  email: string,
  newTenants: any,
  origin: string | null,
) => {
  if (!config?.emailSecret) {
    winstonLogger.error('Missing email secret in env');
    throw new Error('Missing email secret in env');
  }
  const userModel = User.getModel(resUserDbConnection);
  const targetUser = await userModel.findOne({ email });
  const tenantsId = new mongoose.Types.ObjectId(newTenants.id);
  let newUser;
  let validationToken;
  if (targetUser?.active) {
    targetUser.tenants.push(tenantsId);
    newUser = await targetUser.save();
  } else if (!targetUser) {
    newUser = await userModel.create({
      email,
      active: false,
      refreshToken: '',
      tenants: [tenantsId],
    });
  } else {
    newUser = targetUser;
  }

  try {
    //TODO: fix
    if (!newUser) {
      throw new Error('RegisterService Cannot find user');
    }
    validationToken = jwt.sign({ id: newUser.id }, config.emailSecret);
    emailSender(email, `token=${validationToken}`, getDomain(newTenants.origin, origin || ''));
  } catch (e) {
    winstonLogger.error('registerServiceV2 Fail:' + e);
    if (newUser.tenants.length === 0) {
      userModel.deleteOne({ email });
    } else {
      newUser.tenants.pop();
      await newUser.save();
    }
    throw new Error('Email sent failed');
  }

  return { newUser, validationToken };
};
