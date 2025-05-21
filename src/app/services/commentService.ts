import { Request } from 'express';
import * as comment from '../model/comment';
import * as User from '../model/user';
import { replaceId } from '../services/replaceService';
import { AppError } from '../error/appError';
import httpStatus from 'http-status';
import { EntityError } from '../error/entityError';

export const getComment = async (req: Request) => {
  const userModel = await User.getModel(req.tenantsConnection);
  const result = await comment
    .getModel(req.dbConnection)
    .find({ ticket: req.params.id })
    .populate({ path: 'sender', model: userModel });
  return replaceId(result);
};

export const createComment = async (req: Request) => {
  const { ticket, sender, content } = req.body;
  const newComment = await comment.getModel(req.dbConnection).create({
    ticket,
    sender,
    content,
  });
  if (!newComment) {
    throw new AppError('Comment not found', httpStatus.NOT_FOUND);
  }
  return replaceId(newComment);
};

export const updateComment = async (req: Request) => {
  const { id } = req.params;
  const { content } = req.body;
  const updatedAt = Date.now();
  const updatedComment = await comment
    .getModel(req.dbConnection)
    .findByIdAndUpdate({ _id: id }, { content, updatedAt }, { new: true });
  if (!updatedComment) {
    throw new AppError('Not found', httpStatus.NOT_FOUND);
  }
  return replaceId(updatedComment);
};

export const deleteComment = async (req: Request) => {
  const { id } = req.params;
  await comment.getModel(req.dbConnection).findByIdAndDelete({ _id: id });
  if (!deleteComment) {
    throw new EntityError('Comment not found', httpStatus.NOT_FOUND);
  }
};
