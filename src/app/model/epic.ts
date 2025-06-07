import mongoose, { Types, Connection } from 'mongoose';

const epicSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    project: {
      type: Types.ObjectId,
      ref: 'projects',
      required: true,
      index:true,
    },
    tenant: {
      type: Types.ObjectId,
      ref: 'tenants',
      required: true,
      index:true,
    },

    color: {
      type: String,
      default:'#6a2add',
    },
    description: {
      type: String,
      trim: true,
    },
    startDate: {
      type: Date,
      default: null,
    },
    dueAt: {
      type: Date,
      default: null,
    },
    reporter: {
      type: Types.ObjectId,
      ref: 'users',
    },
    assign: {
      type: Types.ObjectId,
      ref: 'users',
      default: null,
    },
    isComplete: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    goal: {
      type: String,
    },
    currentEpic: {
      type: Boolean,
      default: false,
    },
    attachmentUrls: [
      {
        type: String,
      },
    ],

  }, 
  { timestamps: true },
); 

const getModel = (connection: Connection) => {
  if (!connection) {
    throw new Error('No connection');
  }
  return connection.model('epic', epicSchema);
};

export { getModel };