import { Connection, Mongoose, Schema, Types } from 'mongoose';
import { ITenant } from './tenants';

export interface IStripeSubscription {
  stripeSubscriptionId: string;
  tenant: ITenant,
  stripeCustomerId: string;
  stripePriceId: string;
  stripeProductId: string;
  stripeSubscriptionStatus: string;
}

const stripeSubscriptionSchema = new Schema<IStripeSubscription>({
  stripeSubscriptionId: {
    type: String,
    required: true,
  },
  tenant: {
    ref: 'tenants',
    type: Types.ObjectId,
    required: true,
  },

  stripeCustomerId: {
    type: String,
    required: true,
  },

  stripePriceId: {
    type: String,
    required: true,
  },

  stripeProductId: {
    type: String,
    required: true,
  },

  stripeSubscriptionStatus: {
    type: String,
    required: true, 
  },
},
{ timestamps: true },
);

const getModel = (connection: Mongoose | Connection) => {
  if (!connection) {
    throw new Error('No connection');
  }
  return connection.model('stripeSubscriptions', stripeSubscriptionSchema);
};

export { getModel };
