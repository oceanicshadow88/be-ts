import mongoose, { Types } from 'mongoose';
import * as Project from './project';
import { dataConnectionPool } from '../utils/dbContext';

export const ticketSchema = new mongoose.Schema(
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
      required: true,
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
    },
    rank: {
      type: String,
      required: true,
      index: true,
    },
    temp: {
      type: String,
    },
  },
  { timestamps: true },
);

async function assignTicketNumber(doc: any) {
  if (doc.project && doc.temp) {
    const project = await Project.getModel(dataConnectionPool[doc.temp]).findByIdAndUpdate(
      doc.project,
      { $inc: { ticketCounter: 1 } },
      { new: true, upsert: true },
    );
    doc.ticketNumber = project.ticketCounter;
    doc.temp = null;
  }
}

// For individual saves
ticketSchema.pre('save', async function (next) {
  if (!this.isNew) return next();
  await assignTicketNumber(this);
  next();
});

// For bulk inserts
ticketSchema.pre('insertMany', async function (next, docs) {
  for (const doc of docs) {
    await assignTicketNumber(doc);
  }
  next();
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
