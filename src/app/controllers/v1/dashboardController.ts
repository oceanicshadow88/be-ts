import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { generatePDFByProject, showDailyScrumsByProject } from '../../services/dailyScrumService';
import logger from 'winston';
import status from 'http-status';
import { showDashboard } from '../../services/dashboardService';
import { replaceId } from '../../services/replaceService';

export const show = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.error(errors);
    return res.sendStatus(status.UNPROCESSABLE_ENTITY);
  }
  const result = await showDashboard(req);
  return res.send(replaceId(result));
};

export const showDailyScrums = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.error(errors);
    return res.sendStatus(status.UNPROCESSABLE_ENTITY);
  }

  const result = showDailyScrumsByProject(req);
  return res.send(result);
};

export const generatePDF = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.error(errors);
    return res.sendStatus(status.UNPROCESSABLE_ENTITY);
  }

  const result = await generatePDFByProject(req);
  return res.send(result);
};
