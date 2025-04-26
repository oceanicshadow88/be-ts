import mongoose, { Mongoose, Types } from 'mongoose';

export interface IBoard {
  title: string;
  tenant: string;
  statuses: Types.ObjectId[];
  isPublic: boolean;
}

const retroBoardSchema = new mongoose.Schema<IBoard>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    tenant: {
      type: String,
    },
    statuses: [
      {
        type: Types.ObjectId,
        ref: 'retroStatuses',
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
  return connection.model('retroBoards', retroBoardSchema);
};
