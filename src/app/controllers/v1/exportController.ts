import * as exportService from '../../services/exportService';
import { Request, Response } from 'express';


// 获取可导出字段列表
export const ticketExportFields = (req: Request, res: Response) => {
  const fields = exportService.getTicketExportFields();
  res.status(200).json(fields);
};

// 导出 CSV
export const exportTicketsCsv = async (req: Request, res: Response) => {
  const { projectId } = req.params;
  const fields = req.body.fields ?? (typeof req.query.fields === 'string' ? req.query.fields.split(',') : []) ?? [];
  const csv = await exportService.exportTicketsCsv(projectId, fields, req.dbConnection);
  res.header('Content-Type', 'text/csv');
  const fileName = `tickets_${projectId}_${Date.now()}.csv`;
  res.attachment(fileName);
  res.send(csv);
};