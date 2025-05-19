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

/** Find tickets with given filters
 * @param dbConnection Mongoose
 * @param tenantConnection Mongoose
 * @param filters Filters to find tickets, must be in the format of {key: value}
 * @returns Document result
 */
export const findTickets = async (
  dbConnection: Mongoose,
  tenantConnection: Mongoose,
  ticketsFilter: Record<string, any>,
) => {
  try {
    const ticketModel = await Ticket.getModel(dbConnection);

    const typeModel = Type.getModel(dbConnection);

    const labelModel = Label.getModel(dbConnection);

    const UserFields = 'avatarIcon name email';

    const userModel = await User.getModel(tenantConnection);

    const commentModel = await Comment.getModel(dbConnection);

    const projectModel = await Project.getModel(dbConnection);

    const tickets = await ticketModel
      .find(ticketsFilter)
      .populate({ path: 'type', model: typeModel })
      .populate({
        path: 'labels',
        model: labelModel,
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
        model: commentModel,
      })
      .populate({ 
        path: 'project', 
        model: projectModel,
      })
      .sort({ createdAt: 1 });

    const activeTickets = tickets.filter((e: ITicket) => e.isActive === true);

    return activeTickets;
  } catch (error: any) {
    return error;
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
    temp: req.dbName,
  });

  const newActivity = await Activity.getModel(req.dbConnection).create({
    user: req.userId,
    ticket: ticket._id,
    operation: ActivityType.CREATE,
  });

  if (!newActivity) {
    throw new Error('Create Activity failed');
  }

  const result = await findTickets(req.dbConnection, req.tenantsConnection, { _id: ticket._id });
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
      user: req.userId,
      ticket: id,
      operation: ActivityType.UPDATE,
      field: change.field,
      prevValues: change.prevValues,
      afterValues: change.afterValues,
    })),
  );
  if (!newActivities) {
    throw new Error('Create Activity failed');
  }

  const result = await findTickets(req.dbConnection, req.tenantsConnection, { _id: id });
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
  return findTickets(req.dbConnection, req.tenantsConnection, { _id: req.params.id });
};
