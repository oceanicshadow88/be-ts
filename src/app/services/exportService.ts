import { ticketSchema } from '../model/ticket';
import * as Ticket from '../model/ticket';
import mongoose from 'mongoose';
import { writeToString } from '@fast-csv/format';

export const getTicketExportFields = () => {
  return Object.keys(ticketSchema.paths)
    .filter(key => !['_id'].includes(key));
};

export const exportTicketsCsv = async (projectId: string, fields: string[], dbConnection: mongoose.Connection) => {
  const TicketModel = Ticket.getModel(dbConnection);
  const tickets = await TicketModel.find({ projectId }).lean();
  // 构造 fields 配置
  const fieldDefs = fields.map(key => ({ label: key, value: key }));
  return parse(tickets, { fields: fieldDefs });
};