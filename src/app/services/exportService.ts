import { ticketSchema } from '../model/ticket';
import * as Ticket from '../model/ticket';
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
) => {
  const TicketModel = Ticket.getModel(dbConnection);
  const csvStream = format({ headers: fields });
  csvStream.pipe(res);
  const cursor = TicketModel
    .find({ projectId })
    .select(fields.join(' '))
    .lean()
    .cursor();
  for await (const doc of cursor) {
    csvStream.write(doc);
  }
  csvStream.end();
};