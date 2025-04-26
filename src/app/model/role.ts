import mongoose, { Mongoose, Types, Document } from 'mongoose';

export interface IRole extends Document {
  name: string;
  slug: string;
  permissions: Types.ObjectId[] | IRolePermission[];
  isPublic: boolean;
  tenant: string;
}

export interface IRolePermission extends Document {
  slug: string;
}

const roleSchema = new mongoose.Schema<IRole>(
  {
    name: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: true,
    },
    permissions: [
      {
        type: Types.ObjectId,
        ref: 'permissions',
      },
    ],
    isPublic: { type: Boolean, require: true, default: false }, //if public cannot be deleted or update
    tenant: { type: String },
  },
  {
    timestamps: true,
    toJSON: {
      versionKey: false,
    },
  },
);

const getModel = (connection: Mongoose) => {
  if (!connection) {
    throw new Error('No connection');
  }
  return connection.model('roles', roleSchema);
};

export { getModel };
