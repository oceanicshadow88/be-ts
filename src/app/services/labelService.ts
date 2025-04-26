import { Request } from 'express';
const Label = require('../model/label');
const Ticket = require('../model/ticket');
import { Types } from 'mongoose';

export const getLabel = async (req: Request) => {
  const labelModel = Label.getModel(req.dbConnection);
  return labelModel.find({});
};

export const createLabel = async (req: Request) => {
  const labelModel = Label.getModel(req.dbConnection);

  let result = await labelModel.findOne({
    name: req.body.name,
    slug: req.body.slug,
    projectId: req.body.projectId,
    tenant: req.tenantId,
  });
  if (!result) {
    result = new labelModel({
      name: req.body.name,
      slug: req.body.slug,
      projectId: req.body.projectId,
      tenant: req.tenantId,
    });
    result.save();
  }
  return result;
};

export const deleteLabel = (req: Request) => {
  if (!Types.ObjectId.isValid(req.params.id)) {
    throw new Error('Invalid Id');
  }
  Label.getModel(req.dbConnection).findByIdAndRemove(req.params.id);
};

export const updateLabel = (req: Request) => {
  if (!Types.ObjectId.isValid(req.params.id)) {
    throw new Error('Invalid Id');
  }
  return Label.getModel(req.dbConnection).findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
};

export const removeByTicketId = async (req: Request) => {
  const { labelId, ticketId } = req.params;
  const ticketModel = Ticket.getModel(req.dbConnection);
  const ticket = await ticketModel.findById(ticketId);
  ticket.tags = await ticket.tags.filter((item: any) => {
    return item._id.toString() !== labelId;
  });
  return ticket.save();
};
