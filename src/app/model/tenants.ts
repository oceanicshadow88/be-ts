import mongoose, { Types } from 'mongoose';
const Schema = mongoose.Schema;

export interface ITenantTrialHistory {
  productId: string;
  priceIds: string[];
}

export interface ITenant {
  origin: string;
  passwordSecret: string;
  plan: string;
  owner: any;
  active: boolean;
  email: string;
  tenantTrialHistory: ITenantTrialHistory[];
}

const tenantSchema = new Schema<ITenant>(
  {
    origin: {
      type: String,
      required: true,
      unique: true,
    },
    passwordSecret: {
      type: String,
      // required: true,
    },
    plan: {
      type: String,
      enum: ['Free', 'Advanced', 'Ultra', 'Enterprise'],
      default: 'Free',
      required: true,
    },
    owner: { type: Types.ObjectId, ref: 'users' },
    active: { type: Boolean, default: false },
    email: {
      type: String,
    },
    tenantTrialHistory: [
      {
        productId: {
          type: String,
        },
        priceIds: {
          type: [String],
        },
      },
    ],
  },
  { timestamps: true },
);

export function getModel(connection: any) {
  if (!connection) {
    throw new Error('No connection');
  }
  return connection.model('tenants', tenantSchema);
}
