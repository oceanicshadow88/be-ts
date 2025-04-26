import { Mongoose, Schema, Types } from 'mongoose';
import { IStripePrice } from './stripePrice';

export interface IStripePrices {
  monthly?: IStripePrice | null;
  yearly?: IStripePrice | null;
}

export interface IStripeProduct {
  stripeProductId: string;
  stripeProductName: string;
  stripeProductDescription: string;
  stripePrices: IStripePrices;
}

const stripeProductSchema = new Schema<IStripeProduct>({
  stripeProductId: {
    type: String,
    required: true,
  },
  stripeProductName: {
    type: String,
    required: true,
  },
  stripeProductDescription: {
    type: String,
    required: true,
  },
  stripePrices: {
    monthly: {
      ref: 'stripePrices',
      type: Types.ObjectId,
    },
    yearly: {
      ref: 'stripePrices',
      type: Types.ObjectId,
    },
  },
});

const getModel = (connection: Mongoose) => {
  if (!connection) {
    throw new Error('No connection');
  }
  return connection.model('stripeProducts', stripeProductSchema);
};

export { getModel };
