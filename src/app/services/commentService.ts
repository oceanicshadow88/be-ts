import { Request } from 'express';
import * as comment from '../model/comment';
import * as User from '../model/user';
import { replaceId } from '../services/replaceService';
import NotFoundError from '../error/notFound';

export const getComment = async (req: Request) => {
  const userModel = await User.getModel(req.tenantsConnection);
  const result = await comment
    .getModel(req.dbConnection)
    .find({ ticketId: req.params.id })
    .populate({ path: 'sender', model: userModel });
  return replaceId(result);
};

export const createComment = async (req: Request) => {
  const { ticketId, sender, content } = req.body;
  const newComment = await comment.getModel(req.dbConnection).create({
    ticketId,
    sender,
    content,
  });
  if (!newComment) {
    throw new NotFoundError('Comment not found');
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
    throw new NotFoundError('Not found');
  }
  return replaceId(updatedComment);
};

export const deleteComment = async (req: Request) => {
  const { id } = req.params;
  await comment.getModel(req.dbConnection).findByIdAndDelete({ _id: id });
  if (!deleteComment) {
    throw new NotFoundError('Not found');
  }
};
