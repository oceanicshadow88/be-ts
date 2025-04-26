import mongoose, { Mongoose } from 'mongoose';

export interface IPermission {
  slug: string;
  description: string;
}

const permissionSchema = new mongoose.Schema<IPermission>(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);

const getModel = (connection: Mongoose) => {
  if (!connection) {
    throw new Error('No connection');
  }
  return connection.model('permissions', permissionSchema);
};

export { getModel };
