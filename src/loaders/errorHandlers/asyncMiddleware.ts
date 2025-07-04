import { Request, Response, NextFunction } from 'express';

const asyncMiddleware = (fn: any) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch((e) => {
    next(e);
  });
};

export const globalAsyncErrorHandler = (router: any) => {
  router?.stack?.forEach((item: any) => {
    const { route } = item;
    route?.stack?.forEach((routeItem: any) => {
      routeItem.handle = asyncMiddleware(routeItem.handle);
    });
  });
  return router;
};
