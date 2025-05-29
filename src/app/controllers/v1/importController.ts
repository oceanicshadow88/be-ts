import { Request, Response } from 'express';
import httpStatus from 'http-status';
import * as importService from '../../services/importService';

export const importProjectByCsv = async (req: Request, res: Response): Promise<void> => {
  const input = req.file?.buffer || req.file?.path;
  if (!input) {
    res.status(httpStatus.BAD_REQUEST).json({ error: 'No file uploaded or invalid file path' });
    return;
  }

  try {
    await importService.processCsv(input, req.dbConnection, req.tenantId, req.ownerId);
    res.status(httpStatus.OK).json({ message: 'CSV processed successfully' });
  } catch (err) {
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ error: 'Failed to process CSV file' });
  }
};
