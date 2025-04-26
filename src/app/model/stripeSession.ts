import { Mongoose, Schema, Types } from 'mongoose';
import { ITenant } from './tenants';

export interface IStripeSession {
  stripeSessionId: string;
  tenant: ITenant,
}

const stripeSessionSchema = new Schema<IStripeSession>({
  stripeSessionId: {
    type: String,
    required: true,
  },
  tenant: {
    ref: 'tenants',
    type: Types.ObjectId,
    required: true,
  },
},
{ timestamps: true },
);

const getModel = (connection: Mongoose) => {
  if (!connection) {
    throw new Error('No connection');
  }
  return connection.model('stripeSessions', stripeSessionSchema);
};

export { getModel };
