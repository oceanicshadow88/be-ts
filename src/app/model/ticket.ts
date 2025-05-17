import mongoose, { CallbackWithoutResultAndOptionalError, Types } from 'mongoose';
import * as Project from './project';
import { dataConnectionPool } from '../utils/dbContext';

const ticketSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      index: true,
    },
    labels: [
      {
        type: Types.ObjectId,
        ref: 'labels',
      },
    ],
    comments: [
      {
        type: Types.ObjectId,
        ref: 'comments',
      },
    ],
    status: {
      type: Types.ObjectId,
      ref: 'statuses',
    },
    priority: {
      type: String,
      enum: ['Highest', 'High', 'Medium', 'Low', 'Lowest'],
      default: 'Medium',
    },
    project: {
      type: Types.ObjectId,
      ref: 'projects',
      required: true,
    },
    epic: {
      type: Types.ObjectId,
      ref: 'epic',
      default: null,
      index: true,
    },
    sprint: {
      type: Types.ObjectId,
      ref: 'sprints',
      default: null,
      index: true,
    },
    description: {
      type: String,
      trim: true,
    },
    storyPoint: {
      type: Number,
      default: 0,
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
    type: {
      type: Types.ObjectId,
      ref: 'types',
      require: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    attachmentUrls: {
      type: [String],
    },
    ticketNumber: {
      type: Number,
      require: true,
    },
    temp: {
      type: String,
    },
  },
  { timestamps: true },
);

ticketSchema.pre('save', async function (this: any, next: CallbackWithoutResultAndOptionalError) {
  if (!this.isNew) {
    next();
  }
  const MAX_RETRIES = 3;
  for (let i = 0; i < MAX_RETRIES; i++) {
    try {
      const project = await Project.getModel(dataConnectionPool[this.temp]).findByIdAndUpdate(
        this.project,
        { $inc: { ticketCounter: 1 } },
        { new: true, upsert: true },
      );
      this.ticketNumber = project.ticketCounter;
      this.temp = null;
      return next();
    } catch (err: any) {
      if (err.code === 11000 && i < MAX_RETRIES - 1) {
        // duplicate shortCode, retry
        continue;
      }
      throw err;
    }
  }
});

ticketSchema.methods.toJSON = function () {
  const ticket = this;
  const ticketObject = ticket.toObject();
  const id = ticketObject._id;
  ticketObject.id = id;
  delete ticketObject._id;
  delete ticketObject.__v;
  return ticketObject;
};

export const getModel = (connection: any) => {
  if (!connection) {
    throw new Error('No connection');
  }
  return connection.model('tickets', ticketSchema);
};
