import mongoose, { Types } from 'mongoose';

const retroItemSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
    },
    order: {
      type: Number,
    },
    tenant: {
      type: String,
      required: true,
      index: true,
    },
    sprint: {
      type: Types.ObjectId,
      ref: 'sprints',
      required: true,
      index: true,
    },
    status: {
      type: Types.ObjectId,
      ref: 'retroStatuses',
      required: true,
    },
  },
  { timestamps: true },
);

retroItemSchema.methods.toJSON = function () {
  const item = this;
  const itemObject = item.toObject();
  const id = itemObject._id;
  itemObject.id = id;
  delete itemObject._id;
  delete itemObject.__v;
  return itemObject;
};

export const getModel = (connection: any) => {
  if (!connection) {
    throw new Error('No connection');
  }
  return connection.model('retroItem', retroItemSchema);
};
