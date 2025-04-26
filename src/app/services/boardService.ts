/* eslint-disable @typescript-eslint/no-unused-vars */
import { Mongoose } from 'mongoose';
import * as Board from '../model/board';
import * as Ticket from '../model/ticket';
import * as User from '../model/user';
import { replaceId } from './replaceService';
import { Request } from 'express';

export const findTicketsByBoardId = async (
  sprintId: string,
  dbConnection: Mongoose,
  filter: any,
  tenantConnection: any,
) => {
  const ticketModel = Ticket.getModel(dbConnection);
  const UserFields = 'avatarIcon name email';
  const userModel = await User.getModel(tenantConnection);

  const tickets = await ticketModel.find({ ...filter, sprint: sprintId }).populate({
    path: 'assign',
    model: userModel,
    select: UserFields,
  });

  return tickets;
};

export const getBoard = async (req: Request) => {
  const { boardId } = req.params;
  const boardModel = Board.getModel(req.dbConnection);
  const board = await boardModel.findById(boardId).populate('statuses');
  return replaceId(board);
};

export const getAllBoards = async (req: Request) => {
  const boardModel = Board.getModel(req.dbConnection);
  const board = await boardModel.find({}).populate('statuses');
  return replaceId(board);
};
