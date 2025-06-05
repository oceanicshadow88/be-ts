import { Mongoose } from 'mongoose';
import { IDailyScrum, IDailyScrumTimeStampModified } from '../types';
import * as User from '../model/user';
import * as DailyScrum from '../model/dailyScrum';
import * as Project from '../model/project';
import { Request } from 'express';
import * as Ticket from '../model/ticket';
import { replaceId } from './replaceService';
import { AppError } from '../error/appError';
import { GPT_MODEL, USER_ROLE } from '../config/openAi';
import { getDashboardCounts } from './dashboardService';
import { openai } from './openAiService';
import httpStatus from 'http-status';
const {
  removeDuplicateDate,
  convertTimestampToDate,
  removeDuplicateTimestamps,
} = require('../utils/dashboardDataTransformation');

export const findDailyScrums = async (
  findFilter: any,
  populateFilter: any,
  dbConnection: Mongoose,
) => {
  const dailyScrumModel = DailyScrum.getModel(dbConnection);
  const dailyScrums = await dailyScrumModel
    .find(findFilter)
    .populate({ path: 'userId', model: User.getModel(dbConnection) })
    .populate({ path: 'projectId', model: Project.getModel(dbConnection) })
    .populate(populateFilter);
  return dailyScrums;
};

export const findDailyScrumsByProjectAndUser = async (
  projectId: string,
  userId: string,
  dbConnection: Mongoose,
  userConnection: Mongoose,
) => {
  const dailyScrumModel = DailyScrum.getModel(dbConnection);
  const UserModel = User.getModel(userConnection);

  const dailyScrums: IDailyScrum[] = await dailyScrumModel
    .find({ project: projectId, user: userId }, { progresses: 1, title: 1 })
    .populate({ path: 'user', model: UserModel, select: ['name'] })
    .lean(); // use lean() to avoid toJSON method

  // filter the progresses of daily scrums to generate daily progresses
  const dailyScrumsWithFilteredProgresses: IDailyScrumTimeStampModified[] = dailyScrums.map(
    (dailyScrum: IDailyScrum) => {
      return {
        ...dailyScrum,
        progresses: removeDuplicateDate(
          convertTimestampToDate(removeDuplicateTimestamps(dailyScrum.progresses)).reverse(),
        ).reverse(),
      };
    },
  );

  return dailyScrumsWithFilteredProgresses;
};

export const showDailyScrum = async (req: Request) => {
  const { projectId } = req.params;
  const { userId } = req.query;
  const dailyScrumModel = DailyScrum.getModel(req.dbConnection);
  const userModel = await User.getModel(req.tenantsConnection);

  const results = await dailyScrumModel
    .find({ project: projectId, user: userId })
    .populate({
      path: 'user',
      model: userModel,
      select: 'name',
    })
    .populate({
      path: 'project',
      model: Project.getModel(req.dbConnection),
      select: ['name', 'key'],
    })
    .populate({
      path: 'ticket',
      model: Ticket.getModel(req.dbConnection),
      select: 'title',
    })
    .exec();

  return replaceId(results);
};

export const createDailyScrum = async (req: Request) => {
  const { projectId } = req.params;
  const newData = {
    ...req.body,
    ticket: req.body.ticketId,
    user: req.body.userId,
    project: projectId,
  };
  const DailyScrumModel = DailyScrum.getModel(req.dbConnection);

  const updatedDailyScrum = await DailyScrumModel.findOneAndUpdate(
    { ticket: req.body.ticketId },
    newData,
    {
      new: true,
    },
  ).exec();
  if (!updatedDailyScrum) {
    const newDailyScrum = new DailyScrumModel(newData);
    await newDailyScrum.save();
    return replaceId(newDailyScrum);
  }

  return replaceId(updatedDailyScrum);
};

export const updateDailyScrum = async (req: Request) => {
  const { dailyScrumId } = req.params;
  const { progress, ...rest } = req.body;

  const newDailyScrum = await DailyScrum.getModel(req.dbConnection).findByIdAndUpdate(
    dailyScrumId,
    {
      ...rest,
      $addToSet: { progresses: progress },
    },
    {
      new: true,
    },
  );
  if (!newDailyScrum) {
    throw new AppError('Daily Scrum not found', httpStatus.NOT_FOUND);
  }

  return replaceId(newDailyScrum);
};

export const deleteDailyScrum = async (req: Request) => {
  const { projectId } = req.params;
  const { ticketId } = req.query;

  await DailyScrum.getModel(req.dbConnection).deleteMany({
    projectId: projectId,
    ticket: ticketId,
  });
};

export const showDailyScrumsByProject = async (req: Request) => {
  const { projectId } = req.params;
  const { userId } = req.query;

  const result = await findDailyScrumsByProjectAndUser(
    projectId,
    userId as string,
    req.dbConnection,
    req.tenantsConnection,
  );

  return replaceId(result);
};

export const generatePDFByProject = async (req: Request) => {
  const { projectId } = req.params;

  const dashboardCounts = await getDashboardCounts(projectId, req.dbConnection);

  const response = await openai.createChatCompletion({
    model: GPT_MODEL,
    messages: [
      {
        role: USER_ROLE,
        content: `I am a business analyst and please help me generate a formal report based on the following data: ${JSON.stringify(
          dashboardCounts,
        )}`,
      },
    ],
  });

  return response?.data?.choices?.[0]?.message;
};
