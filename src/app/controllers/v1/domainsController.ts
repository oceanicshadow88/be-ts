import { Response, Request } from 'express';
import { shouldExcludeDomainList } from '../../utils/helper';
import { getDomain, getIsValidDomain } from '../../services/domainService';

export const index = (req: Request, res: Response) => {
  res.send(shouldExcludeDomainList(req.headers.origin));
};

export const getOwnerDomain = async (req: Request, res: Response) => {
  const result = await getDomain(req);
  res.send(result);
};

export const isValidDomain = async (req: Request, res: Response) => {
  const result = await getIsValidDomain(req);
  return res.send(result);
};
