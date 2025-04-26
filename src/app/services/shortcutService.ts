import { Request } from 'express';
import mongoose from 'mongoose';
import { URL } from 'url';
import * as project from '../model/project';
import { replaceId } from './replaceService';
import status from 'http-status';

const validateUrl = (url: string) => {
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
};

export const createShortcut = async (req: Request) => {
  const shortcutId = new mongoose.Types.ObjectId();
  const { id } = req.params;
  const { shortcutLink, name } = req.body;

  if (!validateUrl(shortcutLink)) {
    return { error: 'Invalid URL', status: status.FORBIDDEN };
  }

  const updatedProject = await project
    .getModel(req.dbConnection)
    .findByIdAndUpdate(
      { _id: id },
      { $push: { shortcut: [{ _id: shortcutId, shortcutLink, name }] } },
      { new: true },
    );

  const shortCut = updatedProject.shortcut.find(
    (data: any) => data._id.toString() === shortcutId.toString(),
  );

  if (shortCut) {
    return { data: replaceId(shortCut), status: status.OK };
  }

  return { error: 'Shortcut creation failed', status: status.CONFLICT };
};

export const updateShortcut = async (req: Request) => {
  const { projectId, shortcutId } = req.params;
  const { shortcutLink, name } = req.body;
  const updateShortcutFlag = await project.getModel(req.dbConnection).updateOne(
    { _id: projectId, 'shortcut._id': shortcutId },
    {
      $set: { 'shortcut.$.shortcutLink': shortcutLink, 'shortcut.$.name': name },
    },
  );
  if (updateShortcutFlag.modifiedCount === 1) {
    return true;
  } else {
    return false;
  }
};

export const deleteShortcut = async (req: Request) => {
  const { projectId, shortcutId } = req.params;
  const checkShortcutExist = await project
    .getModel(req.dbConnection)
    .find({ 'shortcut._id': shortcutId });
  if (checkShortcutExist.length === 0) {
    return { error: 'Not Found', status: status.NOT_FOUND };
  }
  const updatedProject = await project.getModel(req.dbConnection).updateOne(
    { _id: projectId },

    { $pull: { shortcut: { _id: shortcutId } } },
  );
  if (!updatedProject) {
    return { error: 'Not Found', status: status.NOT_ACCEPTABLE };
  } else {
    return { status: status.OK };
  }
};
