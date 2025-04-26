import { Model, Mongoose, Schema, Document } from 'mongoose';

export interface IStatus {
  description: string;
  slug: string;
  tenant: string;
  isPublic: boolean;
}

type IRetroStatusDocument = Document & IStatus;

const retroStatusSchema = new Schema<IRetroStatusDocument>(
  {
    description: {
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
      type: String,
    },
    isPublic: { type: Boolean, require: true, default: false }, //if public cannot be deleted or update by company
  },
  {
    timestamps: true,
    toJSON: {
      versionKey: false,
    },
  },
);

type StatusModel = Model<IRetroStatusDocument, {}, {}>;

export const getModel = (dbConnection: Mongoose): StatusModel => {
  if (!dbConnection) throw new Error('No connection');

  return dbConnection.model('retroStatuses', retroStatusSchema);
};
