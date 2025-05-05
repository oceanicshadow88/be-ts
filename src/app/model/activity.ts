import mongoose, { Types } from 'mongoose';

const activitySchema = new mongoose.Schema(
  {
    operation: { type: String, required: true, index: true },
    field: { type: String },
    prevValues: [{ type: String }],
    afterValues: [{ type: String }],
    user: { type: Types.ObjectId, ref: 'users' },
    ticket: { type: Types.ObjectId, ref: 'ticket' },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

activitySchema.methods.toJSON = function () {
  const activity = this;
  const activityObject = activity.toObject();
  const id = activityObject._id;
  activityObject.id = id;
  delete activityObject._id;
  delete activityObject.__v;
  return activityObject;
};

export const getModel = (connection: any) => {
  if (!connection) {
    throw new Error('No connection');
  }
  return connection.model('activities', activitySchema);
};
