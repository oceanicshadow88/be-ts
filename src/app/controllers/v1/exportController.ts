import * as exportService from '../../services/exportService';
import { Request, Response } from 'express';

export const exportTicketFields = (req: Request, res: Response) => {
  const fields = exportService.getTicketExportFields();
  res.status(200).json(fields);
};

export const exportTicketsCsv = async (req: Request, res: Response) => {
  const { projectId } = req.params;
  const tenantConnection = req.tenantsConnection;
  const fields =
    req.body.fields ??
    (typeof req.query.fields === 'string' ? req.query.fields.split(',') : []) ??
    [];
  res.header('Content-Type', 'text/csv');
  const fileName = `tickets_${projectId}_${Date.now()}.csv`;
  res.attachment(fileName);
  await exportService.exportTicketsCsvStream(
    projectId,
    fields,
    req.dbConnection,
    res,
    tenantConnection,
  );
};
