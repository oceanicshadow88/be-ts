import { Request } from 'express';
import { Mongoose, Types } from 'mongoose';
import * as Project from '../model/project';
import * as Board from '../model/board';
import * as Status from '../model/status';
import * as Role from '../model/role';
import * as User from '../model/user';
import * as RetroBoard from '../model/retroBoard';

import { getLabel } from './labelService';
import { getUserProjectRole } from './roleService';
import typeService from './typeService';
import { findSprints } from './sprintService';
import { getAllStatus } from './statusService';
import { getAllBoards } from './boardService';
import { init } from '../database/init';
import { getRetroBoards } from './retroBoardService';
import { getEpicByProject } from './epicService';
import { DEFAULT_STATUS } from '../database/seeders/statusSeeder';
//Typo error

const findOrCreteBoard = async (dbConnection: Mongoose, body: any, tenantId: string) => {
  const tenantObjectId = new Types.ObjectId(tenantId);
  const boardModel = Board.getModel(dbConnection);
  const existingBoard = await boardModel.findOne({
    isPublic: true,
    title: 'Default',
  });

  // If not found, create new one
  if (!existingBoard) {
    const board = await boardModel.create({
      title: 'Default',
      tenant: tenantObjectId,
      statuses: body.statuses,
    });
    return board;
  }

  return existingBoard;
};

const findOrCreateStatus = async (dbConnection: Mongoose, tenantId: string) => {
  const tenantObjectId: Types.ObjectId = new Types.ObjectId(tenantId);
  const statusModel = Status.getModel(dbConnection);
  const bulkOps = DEFAULT_STATUS.map((status) => ({
    updateOne: {
      filter: { slug: status.slug, tenant: tenantObjectId },
      update: { $setOnInsert: { ...status, ...{ tenant: tenantObjectId } } },
      upsert: true,
    },
  }));

  await statusModel.bulkWrite(bulkOps);
  const statuses = await statusModel.find({ tenant: tenantObjectId });

  return statuses;
};

export const initProject = async (
  body: any,
  ownerId: string | undefined,
  dbConnection: Mongoose,
  tenantId: string,
) => {
  const projectModel = Project.getModel(dbConnection);
  if (!body.name) throw new Error('name for project must be provided');
  if (!ownerId) throw new Error('ownerId is undefined');
  if (!body.projectLead) {
    throw new Error('Project Leader is not selected');
  }
  const RetroBoardModel = await RetroBoard.getModel(dbConnection);
  const defaultRetroBoard = await RetroBoardModel.findOne({ isPublic: true, title: 'Default' });

  const RoleModel = await Role.getModel(dbConnection);
  let initRoles = await RoleModel.find({});
  if (!initRoles || initRoles.length === 0) {
    init(dbConnection);
  }
  try {
    // init project
    const project = await projectModel.create({
      ...body,
      roles: initRoles,
      owner: ownerId,
      tenant: tenantId,
      defaultRetroBoard: defaultRetroBoard?.id,
    });
    const statuses = await findOrCreateStatus(dbConnection, tenantId);
    findOrCreteBoard(
      dbConnection,
      { name: body.name, statuses: statuses.map((doc) => doc._id) },
      tenantId,
    );
    return project;
  } catch (error: any) {
    throw new Error(error);
  }
};

export const updateProject = async (req: Request) => {
  if (!Types.ObjectId.isValid(req.params.id)) {
    throw new Error('Cannot find project');
  }
  const project = await Project.getModel(req.dbConnection).findByIdAndUpdate(
    new Types.ObjectId(req.params.id),
    req.body,
    { new: true },
  );
  if (!project) {
    throw new Error('Cannot find project');
  }
  return project;
};

export const projectDetails = async (req: Request) => {
  if (!Types.ObjectId.isValid(req.params.id)) {
    throw new Error('Cannot find project');
  }
  const projectModel = Project.getModel(req.dbConnection);
  const [labels, users, ticketTypes, sprints, statuses, boards, epics, details, retroBoards] =
    await Promise.all([
      getLabel(req),
      getUserProjectRole(req),
      typeService.getTicketType(req),
      findSprints(req.params.id, false, req.dbConnection),
      getAllStatus(req),
      getAllBoards(req),
      getEpicByProject(req.params.id, req.dbConnection),
      projectModel.findById(req.params.id),
      getRetroBoards(req),
    ]);
  return {
    labels,
    users,
    ticketTypes,
    sprints,
    statuses,
    boards,
    epics,
    details,
    retroBoards,
  };
};

export const deleteProject = (req: Request) => {
  if (!Types.ObjectId.isValid(req.params.id)) {
    throw new Error('Cannot find project');
  }
  Project.getModel(req.dbConnection)
    .findByIdAndUpdate(req.params.id, {
      isDelete: true,
    })
    .exec();
};

export const showProject = async (req: Request) => {
  const userModel = await User.getModel(req.tenantsConnection);
  const project = await Project.getModel(req.dbConnection)
    .findOne({ _id: req.params.id, isDelete: false })
    .populate({ path: 'projectLead', model: userModel })
    .populate({ path: 'owner', model: userModel });
  if (req.ownerId === req.userId) {
    return project;
  }

  const accessibleProjectIds =
    req.user?.projectsRoles?.map((pr: any) => pr.project.toString()) ?? [];
  if (!accessibleProjectIds.includes(req.params.id)) {
    return {};
  }
  return project;
};

export const getAllProjects = async (req: Request) => {
  const userModel = await User.getModel(req.tenantsConnection);
  const accessibleProjectIds =
    req.user?.projectsRoles?.map((pr: any) => pr.project.toString()) ?? [];

  const result =
    (await Project.getModel(req.dbConnection)
      .find({ isDelete: false, tenant: req.tenantId })
      .populate({ path: 'projectLead', model: userModel })
      .populate({ path: 'owner', model: userModel })) ?? [];

  if (req.ownerId === req.userId) {
    return result;
  }

  return result.filter((item: any) => accessibleProjectIds.includes(item._id.toString()));
};
