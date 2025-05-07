import { ticketSchema } from '../model/ticket';
import * as Ticket from '../model/ticket';
import * as User from '../model/user';
import mongoose from 'mongoose';
import { format } from '@fast-csv/format';
import { Response } from 'express';

export const getTicketExportFields = () => {
  return Object.keys(ticketSchema.paths)
    .filter(key => !['_id'].includes(key));
};


export const exportTicketsCsvStream = async (
  projectId: string,
  fields: string[],
  dbConnection: mongoose.Connection,
  res: Response,
  tenantConnection: mongoose.Connection,
) => {
  const TicketModel = Ticket.getModel(dbConnection);
  const allFields = Object.keys(ticketSchema.paths).filter(key => !['_id'].includes(key));
  const exportFields = fields && fields.length > 0 ? fields : allFields;
  const csvStream = format({ headers: exportFields });
  csvStream.pipe(res);
  const userModel = await User.getModel(tenantConnection);
  const cursor = TicketModel
    .find({ project: projectId })
    .select(exportFields.join(' '))
    .populate({ path: 'reporter', select: 'email', model: userModel })
    .populate({ path: 'assign', select: 'email', model: userModel })
    .lean()
    .cursor();
  for await (const doc of cursor) {
    if (doc.reporter && typeof doc.reporter === 'object') {
      doc.reporter = doc.reporter.email ?? '';
    }
    if (doc.assign && typeof doc.assign === 'object') {
      doc.assign = doc.assign.email ?? '';
    }
    csvStream.write(doc);
  }
  csvStream.end();
};