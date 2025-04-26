import mongoose, { Model, Mongoose, Schema, Types } from 'mongoose';

export interface ILabel {
  name: string;
  slug: string;
  tenant: Types.ObjectId;
}

export type ILabelDocument = ILabel & Document;

export const labelSchema = new Schema<ILabelDocument>(
  {
    name: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: true,
    },
    tenant: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'tenants',
    },
  },
  { timestamps: true },
);

labelSchema.methods.toJSON = function () {
  const label = this;
  const labelObject = label.toObject();
  delete labelObject.__v;
  return labelObject;
};

export const getModel = (connection: Mongoose): Model<ILabelDocument> => {
  if (!connection) {
    throw new Error('No connection');
  }
  return connection.model('labels', labelSchema);
};
