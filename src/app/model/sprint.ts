import mongoose, { Schema, Types } from 'mongoose';

export interface ISprint {
  name: string;
  startDate?: Date;
  endDate?: Date | null;
  description?: string;
  currentSprint?: boolean;
  isComplete?: boolean;
  project?: Types.ObjectId;
  sprintGoal?: string;
  board?: Types.ObjectId;
  retroBoard?: Types.ObjectId;
}

export type ISprintDocument = ISprint & mongoose.Document;

const sprintSchema = new Schema<ISprintDocument>(
  {
    name: {
      type: String,
      required: true,
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
      default: null,
    },
    description: {
      type: String,
    },
    currentSprint: {
      type: Boolean,
      default: false,
    },
    isComplete: {
      type: Boolean,
      default: false,
    },
    project: {
      ref: 'projects',
      type: Types.ObjectId,
    },
    sprintGoal: {
      type: String,
    },
    board: {
      ref: 'boards',
      type: Types.ObjectId,
    },
    retroBoard: {
      ref: 'retroBoards',
      type: Types.ObjectId,
    },
  },
  { timestamps: true },
);

sprintSchema.statics.findLatestSprint = async function (projectId: string) {
  const result = await this.findOne({ project: projectId, currentSprint: true });
  return result;
};

export const getModel = (connection: any) => {
  if (!connection) {
    throw new Error('No connection');
  }
  return connection.model('sprints', sprintSchema);
};
