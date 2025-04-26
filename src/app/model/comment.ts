import mongoose, { Types } from 'mongoose';

const commentsSchema = new mongoose.Schema(
  {
    ticketId: {
      ref: 'ticket',
      type: Types.ObjectId,
      required: true,
      trim: true,
    },
    sender: {
      ref: 'users',
      type: Types.ObjectId,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true },
);

const getModel = (connection: any) => {
  if (!connection) {
    throw new Error('No connection');
  }
  return connection.model('comments', commentsSchema);
};

export { getModel };
