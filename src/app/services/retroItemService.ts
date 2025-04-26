import { Request } from 'express';
import * as RetroItem from '../model/retroItem';
import { replaceId } from '../services/replaceService';

export const showRetroItems = async (req: Request) => {
  const result = await RetroItem.getModel(req.dbConnection).find({
    sprint: req.params.sprintId,
    tenant: req.tenantId,
  });
  return replaceId(result);
};

export const createRetroItem = async (req: Request) => {
  const retroItemModel = await RetroItem.getModel(req.dbConnection);
  const retroItem = new retroItemModel({
    ...req.body,
    ...{ sprint: req.params.sprintId },
    ...{ tenant: req.tenantId },
  });
  retroItem.save();
  return retroItem;
};

export const updateRetroItem = async (req: Request) => {
  const retroItem = await RetroItem.getModel(req.dbConnection).findByIdAndUpdate(req.params.id, {
    ...req.body,
  });
  retroItem.save();
  return retroItem;
};

export const deleteRetroItem = async (req: Request) => {
  const { id } = req.params;
  await RetroItem.getModel(req.dbConnection).findByIdAndDelete({ _id: id });
};
