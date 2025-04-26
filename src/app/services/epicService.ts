import { Request } from 'express';
import * as Epic from '../model/epic';
import * as Project from '../model/project';
import * as Ticket from '../model/ticket';
import mongoose from 'mongoose';

interface IEpicQuery {
  dbConnection: mongoose.Connection;
  id?: string;
  projectId?: string;
}

const createEpic = async (req: Request) => {
  const { project } = req.body;
  const epicModel = Epic.getModel(req.dbConnection);
  const projectModel = Project.getModel(req.dbConnection);
  const projectRes = await projectModel.findById(project);
  if (!project) {
    throw new Error('Project not found');
  }
  const epic = await epicModel.create({
    ...req.body,
    project: projectRes._id,
    tenant: req.tenantId,
    reporter: req.userId,
  });

  return epic;
};

const getEpicByProject = async (projectId: string, dbConnection: mongoose.Connection) => {
  const epicModel = Epic.getModel(dbConnection);
  const epic = await epicModel
    .find({
      project: projectId,
      isActive: true,
    })
    .exec();
  return epic;
};

const getEpicById = async ({ id, dbConnection }: IEpicQuery) => {
  const epicModel = Epic.getModel(dbConnection);
  const epic = await epicModel.findOne({ _id: id }).exec();
  if (!epic) {
    throw new Error(`Epic with ID ${id} not found`);
  }
  return epic;
};

const updateEpicById = async (req: Request) => {
  const { id } = req.params;
  const epicModel = Epic.getModel(req.dbConnection);
  const epic = await epicModel.findByIdAndUpdate(id, { $set: req.body }, { new: true }).exec();
  if (!epic) {
    throw new Error(`Epic with ID ${id} not found`);
  }
  return epic;
};

const deleteEpicById = async ({ id, dbConnection }: IEpicQuery) => {
  const epicModel = Epic.getModel(dbConnection);
  const ticketModel = Ticket.getModel(dbConnection);
  const epic = await epicModel.findByIdAndUpdate(id, { isActive: false }).exec();
  if (!epic) {
    throw new Error(`Epic with ID ${id} not found`);
  }
  // find tickets with this epic and update the epic id as null
  await ticketModel
    .updateMany({ epic: new mongoose.Types.ObjectId(id) }, { $set: { epic: null } })
    .exec();
};

export { createEpic, getEpicByProject, getEpicById, deleteEpicById, updateEpicById };
