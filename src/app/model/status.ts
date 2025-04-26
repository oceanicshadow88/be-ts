import { Model, Mongoose, Schema, Document } from 'mongoose';

export interface IStatus {
  name: string;
  slug: string;
  order: number;
  tenant: Schema.Types.ObjectId;
  isDefault: boolean;
}

export type IStatusDocument = Document & IStatus;

/* TODO: 
  remove id only with tenantId
  unique based on slug + tenantId 
*/

const statusSchema = new Schema<IStatusDocument>(
  {
    name: {
      type: Schema.Types.String,
      required: true,
      trim: true,
    },
    slug: {
      type: Schema.Types.String,
      trim: true,
      required: true,
    },
    tenant: {
      type: Schema.Types.ObjectId,
      ref: 'tenants',
      require: true,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      versionKey: false,
    },
  },
);

type StatusModel = Model<IStatusDocument, {}, {}>;

export const getModel = (dbConnection: Mongoose): StatusModel => {
  if (!dbConnection) throw new Error('No connection');

  return dbConnection.model('statuses', statusSchema);
};
