import { Mongoose, Schema } from 'mongoose';

export interface IStripePrice {
  stripePriceId: string;
  subscriptionAmount: number;
  subscriptionPeriod: string;
}

const stripePriceSchema = new Schema<IStripePrice>({
  stripePriceId: {
    type: String,
    required: true,
  },

  subscriptionAmount: {
    type: Number,
    required: true,
  },

  subscriptionPeriod: {
    type: String,
    required: true,
  },
});

const getModel = (connection: Mongoose) => {
  if (!connection) {
    throw new Error('No connection');
  }
  return connection.model('stripePrices', stripePriceSchema);
};

export { getModel };
