import mongoose, { Mongoose, Types, Schema } from 'mongoose';

export interface IBoard {
  title: string;
  project: string;
  tenant: Schema.Types.ObjectId;
  statuses: Types.ObjectId[];
  isPublic: boolean;
}

const boardSchema = new mongoose.Schema<IBoard>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    tenant: {
      type: Schema.Types.ObjectId,
      ref: 'tenants',
      require: true,
    },
    statuses: [
      {
        type: Schema.Types.ObjectId,
        ref: 'statuses',
      },
    ],
    isPublic: { type: Boolean, require: true, default: false }, //if public cannot be deleted or update by company
  },
  {
    timestamps: true,
    toJSON: {
      versionKey: false,
    },
  },
);

export const getModel = (connection: Mongoose) => {
  if (!connection) {
    throw new Error('No connection');
  }
  return connection.model('boards', boardSchema);
};
