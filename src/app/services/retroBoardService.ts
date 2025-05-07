import { Request } from 'express';
import * as RetroBoard from '../model/retroBoard';
import { replaceId } from '../services/replaceService';
import * as RetroStatus from '../model/retroStatus';

export const getRetroBoards = async (req: Request) => {
  const result = await RetroBoard.getModel(req.dbConnection)
    .find({})
    .populate({ path: 'statuses', model: RetroStatus.getModel(req.dbConnection) });
  return replaceId(result);
};

export const initGlobalRetro = async (dbConnection: any) => {
  const DEFAULT_STATUS = [
    {
      description: 'Went well',
      slug: 'to-do',
      isPublic: true,
    },
    {
      description: 'To Improve',
      slug: 'in-progress',
      isPublic: true,
    },
    {
      description: 'Discuss/Ideas',
      slug: 'review',
      isPublic: true,
    },
  ];

  const bulkOps = DEFAULT_STATUS.map((status) => ({
    updateOne: {
      filter: { slug: status.slug },
      update: { $setOnInsert: status },
      upsert: true,
    },
  }));

  const RetroBoardModel = RetroBoard.getModel(dbConnection);
  const RetroStatusModel = RetroStatus.getModel(dbConnection);
  await RetroStatusModel.bulkWrite(bulkOps);
  const statuses = await RetroStatusModel.find({});
  const result = new RetroBoardModel({
    title: 'Default',
    statuses: statuses.map((item) => item._id),
    isPublic: true,
  });
  await result.save();
  return result;
};
