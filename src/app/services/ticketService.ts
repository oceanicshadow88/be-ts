import { Request } from 'express';
import * as Ticket from '../model/ticket';
import * as Type from '../model/type';
import * as Comment from '../model/comment';
import * as Label from '../model/label';
import * as User from '../model/user';
import * as Sprint from '../model/sprint';
import * as Activity from '../model/activity';
import * as Project from '../model/project';
import * as Epic from '../model/epic';
import { ActivityType, IChange, ITicket, ITicketDocument } from '../types';
import mongoose, { Mongoose, Types } from 'mongoose';
import escapeStringRegexp = require('escape-string-regexp');

export interface TicketFilter {
  title?: string;
  project?: string;
  assign?: string[] | 'unassigned';
  type?: string[];
  epic?: string[];
  tags?: string[];
  sprintId?: string | null;
  isActive?: boolean;
  _id?: string;
}

export const findTicketsV2 = async (
  filter: TicketFilter,
  dbConnection: Mongoose,
  tenantConnection: Mongoose,
) => {
  const TicketModel = Ticket.getModel(dbConnection);
  const TypeModel = Type.getModel(dbConnection);
  const LabelModel = Label.getModel(dbConnection);
  const CommentModel = Comment.getModel(dbConnection);
  const ProjectModel = Project.getModel(dbConnection);
  const userModel = await User.getModel(tenantConnection);

  const UserFields = 'avatarIcon name email';

  try {
    const mongoFilter: {
      project?: string;
      _id?: string;
      sprintId?: string | null;
      isActive?: boolean;
      title?: RegExp;
      assign?: null | { $in: string[] };
      type?: { $in: string[] };
      epic?: { $in: string[] };
      tags?: { $all: string[] };
    } = {};

    if (filter.project) mongoFilter.project = filter.project;
    if (filter._id) mongoFilter._id = filter._id;
    if (filter.sprintId !== undefined) mongoFilter.sprintId = filter.sprintId;
    if (filter.isActive !== undefined) mongoFilter.isActive = filter.isActive;

    if (filter.title) {
      const escapeRegex = escapeStringRegexp(filter.title);
      mongoFilter.title = new RegExp(escapeRegex, 'i');
    }

    if (filter.assign) {
      if (filter.assign === 'unassigned') {
        mongoFilter.assign = null;
      } else {
        mongoFilter.assign = { $in: filter.assign };
      }
    }

    if (filter.type?.length) {
      mongoFilter.type = { $in: filter.type };
    }

    if (filter.epic?.length) {
      mongoFilter.epic = { $in: filter.epic };
    }

    if (filter.tags?.length) {
      mongoFilter.tags = { $all: filter.tags };
    }

    const tickets = await TicketModel.find(mongoFilter)
      .populate({ path: 'type', model: TypeModel })
      .populate({
        path: 'labels',
        model: LabelModel,
        select: 'name slug',
      })
      .populate({
        path: 'reporter',
        model: userModel,
        select: UserFields,
      })
      .populate({
        path: 'assign',
        model: userModel,
        select: UserFields,
      })
      .populate({
        path: 'comments',
        model: CommentModel,
      })
      .populate({ path: 'project', model: ProjectModel })
      .sort({ createdAt: 1 });

    return tickets.filter((ticket: ITicket) => ticket.isActive === true);
  } catch (error: any) {
    throw new Error(`Error finding tickets: ${error.message}`);
  }
};

export const createTicket = async (req: Request) => {
  const { board, sprintId, projectId, project, epicId, ...restBody } = req.body;
  const ticketModel = Ticket.getModel(req.dbConnection);
  const sprintModel = Sprint.getModel(req.dbConnection);
  const epicModel = Epic.getModel(req.dbConnection);
  const sprintRes = await sprintModel.findById(sprintId);
  const epicRes = await epicModel.findById(epicId);
  const projectParams = projectId || project;
  const ticket = await ticketModel.create({
    ...restBody,
    board: board,
    project: projectParams,
    reporter: req.userId,
    sprint: sprintRes?._id,
    epic: epicRes?._id,
  });

  const newAcitivity = await Activity.getModel(req.dbConnection).create({
    userId: req.userId,
    ticketId: ticket._id,
    operation: ActivityType.CREATE,
  });

  if (!newAcitivity) {
    throw new Error('Create Activity failed');
  }

  const result = await findTicketsV2({ _id: ticket._id }, req.dbConnection, req.tenantsConnection);
  return result[0];
};

const comparePrimitives = (
  field: string,
  prevValue: string | number | Date | null | undefined,
  afterValue: string | number | Date | null | undefined,
) => {
  if (prevValue instanceof Date) {
    prevValue = prevValue.toISOString();
  }
  if (afterValue instanceof Date) {
    afterValue = afterValue.toISOString();
  }

  const prev = prevValue ? String(prevValue) : '';
  const after = afterValue ? String(afterValue) : '';

  if (prev !== after) {
    return {
      field,
      prevValues: prev ? [prev] : [],
      afterValues: after ? [after] : [],
    };
  }
};

const compareObjectNames = (
  field: string,
  prev: { _id: Types.ObjectId; name?: string } | null | undefined,
  after: { _id: Types.ObjectId; name?: string } | null | undefined,
): IChange | undefined => {
  const prevId = prev?._id?.toString() ?? '';
  const afterId = after?._id?.toString() ?? '';

  if (prevId !== afterId) {
    return {
      field,
      prevValues: prev?.name ? [prev.name] : [],
      afterValues: after?.name ? [after.name] : [],
    };
  }
};

const compareArrayOfNames = (
  field: string,
  prevArr: { name: string }[] = [],
  afterArr: { name: string }[] = [],
): IChange | undefined => {
  const prevNames = prevArr.map((x) => x.name).sort();
  const afterNames = afterArr.map((x) => x.name).sort();

  if (JSON.stringify(prevNames) !== JSON.stringify(afterNames)) {
    return {
      field,
      prevValues: prevNames,
      afterValues: afterNames,
    };
  }
};

const primitiveFields = [
  { label: 'Title', key: 'title' },
  { label: 'Description', key: 'description' },
  { label: 'Priority', key: 'priority' },
  { label: 'Story Point', key: 'storyPoint' },
  { label: 'Due At', key: 'dueAt' },
] as const;

const objectFields = [
  { label: 'Type', key: 'type' },
  { label: 'Status', key: 'status' },
  { label: 'Assign', key: 'assign' },
  { label: 'Sprint', key: 'sprint' },
] as const;

const arrayFields = [{ label: 'Labels', key: 'labels' }] as const;

const getDiffBetweenTickets = (
  prevTicket: ITicketDocument | null,
  newTicket: ITicketDocument | null,
): IChange[] => {
  if (!prevTicket || !newTicket) return [];

  const diffs: IChange[] = [];

  for (const { label, key } of primitiveFields) {
    const diff = comparePrimitives(label, prevTicket[key], newTicket[key]);
    if (diff) diffs.push(diff);
  }

  for (const { label, key } of objectFields) {
    const diff = compareObjectNames(label, prevTicket[key], newTicket[key]);
    if (diff) diffs.push(diff);
  }

  for (const { label, key } of arrayFields) {
    const diff = compareArrayOfNames(label, prevTicket[key], newTicket[key]);
    if (diff) diffs.push(diff);
  }

  return diffs;
};

export const updateTicket = async (req: Request) => {
  const { id } = req.params;
  const { sprintId, ...restBody } = req.body;
  restBody.sprint = sprintId;
  const TicketModel = Ticket.getModel(req.dbConnection);
  const UserModel = User.getModel(req.tenantsConnection);

  const previousTicket = await TicketModel.findById(id)
    .populate({ path: 'type', select: 'name' })
    .populate({ path: 'project', select: 'name' })
    .populate({ path: 'epic', select: 'name' })
    .populate({ path: 'labels', select: 'name' })
    .populate({ path: 'assign', select: 'name', model: UserModel })
    .populate({ path: 'sprint', select: 'name' })
    .populate({ path: 'status', select: 'name' });

  if (!previousTicket) return null;

  const updatedTicket = await TicketModel.findByIdAndUpdate(id, restBody, {
    new: true,
    runValidators: true,
  })
    .populate({ path: 'type', select: 'name' })
    .populate({ path: 'project', select: 'name' })
    .populate({ path: 'epic', select: 'name' })
    .populate({ path: 'labels', select: 'name' })
    .populate({ path: 'assign', select: 'name', model: UserModel })
    .populate({ path: 'sprint', select: 'name' })
    .populate({ path: 'status', select: 'name' });

  if (!updatedTicket) return null;

  const changes = getDiffBetweenTickets(previousTicket, updatedTicket);

  const newActivities = await Activity.getModel(req.dbConnection).insertMany(
    changes.map((change) => ({
      userId: req.userId,
      ticketId: id,
      operation: ActivityType.UPDATE,
      field: change.field,
      prevValues: change.prevValues,
      afterValues: change.afterValues,
    })),
  );
  if (!newActivities) {
    throw new Error('Create Activity failed');
  }

  const result = await findTicketsV2({ _id: id }, req.dbConnection, req.tenantsConnection);
  return result[0];
};

export const deleteTicket = async (req: Request) => {
  // delete ticket from Ticket collection
  const ticket = await Ticket.getModel(req.dbConnection).findOneAndDelete({
    _id: new mongoose.Types.ObjectId(req.params.id),
  });
  if (!ticket) return false;

  //delete ticket id from Sprint collection
  await Sprint.getModel(req.dbConnection).findByIdAndUpdate(ticket.sprint, {
    $pull: { ticketId: ticket.id },
  });

  return true;
};

export const toggleActive = async (req: Request) => {
  const { id } = req.params;

  const ticket = await Ticket.getModel(req.dbConnection).findOne({ _id: id });
  if (!ticket) {
    return null;
  }
  const isActive = !ticket.isActive;
  const updatedTicket = await Ticket.getModel(req.dbConnection).findOneAndUpdate(
    { _id: id },
    { isActive: isActive },
    { new: true },
  );
  return updatedTicket;
};

export const getTicketsByProject = async (req: Request) => {
  const { id } = req.params;
  const tickets = await Ticket.getModel(req.dbConnection)
    .find({ project: id })
    .populate({
      path: 'project',
      model: Project.getModel(req.dbConnection),
      select: 'key',
    })
    .sort({ createdAt: 1 })
    .exec();
  return tickets;
};

export const getTicketsByEpic = async (req: Request) => {
  const { epicId } = req.params;
  const tickets = await Ticket.getModel(req.dbConnection)
    .find({ epic: epicId })
    .populate({
      path: 'epic',
      model: Epic.getModel(req.dbConnection),
    })
    .sort({ createdAt: 1 })
    .exec();
  return tickets;
};

export const getShowTicket = (req: Request) => {
  return findTicketsV2({ _id: req.params.id }, req.dbConnection, req.tenantsConnection);
};
