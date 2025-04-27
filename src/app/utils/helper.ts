import { NextFunction, Response, Request } from 'express';
import config from '../config/app';

export const asyncHandler = (fn: any) => {
  return (req: Request, res: Response, next: NextFunction) => {
    return Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export const shouldExcludeDomainList = (host: string | undefined) => {
  if (!host) {
    return false;
  }
  if (config.environment.toLowerCase() === 'local') {
    return true;
  }
  const domains = [
    `https://www.${config.mainDomain}`,
    `https://dev.${config.mainDomain}`,
    `https://staging.${config.mainDomain}`,
    `https://uat.${config.mainDomain}`,
  ];

  return domains.some((domain) => host.includes(domain));
};

export function removeHttp(url: string | undefined) {
  if (!url) {
    return '';
  }
  return url.replace(/^https?:\/\//, '');
}

export function capitalizeFirstLetter(string: string) {
  if (!string) return ''; // Handle empty string
  return string.charAt(0).toUpperCase() + string.slice(1);
}
