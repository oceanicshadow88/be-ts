import * as mongoose from 'mongoose';
import { Types } from 'mongoose';

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    key: {
      type: String,
      required: true,
      trim: true,
    },
    projectLead: {
      ref: 'users',
      type: Types.ObjectId,
      required: true,
    },
    roles: [
      {
        type: Types.ObjectId,
        ref: 'roles',
      },
    ],
    owner: {
      ref: 'users',
      type: Types.ObjectId,
      required: true,
    },
    iconUrl: { type: String, required: false },
    details: { type: 'string', required: false },
    shortcut: [{ name: { type: String }, shortcutLink: { type: String } }],
    isDelete: {
      type: Boolean,
      default: false,
    },
    description: {
      type: String,
      trim: true,
    },
    websiteUrl: {
      type: String,
      trim: true,
    },
    tenant: {
      require: true,
      type: String,
    },
    defaultRetroBoard: {
      ref: 'retroBoards',
      type: Types.ObjectId,
    },
  },
  { timestamps: true },
);

const getModel = (connection: any) => {
  if (!connection) {
    throw new Error('No connection');
  }
  return connection.model('projects', projectSchema);
};

export { getModel };
