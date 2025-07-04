import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { generatePDFByProject, showDailyScrumsByProject } from '../../services/dailyScrumService';
import { showDashboard } from '../../services/dashboardService';
import { replaceId } from '../../services/replaceService';
import { ValidationError } from '../../error/AppError';

export const show = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ValidationError('Input validation failed.', errors.array());
  }
  const result = await showDashboard(req);
  return res.send(replaceId(result));
};

export const showDailyScrums = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ValidationError('Input validation failed.', errors.array());
  }

  const result = showDailyScrumsByProject(req);
  return res.send(result);
};

export const generatePDF = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ValidationError('Input validation failed.', errors.array());
  }

  const result = await generatePDFByProject(req);
  return res.send(result);
};
